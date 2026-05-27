package com.dispath.customerAndOrder_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddressValidationDTO {
    private boolean exact;
    private String displayName;
    private Double latitude;
    private Double longitude;
    private String street;
    private String city;
    private String state;
    private String postalCode;
    private String country;
}
