package com.dispath.driverAndTracking_service.driver;

import com.dispath.driverAndTracking_service.driver.remote.CustomerClient;
import com.dispath.driverAndTracking_service.driver.remote.CustomerResponse;
import com.dispath.driverAndTracking_service.driver.remote.OrderCaseCreateRequest;
import com.dispath.driverAndTracking_service.driver.remote.OrderClient;
import com.dispath.driverAndTracking_service.driver.remote.OrderResponse;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class DriverService {

    private final DriverRepository repository;
    private final OrderClient orderClient;
    private final CustomerClient customerClient;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public DriverService(DriverRepository repository,
                         OrderClient orderClient,
                         CustomerClient customerClient) {
        this.repository = repository;
        this.orderClient = orderClient;
        this.customerClient = customerClient;
    }

    public Driver createDriver(Driver driver) {
        // Ensure id is null so Mongo generates one, or respect provided id
        if (driver.getId() != null && driver.getId().trim().isEmpty())
            driver.setId(null);
        return repository.save(driver);
    }

    public List<Driver> getAllDrivers() {
        return repository.findAll();
    }

    public Optional<Driver> getDriverById(String id) {
        return repository.findById(id);
    }

    public Optional<Driver> authenticate(String email, String rawPassword) {
        if (email == null || rawPassword == null) {
            return Optional.empty();
        }
        return repository.findByEmail(email)
                .filter(driver -> driver.getPasswordHash() != null
                        && passwordEncoder.matches(rawPassword, driver.getPasswordHash()));
    }

    public Driver updateAssignments(String driverId, String routeId, String routeName, List<String> orderIds) {
        Driver driver = repository.findById(driverId)
                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));
        driver.setCurrentRouteId(routeId);
        driver.setCurrentRouteName(routeName);
        driver.setCurrentOrderIds(orderIds != null ? orderIds : new java.util.ArrayList<>());
        return repository.save(driver);
    }

    public DriverAssignmentsResponse getAssignments(String driverId) {
        Driver driver = repository.findById(driverId)
                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));
        return new DriverAssignmentsResponse(driver.getCurrentRouteId(), driver.getCurrentRouteName(),
                driver.getCurrentOrderIds(), buildOrderSummaries(driver.getCurrentOrderIds()));
    }

    public List<DriverOrderSummary> buildOrderSummaries(List<String> orderIds) {
        List<DriverOrderSummary> summaries = new ArrayList<>();
        if (orderIds == null)
            return summaries;
        for (String orderId : orderIds) {
            try {
                OrderResponse order = orderClient.getOrderById(orderId);
                if (order == null)
                    continue;
                CustomerResponse customer = null;
                if (order.getCustomerId() != null) {
                    try {
                        customer = customerClient.getCustomerById(order.getCustomerId());
                    } catch (Exception ignored) {}
                }
                summaries.add(new DriverOrderSummary(
                        order.getId(),
                        order.getService(),
                        order.getStatus(),
                        customer != null ? customer.getName() : null,
                        customer != null ? customer.getPhone() : null,
                        customer != null ? customer.getAddress() : null,
                        order.getPickupAddress(),
                        order.getDropoffAddress(),
                        order.getPriority(),
                        order.getNotes()
                ));
            } catch (Exception ex) {
                System.err.printf("Failed to fetch order %s details: %s%n", orderId, ex.getMessage());
            }
        }
        return summaries;
    }

    public OrderResponse createOrderCase(String driverId, String orderId, DriverCaseRequest request) {
        if (request == null || request.getTitle() == null || request.getTitle().isBlank()) {
            throw new IllegalArgumentException("Case title is required");
        }
        Driver driver = repository.findById(driverId)
                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));
        List<String> assignedOrders = driver.getCurrentOrderIds();
        if (assignedOrders == null || assignedOrders.stream().noneMatch(orderId::equals)) {
            throw new IllegalArgumentException("Driver is not assigned to this order");
        }
        String createdBy = driver.getName();
        if (createdBy == null || createdBy.isBlank()) {
            createdBy = driver.getEmail() != null ? driver.getEmail() : driver.getId();
        }
        OrderCaseCreateRequest payload = new OrderCaseCreateRequest(
                request.getTitle().trim(),
                request.getDescription() != null ? request.getDescription().trim() : null,
                createdBy
        );
        return orderClient.createOrderCase(orderId, payload);
    }
}
