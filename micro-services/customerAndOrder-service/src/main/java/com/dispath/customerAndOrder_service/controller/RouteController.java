package com.dispath.customerAndOrder_service.controller;

import com.dispath.customerAndOrder_service.dto.RouteDTO;
import com.dispath.customerAndOrder_service.entity.Route;
import com.dispath.customerAndOrder_service.service.RouteService;
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

    @PostMapping("/{routeId}/customers/{customerId}")
    public ResponseEntity<Route> addCustomer(@PathVariable String routeId, @PathVariable String customerId) {
        try {
            Route updated = routeService.addCustomerToRoute(routeId, customerId);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{routeId}/customers/batch")
    public ResponseEntity<Integer> addCustomersBatch(@PathVariable String routeId, @RequestBody RouteDTO dto) {
        try {
            int added = routeService.addMultipleCustomersToRoute(routeId, dto.getCustomerIds());
            return ResponseEntity.ok(added);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{routeId}/customers/{customerId}")
    public ResponseEntity<Route> removeCustomer(@PathVariable String routeId, @PathVariable String customerId) {
        try {
            Route updated = routeService.removeCustomerFromRoute(routeId, customerId);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
