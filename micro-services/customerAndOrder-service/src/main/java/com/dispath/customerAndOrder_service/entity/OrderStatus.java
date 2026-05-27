package com.dispath.customerAndOrder_service.entity;

public enum OrderStatus {
    CREATED,
    PENDING_ASSIGNMENT,
    ASSIGNED,
    IN_TRANSIT,
    COMPLETED,
    CANCELLED
}