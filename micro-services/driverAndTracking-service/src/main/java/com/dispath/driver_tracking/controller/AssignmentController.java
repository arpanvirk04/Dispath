package com.dispath.driver_tracking.controller;

import com.dispath.driver_tracking.service.AssignmentValidator;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/driver-assignments")
public class AssignmentController {

    private final AssignmentValidator validator;

    public AssignmentController(AssignmentValidator validator) {
        this.validator = validator;
    }

    @PostMapping("/assign")
    public ResponseEntity<Void> assign(@RequestParam String driverId, @RequestParam String routeId) {
        validator.assignDriverToRoute(driverId, routeId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/unassign")
    public ResponseEntity<Void> unassign(@RequestParam String driverId) {
        validator.unassignDriver(driverId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/check")
    public ResponseEntity<Boolean> check(@RequestParam String driverId, @RequestParam String routeId) {
        return ResponseEntity.ok(validator.isDriverAssignedToRoute(driverId, routeId));
    }
}
