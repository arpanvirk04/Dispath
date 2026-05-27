package com.dispath.routing_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteDTO {
    private String id;
    private String name;
    private String date;
    private Double kilometers;
    private List<String> orderIds;
    private String driverId;
    private String driverName;
}
