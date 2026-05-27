package com.dispath.routing_service.dto;

import java.util.List;

public class DriverAssignmentUpdateRequest {
    private String routeId;
    private String routeName;
    private List<String> orderIds;

    public DriverAssignmentUpdateRequest() {}

    public DriverAssignmentUpdateRequest(String routeId, String routeName, List<String> orderIds) {
        this.routeId = routeId;
        this.routeName = routeName;
        this.orderIds = orderIds;
    }

    public String getRouteId() {
        return routeId;
    }

    public void setRouteId(String routeId) {
        this.routeId = routeId;
    }

    public String getRouteName() {
        return routeName;
    }

    public void setRouteName(String routeName) {
        this.routeName = routeName;
    }

    public List<String> getOrderIds() {
        return orderIds;
    }

    public void setOrderIds(List<String> orderIds) {
        this.orderIds = orderIds;
    }
}
