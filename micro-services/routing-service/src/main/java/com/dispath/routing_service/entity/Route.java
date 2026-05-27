package com.dispath.routing_service.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document("routes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Route {

    @Id
    private String id;

    private String name;

    // ISO date string
    private String date;

    private Double kilometers = 0.0;
    private Double estimatedDurationMinutes = 0.0;

    // store order ids assigned to this route
    private List<String> orderIds = new ArrayList<>();

    private List<List<Double>> geometry = new ArrayList<>();

    private List<Double> legDurationsMinutes = new ArrayList<>();

    private String driverId;

    private String driverName;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public void touchUpdatedAt() {
        this.updatedAt = LocalDateTime.now();
    }

    public Route(String name, String date) {
        this.name = name;
        this.date = date;
        this.kilometers = 0.0;
        this.estimatedDurationMinutes = 0.0;
        this.orderIds = new ArrayList<>();
        this.geometry = new ArrayList<>();
        this.legDurationsMinutes = new ArrayList<>();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
}
