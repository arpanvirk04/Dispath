package com.dispath.driver_tracking.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Feign client to consult routing-service for driver->route assignment checks.
 *
 * Assumptions:
 * - routing-service is registered in Eureka as "routing-service".
 * - Exposes GET /internal/assignments/check?driverId=...&routeId=... returning
 * boolean.
 * Adjust path as needed to match your actual routing-service API.
 */
@FeignClient(name = "routing-service")
public interface RoutingServiceClient {

    @GetMapping("/internal/assignments/check")
    Boolean isDriverAssignedToRoute(@RequestParam("driverId") String driverId,
            @RequestParam("routeId") String routeId);
}
