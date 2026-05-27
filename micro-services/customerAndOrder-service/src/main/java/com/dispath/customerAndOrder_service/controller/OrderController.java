package com.dispath.customerAndOrder_service.controller;

import com.dispath.customerAndOrder_service.dto.OrderDTO;
import com.dispath.customerAndOrder_service.dto.OrderStatusUpdateDTO;
import com.dispath.customerAndOrder_service.entity.Order;
import com.dispath.customerAndOrder_service.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders(@RequestParam(required = false) String customerId) {
        List<Order> orders;
        if (customerId != null) {
            orders = orderService.getOrdersByCustomerId(customerId);
        } else {
            orders = orderService.getAllOrders();
        }
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable String id) {
        Optional<Order> order = orderService.getOrderById(id);
        return order.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody OrderDTO orderDTO) {
        try {
            Order order = orderService.createOrder(orderDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Order> updateOrder(@PathVariable String id, @RequestBody OrderDTO orderDTO) {
        try {
            Order order = orderService.updateOrder(id, orderDTO);
            if (order != null) {
                return ResponseEntity.ok(order);
            }
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable String id) {
        boolean deleted = orderService.deleteOrder(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateOrderStatus(@PathVariable String id, @RequestBody OrderStatusUpdateDTO statusUpdate) {
        try {
            boolean updated = orderService.updateOrderStatus(id, statusUpdate.getStatus());
            if (updated) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
    }
}
