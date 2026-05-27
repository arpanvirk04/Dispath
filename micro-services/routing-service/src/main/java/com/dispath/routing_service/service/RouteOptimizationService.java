package com.dispath.routing_service.service;

import com.dispath.routing_service.dto.OrderDetailsResponse;
import com.dispath.routing_service.dto.RouteOptimizationResult;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RouteOptimizationService {

    private static final Logger LOG = LoggerFactory.getLogger(RouteOptimizationService.class);

    private final OrderClient orderClient;
    private final RestTemplate restTemplate;

    @Value("${routing.ors.api-key:}")
    private String apiKey;

    @Value("${routing.ors.base-url:https://api.openrouteservice.org}")
    private String baseUrl;

    @Value("${routing.ors.vehicle-profile:driving-car}")
    private String vehicleProfile;

    @Value("${routing.company.depot-lat:43.7283}")
    private double depotLat;

    @Value("${routing.company.depot-lng:-79.6067}")
    private double depotLng;

    public RouteOptimizationService(OrderClient orderClient, RestTemplate restTemplate) {
        this.orderClient = orderClient;
        this.restTemplate = restTemplate;
    }

    public RouteOptimizationResult optimizeRoute(List<String> orderIds) {
        return calculate(orderIds, true);
    }

    public RouteOptimizationResult summarizeRoute(List<String> orderIds) {
        return calculate(orderIds, false);
    }

    private RouteOptimizationResult calculate(List<String> orderIds, boolean optimizeSequence) {
        if (orderIds == null || orderIds.isEmpty())
            return RouteOptimizationResult.empty();
        ensureApiKey();

        List<OrderStop> stops = orderIds.stream()
                .map(this::loadOrderStop)
                .flatMap(Optional::stream)
                .collect(Collectors.toList());

        if (stops.isEmpty()) {
            return RouteOptimizationResult.empty();
        }

        try {
            LOG.info("Calculating ORS metrics (optimizeSequence={}) for {} stops", optimizeSequence, stops.size());
            List<String> orderedIds = new ArrayList<>(orderIds);
            List<OrderStop> orderedStops;

            if (optimizeSequence) {
                LOG.info("Calling ORS /optimization for {} jobs", stops.size());
                OrsOptimizationResponse optimizationResponse = callOptimization(stops);
                orderedIds = extractOrderSequence(optimizationResponse, stops, orderIds);
                orderedStops = reorderStops(orderedIds, stops);
            } else {
                orderedStops = reorderStops(orderedIds, stops);
            }

            if (LOG.isDebugEnabled()) {
                orderedStops.forEach(stop -> LOG.debug("Stop orderId={} lat={} lng={}", stop.orderId(), stop.latitude(),
                        stop.longitude()));
            }
            List<double[]> coordinates = buildCoordinateChain(orderedStops);
            LOG.info("Calling ORS /v2/directions with {} coordinates -> {}", coordinates.size(),
                    formatCoordinatesForLog(coordinates));
            OrsDirectionsResponse directionsResponse = callDirections(coordinates);
            LOG.info("Calling ORS /v2/matrix with {} locations", coordinates.size());
            OrsMatrixResponse matrixResponse = callMatrix(coordinates);

            double distanceMeters = directionsResponse != null && directionsResponse.getRoutes() != null
                    && !directionsResponse.getRoutes().isEmpty()
                            ? directionsResponse.getRoutes().get(0).getSummary().getDistance()
                            : 0d;
            double durationSeconds = directionsResponse != null && directionsResponse.getRoutes() != null
                    && !directionsResponse.getRoutes().isEmpty()
                            ? directionsResponse.getRoutes().get(0).getSummary().getDuration()
                            : 0d;
            // We currently don't consume the full route geometry; keep an empty list
            // placeholder to avoid deserialization issues when ORS returns encoded
            // polylines instead of GeoJSON coordinates.
            List<List<Double>> geometry = Collections.emptyList();

            double[][] distances = matrixResponse != null ? toArray(matrixResponse.getDistances()) : new double[0][0];
            double[][] durations = matrixResponse != null ? toArray(matrixResponse.getDurations()) : new double[0][0];
            List<Double> legDurations = extractSequentialDurations(durations);

            LOG.info("ORS summary distance={}km duration={}min", distanceMeters / 1000d, durationSeconds / 60d);
            return new RouteOptimizationResult(orderedIds, distanceMeters, durationSeconds, distances, durations,
                    geometry, legDurations);
        } catch (Exception ex) {
            System.err.printf("OpenRouteService optimization failed: %s%n", ex.getMessage());
            LOG.error("OpenRouteService optimization failed while processing stops {}: {}", orderIds, ex.getMessage(),
                    ex);
            return RouteOptimizationResult.empty();
        }
    }

    private List<OrderStop> reorderStops(List<String> orderedIds, List<OrderStop> originalStops) {
        if (CollectionUtils.isEmpty(orderedIds)) {
            return originalStops;
        }
        Map<String, OrderStop> lookup = originalStops.stream()
                .collect(Collectors.toMap(OrderStop::orderId, stop -> stop));
        List<OrderStop> ordered = new ArrayList<>();
        orderedIds.forEach(id -> {
            OrderStop stop = lookup.get(id);
            if (stop != null) {
                ordered.add(stop);
            }
        });
        originalStops.forEach(stop -> {
            if (!ordered.contains(stop)) {
                ordered.add(stop);
            }
        });
        return ordered;
    }

    private List<double[]> buildCoordinateChain(List<OrderStop> orderedStops) {
        List<double[]> coordinates = new ArrayList<>();
        coordinates.add(new double[] { depotLng, depotLat });
        orderedStops.forEach(stop -> coordinates.add(stop.toCoordinatePair()));
        coordinates.add(new double[] { depotLng, depotLat });
        return coordinates;
    }

    private List<String> extractOrderSequence(OrsOptimizationResponse response, List<OrderStop> stops,
            List<String> fallback) {
        if (response == null || response.getRoutes() == null || response.getRoutes().isEmpty()) {
            return fallback;
        }
        Map<Integer, String> jobToOrder = buildJobLookup(stops);
        List<String> result = new ArrayList<>();
        response.getRoutes().get(0).getSteps().forEach(step -> {
            if ("job".equalsIgnoreCase(step.getType())) {
                String orderId = jobToOrder.get(step.getId());
                if (orderId != null) {
                    result.add(orderId);
                }
            }
        });
        return result.isEmpty() ? fallback : result;
    }

    private Map<Integer, String> buildJobLookup(List<OrderStop> stops) {
        Map<Integer, String> lookup = new HashMap<>();
        for (int i = 0; i < stops.size(); i++) {
            lookup.put(i + 1, stops.get(i).orderId());
        }
        return lookup;
    }

    private Optional<OrderStop> loadOrderStop(String orderId) {
        try {
            OrderDetailsResponse order = orderClient.getOrder(orderId);
            if (order == null)
                return Optional.empty();
            Double lat = order.getDropoffLat() != null ? order.getDropoffLat() : order.getPickupLat();
            Double lng = order.getDropoffLng() != null ? order.getDropoffLng() : order.getPickupLng();
            if (lat == null || lng == null) {
                LOG.warn("Skipping order {} because coordinates are missing (lat={}, lng={})", orderId, lat, lng);
                return Optional.empty();
            }
            LOG.debug("Loaded order {} coordinates lat={} lng={}", orderId, lat, lng);
            return Optional.of(new OrderStop(orderId, lat, lng));
        } catch (Exception ex) {
            System.err.printf("Failed to load coordinates for order %s: %s%n", orderId, ex.getMessage());
            return Optional.empty();
        }
    }

    private OrsOptimizationResponse callOptimization(List<OrderStop> stops) {
        Map<String, Object> body = new HashMap<>();
        List<Map<String, Object>> jobs = new ArrayList<>();
        for (int i = 0; i < stops.size(); i++) {
            OrderStop stop = stops.get(i);
            int jobId = i + 1;
            Map<String, Object> job = new HashMap<>();
            job.put("id", jobId);
            job.put("service", 300);
            job.put("location", stop.toCoordinatePair());
            jobs.add(job);
        }
        Map<String, Object> vehicle = new HashMap<>();
        vehicle.put("id", 1);
        vehicle.put("profile", vehicleProfile);
        vehicle.put("start", new double[] { depotLng, depotLat });
        vehicle.put("end", new double[] { depotLng, depotLat });
        body.put("jobs", jobs);
        body.put("vehicles", Collections.singletonList(vehicle));

        ResponseEntity<OrsOptimizationResponse> response = restTemplate.exchange(
                baseUrl + "/optimization",
                HttpMethod.POST,
                httpEntity(body),
                OrsOptimizationResponse.class);
        return response.getBody();
    }

    private OrsDirectionsResponse callDirections(List<double[]> coordinates) {
        Map<String, Object> body = new HashMap<>();
        body.put("coordinates", coordinates);
        // Request full geometry but rely on ORS defaults; newer ORS versions no
        // longer support the deprecated "geometry_format" parameter.
        body.put("geometry", true);
        body.put("geometry_simplify", false);
        try {
            ResponseEntity<OrsDirectionsResponse> response = restTemplate.exchange(
                    baseUrl + "/v2/directions/" + vehicleProfile,
                    HttpMethod.POST,
                    httpEntity(body),
                    OrsDirectionsResponse.class);
            return response.getBody();
        } catch (Exception ex) {
            LOG.error("ORS /v2/directions failed for coordinates {}: {}", formatCoordinatesForLog(coordinates),
                    ex.getMessage());
            throw ex;
        }
    }

    private OrsMatrixResponse callMatrix(List<double[]> coordinates) {
        Map<String, Object> body = new HashMap<>();
        body.put("locations", coordinates);
        body.put("metrics", Arrays.asList("distance", "duration"));
        if (LOG.isDebugEnabled()) {
            LOG.debug("ORS matrix request body: {}", body);
        }
        ResponseEntity<OrsMatrixResponse> response = restTemplate.exchange(
                baseUrl + "/v2/matrix/" + vehicleProfile,
                HttpMethod.POST,
                httpEntity(body),
                OrsMatrixResponse.class);
        OrsMatrixResponse result = response.getBody();
        if (result != null && LOG.isDebugEnabled()) {
            LOG.debug("ORS matrix distances: {}", result.getDistances());
            LOG.debug("ORS matrix durations: {}", result.getDurations());
        }
        return result;
    }

    private HttpEntity<Map<String, Object>> httpEntity(Map<String, Object> body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", apiKey);
        return new HttpEntity<>(body, headers);
    }

    private void ensureApiKey() {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("OpenRouteService API key is not configured (routing.ors.api-key)");
        }
    }

    private double[][] toArray(List<List<Double>> source) {
        if (source == null)
            return new double[0][0];
        double[][] result = new double[source.size()][];
        for (int i = 0; i < source.size(); i++) {
            List<Double> row = source.get(i);
            double[] arr = new double[row.size()];
            for (int j = 0; j < row.size(); j++) {
                arr[j] = row.get(j);
            }
            result[i] = arr;
        }
        return result;
    }

    private String formatCoordinatesForLog(List<double[]> coordinates) {
        if (coordinates == null)
            return "[]";
        return coordinates.stream()
                .map(pair -> String.format("[%.6f, %.6f]", pair[0], pair[1]))
                .toList()
                .toString();
    }

    private List<Double> extractSequentialDurations(double[][] matrix) {
        if (matrix == null || matrix.length == 0)
            return Collections.emptyList();
        List<Double> legs = new ArrayList<>();
        for (int i = 0; i < matrix.length - 1; i++) {
            double[] row = matrix[i];
            double value = 0d;
            if (row != null && row.length > i + 1 && !Double.isNaN(row[i + 1])) {
                value = row[i + 1];
            }
            legs.add(value);
        }
        if (LOG.isDebugEnabled()) {
            LOG.debug("Sequential leg durations (seconds) derived from matrix: {}", legs);
        }
        return legs;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class OrsOptimizationResponse {
        private List<OrsRoute> routes;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class OrsRoute {
        private double distance;
        private double duration;
        private List<OrsStep> steps;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class OrsStep {
        private String type;
        private Integer id;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class OrsDirectionsResponse {
        private List<DirectionsRoute> routes;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class DirectionsRoute {
        private DirectionsSummary summary;
        // geometry is omitted as we don't currently use it and ORS may return an
        // encoded polyline string instead of a GeoJSON geometry object.
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class DirectionsSummary {
        private double distance;
        private double duration;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class OrsMatrixResponse {
        private List<List<Double>> distances;
        private List<List<Double>> durations;
    }
}
