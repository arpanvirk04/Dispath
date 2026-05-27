package com.dispath.customerAndOrder_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDTO {
    @NotBlank
    private String name;
    @Email
    @NotBlank
    private String email;
    @NotBlank
    private String phone;
    @NotBlank
    private String address;
    @NotBlank
    private String city;
    private String state;
    @NotBlank
    private String postalCode;
    @NotBlank
    private String country;
    private Double latitude;
    private Double longitude;
    // optional opening hours map, keys: monday..friday, values: timing strings
    // (e.g. '24_hours', '08:00-17:00')
    private Map<String, String> openingHours;
}
