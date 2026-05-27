package com.dispath.driverAndTracking_service.driver.remote;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "customerAndOrder-service", contextId = "orderClient", path = "/api/orders")
public interface OrderClient {
    @GetMapping("/{id}")
    OrderResponse getOrderById(@PathVariable("id") String id);

    @PostMapping("/{id}/cases")
    OrderResponse createOrderCase(@PathVariable("id") String id,
                                  @RequestBody OrderCaseCreateRequest request);
}
