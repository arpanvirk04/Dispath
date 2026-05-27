package com.dispath.driverAndTracking_service.driver;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/drivers")
public class DriverController {

    private final DriverService service;

    public DriverController(DriverService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Driver> createDriver(@RequestBody Driver driver) {
        Driver created = service.createDriver(driver);
        return ResponseEntity.created(URI.create("/api/drivers/" + created.getId())).body(created);
    }

    @GetMapping
    public ResponseEntity<List<Driver>> getAllDrivers() {
        return ResponseEntity.ok(service.getAllDrivers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Driver> getDriverById(@PathVariable String id) {
        Optional<Driver> driver = service.getDriverById(id);
        return driver.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody DriverLoginRequest request) {
        if (request == null || request.getEmail() == null || request.getPassword() == null) {
            return ResponseEntity.badRequest().body("Email and password are required");
        }
        Optional<Driver> authenticated = service.authenticate(request.getEmail(), request.getPassword());
        if (authenticated.isPresent()) {
            Driver driver = authenticated.get();
            List<DriverOrderSummary> orders = service.buildOrderSummaries(driver.getCurrentOrderIds());
            DriverLoginResponse response = new DriverLoginResponse(
                    driver.getId(),
                    driver.getName(),
                    driver.getEmail(),
                    driver.getLicenceType(),
                    driver.getStatus(),
                    driver.getCurrentRouteId(),
                    driver.getCurrentRouteName(),
                    driver.getCurrentOrderIds(),
                    orders
            );
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
    }

    @PutMapping("/{id}/assignments")
    public ResponseEntity<DriverAssignmentsResponse> updateAssignments(@PathVariable String id,
                                                                       @RequestBody DriverAssignmentUpdateRequest request) {
        try {
            Driver updated = service.updateAssignments(id, request.getRouteId(), request.getRouteName(), request.getOrderIds());
            return ResponseEntity.ok(new DriverAssignmentsResponse(updated.getCurrentRouteId(), updated.getCurrentRouteName(),
                    updated.getCurrentOrderIds(), service.buildOrderSummaries(updated.getCurrentOrderIds())));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/assignments")
    public ResponseEntity<DriverAssignmentsResponse> getAssignments(@PathVariable String id) {
        try {
            return ResponseEntity.ok(service.getAssignments(id));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{driverId}/orders/{orderId}/cases")
    public ResponseEntity<?> createOrderCase(@PathVariable String driverId,
                                             @PathVariable String orderId,
                                             @RequestBody DriverCaseRequest request) {
        try {
            return ResponseEntity.ok(service.createOrderCase(driverId, orderId, request));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body("Failed to create case for order " + orderId);
        }
    }
}
