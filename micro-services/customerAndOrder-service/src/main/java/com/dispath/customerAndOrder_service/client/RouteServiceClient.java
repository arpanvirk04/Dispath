package com.dispath.customerAndOrder_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "routing-service", path = "/api/routes")
public interface RouteServiceClient {

    @DeleteMapping("/orders/{orderId}")
    void removeOrderFromRoutes(@PathVariable("orderId") String orderId);
}

