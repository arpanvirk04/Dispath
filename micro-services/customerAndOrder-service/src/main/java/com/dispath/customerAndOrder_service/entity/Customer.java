package com.dispath.customerAndOrder_service.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Map;

@Document("customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Customer {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String phone;

    private String address;
    private String city;
    private String state;
    private String postalCode;
    private String country;

    private Double latitude;
    private Double longitude;

    // opening hours per weekday (monday..friday). Stored as map in MongoDB.
    private Map<String, String> openingHours;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public Customer(String name, String email, String phone, String address, String city, String state,
            String postalCode, String country, Double latitude, Double longitude) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.city = city;
        this.state = state;
        this.postalCode = postalCode;
        this.country = country;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public Customer(String name, String email, String phone, String address, String city, String state,
            String postalCode, String country, Double latitude, Double longitude,
            Map<String, String> openingHours) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.city = city;
        this.state = state;
        this.postalCode = postalCode;
        this.country = country;
        this.latitude = latitude;
        this.longitude = longitude;
        this.openingHours = openingHours;
    }

    public void touchUpdatedAt() {
        this.updatedAt = LocalDateTime.now();
    }
}
