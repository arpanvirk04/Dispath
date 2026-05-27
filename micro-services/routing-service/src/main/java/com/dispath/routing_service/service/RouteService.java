package com.dispath.routing_service.service;

import com.dispath.routing_service.dto.*;
import com.dispath.routing_service.entity.Route;
import com.dispath.routing_service.repository.RouteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class RouteService {

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private OrderClient orderClient;

    @Autowired
    private DriverClient driverClient;

    @Autowired
    private RouteOptimizationService optimizationService;

    public List<Route> getAllRoutes() {
        return routeRepository.findAll();
    }

    public boolean isDriverAssignedToRoute(String driverId, String routeId) {
        if (driverId == null || routeId == null)
            return false;
        return routeRepository.findById(routeId)
                .map(route -> driverId.equals(route.getDriverId()))
                .orElse(false);
    }

    public List<Route> getRoutesByDate(String date) {
        return routeRepository.findByDate(date);
    }

    public Optional<Route> getRouteById(String id) {
        return routeRepository.findById(id);
    }

    public Route createRoute(RouteDTO dto) {
        Route route = new Route(dto.getName(), dto.getDate());
        if (dto.getKilometers() != null)
            route.setKilometers(dto.getKilometers());
        if (dto.getOrderIds() != null)
            route.setOrderIds(new ArrayList<>(dto.getOrderIds()));
        route.setDriverId(dto.getDriverId());
        route.setDriverName(dto.getDriverName());
        return routeRepository.save(route);
    }

    public boolean deleteRoute(String id) {
        if (routeRepository.existsById(id)) {
            routeRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Route addOrderToRoute(String routeId, String orderId) {
        Optional<Route> r = routeRepository.findById(routeId);
        if (r.isEmpty())
            throw new IllegalArgumentException("Route not found");
        Route route = r.get();
        if (route.getOrderIds() == null)
            route.setOrderIds(new ArrayList<>());
        if (!route.getOrderIds().contains(orderId))
            route.getOrderIds().add(orderId);
        notifyOrderStatus(orderId, "ASSIGNED");
        Route saved = recalculateAndSave(route);
        syncDriverAssignments(saved);
        return saved;
    }

    public int addMultipleOrdersToRoute(String routeId, List<String> ids) {
        Optional<Route> r = routeRepository.findById(routeId);
        if (r.isEmpty())
            throw new IllegalArgumentException("Route not found");
        Route route = r.get();
        if (route.getOrderIds() == null)
            route.setOrderIds(new ArrayList<>());
        int added = 0;
        for (String id : ids) {
            if (!route.getOrderIds().contains(id)) {
                route.getOrderIds().add(id);
                added++;
                notifyOrderStatus(id, "ASSIGNED");
            }
        }
        recalculateAndSave(route);
        syncDriverAssignments(route);
        return added;
    }

    public Route removeOrderFromRoute(String routeId, String orderId) {
        Optional<Route> r = routeRepository.findById(routeId);
        if (r.isEmpty())
            throw new IllegalArgumentException("Route not found");
        Route route = r.get();
        if (route.getOrderIds() != null) {
            route.getOrderIds().removeIf(oid -> oid.equals(orderId));
        }
        Route saved = recalculateAndSave(route);
        notifyOrderStatus(orderId, "PENDING_ASSIGNMENT");
        syncDriverAssignments(saved);
        return saved;
    }

    public Route removeOrderFromRoutes(String orderId) {
        List<Route> routes = routeRepository.findAll();
        for (Route route : routes) {
            if (route.getOrderIds() != null && route.getOrderIds().contains(orderId)) {
                return removeOrderFromRoute(route.getId(), orderId);
            }
        }
        return null;
    }

    public List<com.dispath.routing_service.dto.DriverDTO> getAvailableDrivers() {
        try {
            return driverClient.getDrivers();
        } catch (Exception ex) {
            System.err.printf("Failed to fetch drivers: %s%n", ex.getMessage());
            return new ArrayList<>();
        }
    }

    public Route assignDriver(String routeId, String driverId) {
        Optional<Route> r = routeRepository.findById(routeId);
        if (r.isEmpty())
            throw new IllegalArgumentException("Route not found");
        Route route = r.get();
        DriverDTO driver;
        try {
            driver = driverClient.getDriverById(driverId);
        } catch (Exception ex) {
            throw new IllegalArgumentException("Driver not found");
        }
        if (driver == null)
            throw new IllegalArgumentException("Driver not found");
        route.setDriverId(driver.getId());
        route.setDriverName(driver.getName());
        route.touchUpdatedAt();
        Route saved = routeRepository.save(route);
        syncDriverAssignments(saved);
        return saved;
    }

    public RouteOptimizationSummaryDTO optimizeRoutePlan(String routeId) {
        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new IllegalArgumentException("Route not found"));
        RouteOptimizationResult result = optimizationService.optimizeRoute(route.getOrderIds());
        applyRouteMetrics(route, result, true);
        route.touchUpdatedAt();
        routeRepository.save(route);

        return RouteOptimizationSummaryDTO.builder()
                .routeId(route.getId())
                .orderedOrderIds(route.getOrderIds())
                .totalDistanceKm(route.getKilometers() != null ? route.getKilometers() : 0d)
                .totalDurationMinutes(route.getEstimatedDurationMinutes() != null ? route.getEstimatedDurationMinutes() : 0d)
                .distanceMatrix(result.getDistanceMatrix())
                .durationMatrix(result.getDurationMatrix())
                .build();
    }

    private void syncDriverAssignments(Route route) {
        if (route.getDriverId() == null)
            return;
        try {
            DriverAssignmentUpdateRequest request = new DriverAssignmentUpdateRequest(route.getId(), route.getName(), route.getOrderIds());
            driverClient.updateDriverAssignments(route.getDriverId(), request);
        } catch (Exception ex) {
            System.err.printf("Failed to sync driver %s assignments: %s%n", route.getDriverId(), ex.getMessage());
        }
    }

    private void notifyOrderStatus(String orderId, String status) {
        try {
            orderClient.updateOrderStatus(orderId, new OrderStatusUpdateRequest(status));
        } catch (Exception ex) {
            // Log and continue so local route changes aren't blocked by downstream issues
            System.err.printf("Failed to update order %s status to %s: %s%n", orderId, status, ex.getMessage());
        }
    }

    private Route recalculateAndSave(Route route) {
        if (route.getOrderIds() == null || route.getOrderIds().isEmpty()) {
            route.setKilometers(0.0);
            route.setEstimatedDurationMinutes(0.0);
            route.setGeometry(new ArrayList<>());
            route.setLegDurationsMinutes(new ArrayList<>());
            route.touchUpdatedAt();
            return routeRepository.save(route);
        }
        try {
            RouteOptimizationResult result = optimizationService.summarizeRoute(route.getOrderIds());
            applyRouteMetrics(route, result, false);
        } catch (IllegalStateException ex) {
            System.err.println(ex.getMessage());
        }
        route.touchUpdatedAt();
        return routeRepository.save(route);
    }

    private void applyRouteMetrics(Route route, RouteOptimizationResult result, boolean overwriteOrderIds) {
        if (result == null)
            return;
        if (overwriteOrderIds && !result.getOrderedOrderIds().isEmpty()) {
            route.setOrderIds(new ArrayList<>(result.getOrderedOrderIds()));
        }
        route.setKilometers(result.getDistanceMeters() / 1000d);
        route.setEstimatedDurationMinutes(result.getDurationSeconds() / 60d);
        route.setGeometry(copyGeometry(result.getGeometry()));
        route.setLegDurationsMinutes(convertLegDurations(result.getLegDurationsSeconds()));
    }

    public RouteSummaryDTO buildSummary(Route route) {
        if (route == null) return null;
        return RouteSummaryDTO.builder()
                .routeId(route.getId())
                .name(route.getName())
                .date(route.getDate())
                .driverId(route.getDriverId())
                .driverName(route.getDriverName())
                .orderIds(route.getOrderIds() != null ? new ArrayList<>(route.getOrderIds()) : new ArrayList<>())
                .totalDistanceKm(route.getKilometers() != null ? route.getKilometers() : 0d)
                .totalDurationMinutes(route.getEstimatedDurationMinutes() != null ? route.getEstimatedDurationMinutes() : 0d)
                .geometry(route.getGeometry() != null ? copyGeometry(route.getGeometry()) : new ArrayList<>())
                .legDurationsMinutes(route.getLegDurationsMinutes() != null ? new ArrayList<>(route.getLegDurationsMinutes()) : new ArrayList<>())
                .build();
    }

    private List<List<Double>> copyGeometry(List<List<Double>> source) {
        List<List<Double>> copy = new ArrayList<>();
        if (source == null) {
            return copy;
        }
        for (List<Double> point : source) {
            if (point == null) {
                continue;
            }
            copy.add(new ArrayList<>(point));
        }
        return copy;
    }

    private List<Double> convertLegDurations(List<Double> durationsSeconds) {
        List<Double> copy = new ArrayList<>();
        if (durationsSeconds == null) {
            return copy;
        }
        for (Double seconds : durationsSeconds) {
            double value = (seconds != null) ? seconds / 60d : 0d;
            copy.add(value);
        }
        return copy;
    }
}
