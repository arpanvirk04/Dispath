package com.dispath.routing_service.controller;

import com.dispath.routing_service.dto.DriverAssignmentRequest;
import com.dispath.routing_service.dto.DriverDTO;
import com.dispath.routing_service.dto.RouteDTO;
import com.dispath.routing_service.dto.RouteSummaryDTO;
import com.dispath.routing_service.dto.RouteOptimizationSummaryDTO;
import com.dispath.routing_service.entity.Route;
import com.dispath.routing_service.service.RouteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/routes")
public class RouteController {

    @Autowired
    private RouteService routeService;

    @GetMapping
    public ResponseEntity<List<Route>> getAll(@RequestParam(required = false) String date) {
        if (date != null) {
            return ResponseEntity.ok(routeService.getRoutesByDate(date));
        }
        return ResponseEntity.ok(routeService.getAllRoutes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Route> getById(@PathVariable String id) {
        Optional<Route> r = routeService.getRouteById(id);
        return r.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Route> create(@RequestBody RouteDTO dto) {
        Route created = routeService.createRoute(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        boolean deleted = routeService.deleteRoute(id);
        if (deleted)
            return ResponseEntity.noContent().build();
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{routeId}/orders/{orderId}")
    public ResponseEntity<RouteSummaryDTO> addOrder(@PathVariable String routeId, @PathVariable String orderId) {
        try {
            Route updated = routeService.addOrderToRoute(routeId, orderId);
            return ResponseEntity.ok(routeService.buildSummary(updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{routeId}/orders/batch")
    public ResponseEntity<Integer> addOrdersBatch(@PathVariable String routeId, @RequestBody RouteDTO dto) {
        try {
            int added = routeService.addMultipleOrdersToRoute(routeId, dto.getOrderIds());
            return ResponseEntity.ok(added);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{routeId}/orders/{orderId}")
    public ResponseEntity<RouteSummaryDTO> removeOrder(@PathVariable String routeId, @PathVariable String orderId) {
        try {
            Route updated = routeService.removeOrderFromRoute(routeId, orderId);
            return ResponseEntity.ok(routeService.buildSummary(updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/orders/{orderId}")
    public ResponseEntity<Void> removeOrderGlobally(@PathVariable String orderId) {
        routeService.removeOrderFromRoutes(orderId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/drivers")
    public ResponseEntity<List<DriverDTO>> getDrivers() {
        return ResponseEntity.ok(routeService.getAvailableDrivers());
    }

    @PutMapping("/{routeId}/driver")
    public ResponseEntity<Route> assignDriver(@PathVariable String routeId, @RequestBody DriverAssignmentRequest request) {
        if (request == null || request.getDriverId() == null || request.getDriverId().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        try {
            Route updated = routeService.assignDriver(routeId, request.getDriverId());
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{routeId}/optimize")
    public ResponseEntity<RouteOptimizationSummaryDTO> optimizeRoute(@PathVariable String routeId) {
        try {
            RouteOptimizationSummaryDTO summary = routeService.optimizeRoutePlan(routeId);
            return ResponseEntity.ok(summary);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED).build();
        }
    }
}
