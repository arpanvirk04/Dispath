package com.dispath.customerAndOrder_service.dto;

public class OrderCaseDTO {
    private String title;
    private String description;
    private String createdBy;

    public OrderCaseDTO() {
    }

    public OrderCaseDTO(String title, String description, String createdBy) {
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
