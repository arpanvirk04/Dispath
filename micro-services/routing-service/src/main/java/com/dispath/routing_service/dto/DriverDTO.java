package com.dispath.routing_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DriverDTO {
    private String id;
    private String name;
    private String email;
    private String phone;
    private String licenceType;
    private String status;
}
