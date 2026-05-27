package com.dispath.customerAndOrder_service.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.Duration;
import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.Map;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Comparator;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

@Service
public class NominatimGeocodingService {

    private final RestTemplate restTemplate;
    private static final long MIN_REQUEST_INTERVAL_MS = 1100; // ~1 req/sec per Nominatim policy
    private long lastRequestMillis = 0L;
    private final Map<String, CacheEntry<List<NominatimResponse>>> cache = new ConcurrentHashMap<>();

    @Value("${geocoding.nominatim.base-url:https://nominatim.openstreetmap.org}")
    private String baseUrl;

    @Value("${geocoding.nominatim.user-agent:DisPath/1.0 (your-email@example.com)}")
    private String userAgent;

    @Value("${geocoding.nominatim.email:}")
    private String contactEmail;

    @Value("${geocoding.nominatim.referer:https://example.com/dispath}")
    private String referer;

    @Value("${geocoding.cache.ttl-seconds:86400}")
    private long cacheTtlSeconds; // default 24h

    public NominatimGeocodingService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Optional<GeoPoint> geocode(String query) {
        if (!StringUtils.hasText(query)) {
            return Optional.empty();
        }
        List<NominatimResponse> responses = search(query, 5);
        AddressQueryParts parts = parseAddress(query);
        responses = sortByRelevance(responses, parts);
        if (responses.isEmpty()) {
            return Optional.empty();
        }
        NominatimResponse first = responses.get(0);
        return Optional.of(new GeoPoint(first.getLat(), first.getLon()));
    }

    public List<AddressSuggestion> suggest(String query) {
        List<NominatimResponse> responses = search(query, 8);
        AddressQueryParts parts = parseAddress(query);
        responses = sortByRelevance(responses, parts);
        if (responses.isEmpty()) {
            return Collections.emptyList();
        }
        return responses.stream()
                .limit(5)
                .map(this::toSuggestion)
                .toList();
    }

    /**
     * Attempts to validate that the given free-form address is an exact/strong
     * match.
     * Returns the first candidate that satisfies strict matching rules across the
     * provided fields (postal code, city, province, street/house number).
     */
    public Optional<AddressSuggestion> validateExact(String query) {
        if (!StringUtils.hasText(query)) {
            return Optional.empty();
        }
        List<NominatimResponse> responses = search(query, 8);
        if (responses == null || responses.isEmpty()) {
            return Optional.empty();
        }
        AddressQueryParts parts = parseAddress(query);
        responses = sortByRelevance(responses, parts);
        for (NominatimResponse r : responses) {
            if (isExactMatch(r, parts)) {
                return Optional.of(toSuggestion(r));
            }
        }
        return Optional.empty();
    }

    private AddressSuggestion toSuggestion(NominatimResponse resp) {
        NominatimResponse.Address addr = resp.getAddress();
        return new AddressSuggestion(
                formatDisplay(resp),
                resp.getLat(),
                resp.getLon(),
                extractStreet(addr),
                extractCity(addr),
                extractState(addr),
                extractPostalCode(addr),
                extractCountry(addr)
        );
    }

    private List<NominatimResponse> search(String query, int limit) {
        try {
            // Cache key by query+limit
            String cacheKey = query.trim().toLowerCase() + "|" + limit;
            List<NominatimResponse> cached = getCached(cacheKey);
            if (cached != null) {
                return cached;
            }
            AddressQueryParts parts = parseAddress(query);
            URI uri = buildSearchUri(query, parts, limit);
            HttpHeaders headers = new HttpHeaders();
            headers.set(HttpHeaders.USER_AGENT, userAgent);
            headers.set(HttpHeaders.REFERER, referer);
            headers.set(HttpHeaders.ACCEPT_LANGUAGE, "en");
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            respectRateLimit();
            ResponseEntity<NominatimResponse[]> response = restTemplate.exchange(
                    uri,
                    HttpMethod.GET,
                    entity,
                    NominatimResponse[].class);
            NominatimResponse[] body = response.getBody();
            if (body == null || body.length == 0) {
                return Collections.emptyList();
            }
            List<NominatimResponse> list = Arrays.asList(body);
            putCache(cacheKey, list);
            return list;
        } catch (Exception ex) {
            System.err.printf("Nominatim request failed for \"%s\": %s%n", query, ex.getMessage());
            return Collections.emptyList();
        }
    }

