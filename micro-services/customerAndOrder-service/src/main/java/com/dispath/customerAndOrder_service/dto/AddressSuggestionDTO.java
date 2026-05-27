package com.dispath.customerAndOrder_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AddressSuggestionDTO {
    private String displayName;
    private double latitude;
    private double longitude;
    private String street;
    private String city;
    private String state;
    private String postalCode;
    private String country;
}
