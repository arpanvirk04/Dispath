package com.dispath.routing_service.service;

import com.dispath.routing_service.dto.OrderDetailsResponse;
import com.dispath.routing_service.dto.OrderStatusUpdateRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "customerAndOrder-service", path = "/api/orders")
public interface OrderClient {

    @GetMapping("/{orderId}")
    OrderDetailsResponse getOrder(@PathVariable("orderId") String orderId);

    @PutMapping("/{orderId}/status")
    void updateOrderStatus(@PathVariable("orderId") String orderId,
                           @RequestBody OrderStatusUpdateRequest request);
}
