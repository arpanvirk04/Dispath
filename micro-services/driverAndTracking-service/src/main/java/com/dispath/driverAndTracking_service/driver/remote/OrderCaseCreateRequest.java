package com.dispath.driverAndTracking_service.driver.remote;

public class OrderCaseCreateRequest {
    private String title;
    private String description;
    private String createdBy;

    public OrderCaseCreateRequest() {
    }

    public OrderCaseCreateRequest(String title, String description, String createdBy) {
        this.title = title;
        this.description = description;
        this.createdBy = createdBy;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
}
