package com.dispath.customerAndOrder_service.entity;

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

    // store date as ISO string (yyyy-MM-dd) to match frontend
    private String date;

    // kilometers computed/estimated for the route
    private Double kilometers = 0.0;

    // list of customer IDs assigned to this route
    private List<String> customerIds = new ArrayList<>();

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public void touchUpdatedAt() {
        this.updatedAt = LocalDateTime.now();
    }

    public Route(String name, String date) {
        this.name = name;
        this.date = date;
        this.kilometers = 0.0;
        this.customerIds = new ArrayList<>();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
}
