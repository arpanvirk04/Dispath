package com.dispath.driverAndTracking_service.driver;

import java.util.List;

public class DriverAssignmentsResponse {
    private String routeId;
    private String routeName;
    private List<String> orderIds;
    private List<DriverOrderSummary> orders;

    public DriverAssignmentsResponse(String routeId, String routeName, List<String> orderIds,
                                     List<DriverOrderSummary> orders) {
        this.routeId = routeId;
        this.routeName = routeName;
        this.orderIds = orderIds;
        this.orders = orders;
    }

    public String getRouteId() {
        return routeId;
    }

    public String getRouteName() {
        return routeName;
    }

    public List<String> getOrderIds() {
        return orderIds;
    }

    public List<DriverOrderSummary> getOrders() {
        return orders;
    }
}
