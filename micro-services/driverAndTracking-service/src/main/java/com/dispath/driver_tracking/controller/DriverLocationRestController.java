package com.dispath.driver_tracking.controller;

import com.dispath.driver_tracking.service.DriverLocationStore;
import com.dispath.driver_tracking.service.DriverLocationStore.LocationEntry;
import com.dispath.driver_tracking.service.AssignmentValidator;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/drivers")
public class DriverLocationRestController {

    private final DriverLocationStore locationStore;
    private final AssignmentValidator assignmentValidator;

    public DriverLocationRestController(DriverLocationStore locationStore, AssignmentValidator assignmentValidator) {
        this.locationStore = locationStore;
        this.assignmentValidator = assignmentValidator;
    }

    public static class LocationUpdate {
        public Double lat;
        public Double lng;
        public Long timestamp;
        public String routeId; // optional if provided as query param
    }

    @PostMapping("/{driverId}/location")
    public ResponseEntity<?> updateLocation(
            @PathVariable String driverId,
            @RequestParam(required = false) String routeId,
            @RequestBody LocationUpdate body) {
        if (body == null || body.lat == null || body.lng == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "lat and lng are required"));
        }
        String effectiveRouteId = routeId != null ? routeId : body.routeId;
        if (effectiveRouteId == null || effectiveRouteId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "routeId is required"));
        }

        // Gate by assignment if validator is available
        boolean assigned = assignmentValidator == null
                || assignmentValidator.isDriverAssignedToRoute(driverId, effectiveRouteId);
        if (!assigned) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Driver not assigned to route"));
        }

        long ts = body.timestamp != null ? body.timestamp : System.currentTimeMillis();
        LocationEntry saved = locationStore.update(driverId, effectiveRouteId, body.lat, body.lng, ts);
        return ResponseEntity.ok(Map.of(
                "driverId", saved.getDriverId(),
                "routeId", saved.getRouteId(),
                "lat", saved.getLat(),
                "lng", saved.getLng(),
                "timestamp", saved.getTimestamp()));
    }

    @GetMapping("/{driverId}/location")
    public ResponseEntity<?> getLocation(
            @PathVariable String driverId,
            @RequestParam(required = false) String routeId) {
        Optional<LocationEntry> opt = locationStore.get(driverId);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "No location for driver"));
        }
        LocationEntry entry = opt.get();
        if (routeId != null && !routeId.equals(entry.getRouteId())) {
            // Found a location but for a different route than requested
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "No location for driver on requested route"));
        }
        return ResponseEntity.ok(Map.of(
                "driverId", entry.getDriverId(),
                "routeId", entry.getRouteId(),
                "lat", entry.getLat(),
                "lng", entry.getLng(),
                "timestamp", entry.getTimestamp()));
    }
}
