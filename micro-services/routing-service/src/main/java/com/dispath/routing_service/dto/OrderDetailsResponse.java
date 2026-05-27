package com.dispath.routing_service.dto;

import lombok.Data;

@Data
public class OrderDetailsResponse {
    private String id;
    private Double pickupLat;
    private Double pickupLng;
    private Double dropoffLat;
    private Double dropoffLng;
    private String pickupAddress;
    private String dropoffAddress;
}

