package com.dispath.driver_tracking.service;

import com.dispath.driver_tracking.client.RoutingServiceClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple in-memory validator to check if a driver is currently assigned to a
 * given route.
 *
 * Notes:
 * - Replace this with a proper integration against your source of truth (e.g.,
 * routing-service or DB).
 * - Thread-safe via ConcurrentHashMap; suitable for a single instance in dev.
 */
@Service
public class AssignmentValidator {

    private static final Logger log = LoggerFactory.getLogger(AssignmentValidator.class);

    // driverId -> routeId mapping (local cache/fallback)
    private final Map<String, String> driverToRoute = new ConcurrentHashMap<>();
    private final RoutingServiceClient routingServiceClient;

    public AssignmentValidator(RoutingServiceClient routingServiceClient) {
        this.routingServiceClient = routingServiceClient;
    }

    /**
     * Returns true if the provided driverId is currently assigned to the given
     * routeId.
     */
    public boolean isDriverAssignedToRoute(String driverId, String routeId) {
        if (driverId == null || routeId == null)
            return false;
        try {
            Boolean remote = routingServiceClient.isDriverAssignedToRoute(driverId, routeId);
            if (remote != null)
                return remote;
        } catch (Exception ex) {
            log.warn("RoutingService check failed, falling back to local cache: {}", ex.getMessage());
        }
        // Fallback: local cache
        return routeId.equals(driverToRoute.get(driverId));
    }

    /**
     * Assign a driver to a route (replaces previous assignment).
     */
    public void assignDriverToRoute(String driverId, String routeId) {
        if (driverId == null || routeId == null)
            return;
        driverToRoute.put(driverId, routeId);
    }

    /**
     * Remove assignment for a driver.
     */
    public void unassignDriver(String driverId) {
        if (driverId == null)
            return;
        driverToRoute.remove(driverId);
    }
}
