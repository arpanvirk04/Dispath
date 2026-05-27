package com.dispath.customerAndOrder_service.service;

import com.dispath.customerAndOrder_service.dto.OrderCaseDTO;
import com.dispath.customerAndOrder_service.entity.Order;
import com.dispath.customerAndOrder_service.entity.OrderCase;
import com.dispath.customerAndOrder_service.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class OrderCaseService {

    private final OrderRepository orderRepository;

    public OrderCaseService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public Order addCase(String orderId, OrderCaseDTO dto) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        OrderCase oc = new OrderCase(UUID.randomUUID().toString(), dto.getTitle(),
                dto.getDescription(), dto.getCreatedBy(), java.time.LocalDateTime.now());
        order.getCases().add(oc);
        order.touchUpdatedAt();
        return orderRepository.save(order);
    }

    public List<OrderCase> getCases(String orderId) {
        Optional<Order> order = orderRepository.findById(orderId);
        return order.map(Order::getCases).orElse(List.of());
    }
}
