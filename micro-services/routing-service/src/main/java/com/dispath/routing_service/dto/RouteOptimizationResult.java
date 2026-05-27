package com.dispath.routing_service.dto;

import java.util.Collections;
import java.util.List;

public class RouteOptimizationResult {
    private final List<String> orderedOrderIds;
    private final double distanceMeters;
    private final double durationSeconds;
    private final double[][] distanceMatrix;
    private final double[][] durationMatrix;
    private final List<List<Double>> geometry;
    private final List<Double> legDurationsSeconds;

    public RouteOptimizationResult(List<String> orderedOrderIds,
                                   double distanceMeters,
                                   double durationSeconds,
                                   double[][] distanceMatrix,
                                   double[][] durationMatrix,
                                   List<List<Double>> geometry,
                                   List<Double> legDurationsSeconds) {
        this.orderedOrderIds = orderedOrderIds != null ? List.copyOf(orderedOrderIds) : Collections.emptyList();
        this.distanceMeters = distanceMeters;
        this.durationSeconds = durationSeconds;
        this.distanceMatrix = distanceMatrix;
        this.durationMatrix = durationMatrix;
        this.geometry = geometry != null ? geometry : Collections.emptyList();
        this.legDurationsSeconds = legDurationsSeconds != null ? List.copyOf(legDurationsSeconds) : Collections.emptyList();
    }

    public static RouteOptimizationResult empty() {
        return new RouteOptimizationResult(Collections.emptyList(), 0, 0, new double[0][0], new double[0][0], Collections.emptyList(), Collections.emptyList());
    }

    public List<String> getOrderedOrderIds() {
        return orderedOrderIds;
    }

    public double getDistanceMeters() {
        return distanceMeters;
    }

    public double getDurationSeconds() {
        return durationSeconds;
    }

    public double[][] getDistanceMatrix() {
        return distanceMatrix;
    }

    public double[][] getDurationMatrix() {
        return durationMatrix;
    }

    public List<List<Double>> getGeometry() {
        return geometry;
    }

    public List<Double> getLegDurationsSeconds() {
        return legDurationsSeconds;
    }
}
