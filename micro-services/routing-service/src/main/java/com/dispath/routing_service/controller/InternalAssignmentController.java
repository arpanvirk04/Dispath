package com.dispath.routing_service.controller;

import com.dispath.routing_service.service.RouteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/assignments")
public class InternalAssignmentController {

    private final RouteService routeService;

    public InternalAssignmentController(RouteService routeService) {
        this.routeService = routeService;
    }

    @GetMapping("/check")
    public ResponseEntity<Boolean> checkAssignment(@RequestParam String driverId,
            @RequestParam String routeId) {
        boolean assigned = routeService.isDriverAssignedToRoute(driverId, routeId);
        return ResponseEntity.ok(assigned);
    }
}
