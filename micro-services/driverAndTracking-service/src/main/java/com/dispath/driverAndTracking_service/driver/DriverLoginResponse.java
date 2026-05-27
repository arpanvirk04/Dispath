package com.dispath.driverAndTracking_service.driver;

public class DriverLoginResponse {
    private String id;
    private String name;
    private String email;
    private String licenceType;
    private String status;
    private String currentRouteId;
    private String currentRouteName;
    private java.util.List<String> currentOrderIds;
    private java.util.List<DriverOrderSummary> orders;

    public DriverLoginResponse(String id, String name, String email, String licenceType, String status,
                               String currentRouteId, String currentRouteName, java.util.List<String> currentOrderIds,
                               java.util.List<DriverOrderSummary> orders) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.licenceType = licenceType;
        this.status = status;
        this.currentRouteId = currentRouteId;
        this.currentRouteName = currentRouteName;
        this.currentOrderIds = currentOrderIds;
        this.orders = orders;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getLicenceType() {
        return licenceType;
    }

    public String getStatus() {
        return status;
    }

    public String getCurrentRouteId() {
        return currentRouteId;
    }

    public java.util.List<String> getCurrentOrderIds() {
        return currentOrderIds;
    }

    public String getCurrentRouteName() {
        return currentRouteName;
    }

    public java.util.List<DriverOrderSummary> getOrders() {
        return orders;
    }
}
