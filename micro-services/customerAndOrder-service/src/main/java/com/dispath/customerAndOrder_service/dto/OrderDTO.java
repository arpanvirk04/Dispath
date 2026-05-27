package com.dispath.customerAndOrder_service.dto;

import com.dispath.customerAndOrder_service.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
    private String customerId;
    private String pickupAddress;
    private String dropoffAddress;
    private Double pickupLat;
    private Double pickupLng;
    private Double dropoffLat;
    private Double dropoffLng;
    // Prototype fields from frontend
    private String service;
    private Integer serviceTime;
    private String priority;
    private String notes;
    private OrderStatus status;
}