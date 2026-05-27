package com.dispath.customerAndOrder_service.controller;

import com.dispath.customerAndOrder_service.dto.OrderCaseDTO;
import com.dispath.customerAndOrder_service.entity.Order;
import com.dispath.customerAndOrder_service.service.OrderCaseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders/{orderId}/cases")
public class OrderCaseController {

    private final OrderCaseService caseService;

    public OrderCaseController(OrderCaseService caseService) {
        this.caseService = caseService;
    }

    @PostMapping
    public ResponseEntity<Order> addCase(@PathVariable String orderId,
                                         @RequestBody OrderCaseDTO dto) {
        return ResponseEntity.ok(caseService.addCase(orderId, dto));
    }

    @GetMapping
    public ResponseEntity<List<?>> getCases(@PathVariable String orderId) {
        return ResponseEntity.ok(caseService.getCases(orderId));
    }
}
