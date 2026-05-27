package com.dispath.driverAndTracking_service.driver.remote;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "customerAndOrder-service", contextId = "customerClient", path = "/api/customers")
public interface CustomerClient {
    @GetMapping("/{id}")
    CustomerResponse getCustomerById(@PathVariable("id") String id);
}