    private URI buildSearchUri(String rawQuery, AddressQueryParts parts, int limit) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(baseUrl + "/search")
                .queryParam("format", "jsonv2")
                .queryParam("limit", limit)
                .queryParam("dedupe", 1)
                .queryParam("addressdetails", 1)
                .queryParam("autocomplete", 1)
                .queryParam("countrycodes", "ca");
        if (parts.isStructured()) {
            if (StringUtils.hasText(parts.street()))
                builder.queryParam("street", parts.street());
            if (StringUtils.hasText(parts.city()))
                builder.queryParam("city", parts.city());
            if (StringUtils.hasText(parts.state()))
                builder.queryParam("state", parts.state());
            if (StringUtils.hasText(parts.postcode()))
                builder.queryParam("postalcode", parts.postcode());
        } else {
            builder.queryParam("q", rawQuery);
        }
        if (StringUtils.hasText(contactEmail)) {
            builder.queryParam("email", contactEmail);
        }
        return builder.build().encode().toUri();
    }

    private synchronized void respectRateLimit() {
        long now = System.currentTimeMillis();
        long elapsed = now - lastRequestMillis;
        if (elapsed < MIN_REQUEST_INTERVAL_MS) {
            try {
                Thread.sleep(MIN_REQUEST_INTERVAL_MS - elapsed);
            } catch (InterruptedException ignored) {
                Thread.currentThread().interrupt();
            }
        }
        lastRequestMillis = System.currentTimeMillis();
    }

    public record GeoPoint(double latitude, double longitude) {
    }

    public record AddressSuggestion(String displayName, double latitude, double longitude,
                                    String street, String city, String state, String postalCode, String country) {
    }

    @Data
    private static class NominatimResponse {
        @JsonProperty("lat")
        private double lat;
        @JsonProperty("lon")
        private double lon;
        @JsonProperty("display_name")
        private String displayName;
        @JsonProperty("address")
        private Address address;

        @Data
        private static class Address {
            @JsonProperty("house_number")
            private String houseNumber;
            @JsonProperty("road")
            private String road;
            @JsonProperty("suburb")
            private String suburb;
            @JsonProperty("city_district")
            private String cityDistrict;
            @JsonProperty("town")
            private String town;
            @JsonProperty("city")
            private String city;
            @JsonProperty("municipality")
            private String municipality;
            @JsonProperty("county")
            private String county;
            @JsonProperty("state")
            private String state;
            @JsonProperty("postcode")
            private String postcode;
            @JsonProperty("country")
            private String country;
        }
    }

    private List<NominatimResponse> getCached(String key) {
        CacheEntry<List<NominatimResponse>> entry = cache.get(key);
        if (entry == null)
            return null;
        if (Instant.now().isAfter(entry.expiresAt())) {
            cache.remove(key);
            return null;
        }
        return entry.value();
    }

    private void putCache(String key, List<NominatimResponse> value) {
        Instant expires = Instant.now().plus(Duration.ofSeconds(cacheTtlSeconds));
        cache.put(key, new CacheEntry<>(value, expires));
    }

    private record CacheEntry<T>(T value, Instant expiresAt) {
    }

    // ---------- Helpers ----------
    private List<NominatimResponse> sortByRelevance(List<NominatimResponse> list, AddressQueryParts parts) {
        if (list == null || list.isEmpty())
            return list;
        return list.stream()
                .sorted(Comparator.comparingInt((NominatimResponse r) -> score(r, parts)).reversed())
                .toList();
    }

    private int score(NominatimResponse r, AddressQueryParts parts) {
        int s = 0;
        NominatimResponse.Address a = r.getAddress();
        if (a == null)
            return s;
        if (StringUtils.hasText(parts.postcode()) && parts.postcode().equalsIgnoreCase(n2e(a.getPostcode())))
            s += 50;
        String rc = firstNonEmpty(a.getCity(), a.getTown(), a.getMunicipality());
        if (StringUtils.hasText(parts.city()) && parts.city().equalsIgnoreCase(n2e(rc)))
            s += 20;
        if (StringUtils.hasText(parts.state())
                && normalizeProvince(parts.state()).equalsIgnoreCase(normalizeProvince(n2e(a.getState()))))
            s += 10;
        if (StringUtils.hasText(parts.street())) {
            String road = n2e(a.getRoad());
            if (!road.isEmpty()
                    && road.toLowerCase().contains(parts.street().toLowerCase().replaceAll("^\\d+\\s+", "")))
                s += 10;
        }
        return s;
    }

    private boolean isExactMatch(NominatimResponse r, AddressQueryParts parts) {
        NominatimResponse.Address a = r.getAddress();
        if (a == null)
            return false;

        // Postal code helps scoring but is not a hard requirement for an exact match.
        // Many Canadian addresses have multiple valid / overlapping postal codes in
        // different datasets, so we rely primarily on house/street/city/province
        // for exactness and let postal influence ranking instead.

        // City must match exactly if provided
        if (StringUtils.hasText(parts.city())) {
            String inputCity = normalizeToken(parts.city());
            String candCity = normalizeToken(firstNonEmpty(a.getCity(), a.getTown(), a.getMunicipality()));
            if (!inputCity.equalsIgnoreCase(candCity))
                return false;
        }

        // Province must match if provided (accept ON/Ontario equivalence)
        if (StringUtils.hasText(parts.state())) {
            String inProv = normalizeProvince(parts.state());
            String candProv = normalizeProvince(n2e(a.getState()));
            if (!inProv.equalsIgnoreCase(candProv))
                return false;
        }

        // Street/house number strict matching if provided
        if (StringUtils.hasText(parts.street())) {
            String input = parts.street().trim();
            String houseNum = null;
            String streetName = input;
            // Extract a leading house number if present
            Matcher hm = Pattern.compile("^(\\d+)\\s+(.*)$").matcher(input);
            if (hm.find()) {
                houseNum = hm.group(1);
                streetName = hm.group(2);
            }
            String candHouse = n2e(a.getHouseNumber());
            if (houseNum != null && !houseNumbersEqual(houseNum, candHouse))
                return false;

            String candRoad = n2e(a.getRoad());
            if (!streetNamesEquivalent(streetName, candRoad))
                return false;
        }
        return true;
    }

    private static boolean houseNumbersEqual(String a, String b) {
        if (a == null || b == null)
            return false;
        String na = a.trim().toLowerCase();
        String nb = b.trim().toLowerCase();
        return na.equals(nb);
    }

    private static boolean streetNamesEquivalent(String input, String candidate) {
        if (input == null)
            return true;
        if (candidate == null)
            return false;
        String normIn = normalizeStreet(input);
        String normCand = normalizeStreet(candidate);
        // Require that candidate contains the normalized input tokens
        return normCand.contains(normIn);
    }

    private static String normalizeStreet(String s) {
        String t = normalizeToken(s);
        // expand common abbreviations
        t = t.replaceAll("\\bst\\b", "street")
                .replaceAll("\\brd\\b", "road")
                .replaceAll("\\bave\\b", "avenue")
                .replaceAll("\\bav\\b", "avenue")
                .replaceAll("\\bblvd\\b", "boulevard")
                .replaceAll("\\bdr\\b", "drive")
                .replaceAll("\\bct\\b", "court")
                .replaceAll("\\bcir\\b", "circle")
                .replaceAll("\\bhwy\\b", "highway");
        return t;
    }

    private static String normalizeToken(String s) {
        if (s == null)
            return "";
        String t = s.toLowerCase().trim();
        t = t.replaceAll("[.,]", " ");
        t = t.replaceAll("\\s+", " ");
        return t;
    }

    private String extractStreet(NominatimResponse.Address address) {
        if (address == null)
            return "";
        String number = n2e(address.getHouseNumber());
        String road = n2e(address.getRoad());
        if (!number.isEmpty() && !road.isEmpty())
            return (number + " " + road).trim();
        return firstNonEmpty(road, number, address.getSuburb(), address.getCity());
    }

    private String extractCity(NominatimResponse.Address address) {
        if (address == null)
            return "";
        return firstNonEmpty(address.getCity(), address.getTown(), address.getMunicipality(),
                address.getCityDistrict(), address.getSuburb());
    }

    private String extractState(NominatimResponse.Address address) {
        if (address == null)
            return "";
        String raw = firstNonEmpty(address.getState(), address.getCounty());
        return abbreviateProvince(raw);
    }

    private String extractPostalCode(NominatimResponse.Address address) {
        if (address == null)
            return "";
        return n2e(address.getPostcode());
    }

    private String extractCountry(NominatimResponse.Address address) {
        if (address == null)
            return "";
        return n2e(address.getCountry());
    }

    private String formatDisplay(NominatimResponse r) {
        NominatimResponse.Address a = r.getAddress();
        if (a == null)
            return r.getDisplayName();
        String number = n2e(a.getHouseNumber());
        String road = n2e(a.getRoad());
        String city = firstNonEmpty(a.getCity(), a.getTown(), a.getMunicipality(), a.getSuburb());
        String state = abbreviateProvince(n2e(a.getState()));
        String postcode = n2e(a.getPostcode());
        String country = n2e(a.getCountry());
        StringBuilder sb = new StringBuilder();
        if (!number.isEmpty())
            sb.append(number).append(' ');
        sb.append(road);
        if (!city.isEmpty())
            sb.append(", ").append(city);
        if (!state.isEmpty())
            sb.append(", ").append(state);
        if (!postcode.isEmpty())
            sb.append(' ').append(postcode);
        if (!country.isEmpty())
            sb.append(", ").append(country);
        return sb.toString().trim();
    }

    private static String n2e(String s) {
        return s == null ? "" : s;
    }

    private static String firstNonEmpty(String... vals) {
        for (String v : vals) {
            if (v != null && !v.isBlank())
                return v;
        }
        return "";
    }

    private static String normalizeProvince(String s) {
        if (s == null)
            return "";
        String t = s.trim();
        if (t.equalsIgnoreCase("ON") || t.equalsIgnoreCase("Ontario"))
            return "Ontario";
        return t;
    }

    private static String abbreviateProvince(String s) {
        if (s == null)
            return "";
        String t = s.trim();
        if (t.equalsIgnoreCase("Ontario") || t.equalsIgnoreCase("ON"))
            return "ON";
        return t;
    }

    private AddressQueryParts parseAddress(String query) {
        if (!StringUtils.hasText(query))
            return AddressQueryParts.empty();
        String q = query.trim();
        Pattern pc = Pattern
                .compile("(?i)([ABCEGHJ-NPRSTVXY]\\d[ABCEGHJ-NPRSTV-Z])\\s?-?\\s?(\\d[ABCEGHJ-NPRSTV-Z]\\d)");
        Matcher m = pc.matcher(q);
        String postal = null;
        if (m.find())
            postal = (m.group(1) + m.group(2)).replaceAll("\\s", "");
        String[] parts = q.split(",");
        String street = parts.length > 0 ? parts[0].trim() : "";
        String city = parts.length > 1 ? parts[1].trim() : "";
        String province = parts.length > 2 ? parts[2].trim() : "";
        if (province.equalsIgnoreCase("ON") || province.equalsIgnoreCase("Ontario"))
            province = "Ontario";
        boolean structured = !street.isBlank() && (!city.isBlank() || StringUtils.hasText(postal));
        return new AddressQueryParts(structured, street, city, province, postal);
    }

    private record AddressQueryParts(boolean isStructured, String street, String city, String state, String postcode) {
        static AddressQueryParts empty() {
            return new AddressQueryParts(false, "", "", "", "");
        }
    }
}
