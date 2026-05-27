package com.dispath.routing_service.service;

import com.dispath.routing_service.dto.DriverAssignmentUpdateRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "driverAndTracking-service", path = "/api/drivers")
public interface DriverClient {

    @GetMapping
    java.util.List<com.dispath.routing_service.dto.DriverDTO> getDrivers();

    @GetMapping("/{driverId}")
    com.dispath.routing_service.dto.DriverDTO getDriverById(@PathVariable("driverId") String driverId);

    @PutMapping("/{driverId}/assignments")
    void updateDriverAssignments(@PathVariable("driverId") String driverId,
                                 @RequestBody DriverAssignmentUpdateRequest request);
}
