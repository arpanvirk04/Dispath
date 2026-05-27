package com.dispath.customerAndOrder_service.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document("orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    private String id;

    @Indexed
    private String customerId;

    private String pickupAddress;

    private String dropoffAddress;

    private Double pickupLat;
    private Double pickupLng;
    private Double dropoffLat;
    private Double dropoffLng;

    // Prototype/frontend fields to persist
    private String service;
    private Integer serviceTime;
    private String priority;
    private String notes;

    private OrderStatus status;

    private List<OrderCase> cases = new ArrayList<>();

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public Order(String customerId, String pickupAddress, String dropoffAddress,
            Double pickupLat, Double pickupLng, Double dropoffLat, Double dropoffLng) {
        this.customerId = customerId;
        this.pickupAddress = pickupAddress;
        this.dropoffAddress = dropoffAddress;
        this.pickupLat = pickupLat;
        this.pickupLng = pickupLng;
        this.dropoffLat = dropoffLat;
        this.dropoffLng = dropoffLng;
        this.service = null;
        this.serviceTime = 0;
        this.priority = "Medium";
        this.notes = null;
        this.status = OrderStatus.CREATED;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void touchUpdatedAt() {
        this.updatedAt = LocalDateTime.now();
    }
}
