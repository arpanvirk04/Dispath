package com.dispath.routing_service.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class RouteSummaryDTO {
    private String routeId;
    private String name;
    private String date;
    private String driverId;
    private String driverName;
    private List<String> orderIds;
    private double totalDistanceKm;
    private double totalDurationMinutes;
    private List<List<Double>> geometry;
    private List<Double> legDurationsMinutes;
}
