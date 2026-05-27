package com.dispath.routing_service.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class RouteOptimizationSummaryDTO {
    private String routeId;
    private List<String> orderedOrderIds;
    private double totalDistanceKm;
    private double totalDurationMinutes;
    private double[][] distanceMatrix;
    private double[][] durationMatrix;
}

