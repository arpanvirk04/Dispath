package com.dispath.driverAndTracking_service.driver;

public class DriverOrderSummary {
    private String orderId;
    private String service;
    private String status;
    private String customerName;
    private String customerPhone;
    private String customerAddress;
    private String pickupAddress;
    private String dropoffAddress;
    private String priority;
    private String notes;

    public DriverOrderSummary(String orderId, String service, String status, String customerName, String customerPhone,
                              String customerAddress, String pickupAddress, String dropoffAddress,
                              String priority, String notes) {
        this.orderId = orderId;
        this.service = service;
        this.status = status;
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.customerAddress = customerAddress;
        this.pickupAddress = pickupAddress;
        this.dropoffAddress = dropoffAddress;
        this.priority = priority;
        this.notes = notes;
    }

    public String getOrderId() {
        return orderId;
    }

    public String getService() {
        return service;
    }

    public String getStatus() {
        return status;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public String getCustomerAddress() {
        return customerAddress;
    }

    public String getPickupAddress() {
        return pickupAddress;
    }

    public String getDropoffAddress() {
        return dropoffAddress;
    }

    public String getPriority() {
        return priority;
    }

    public String getNotes() {
        return notes;
    }
}
