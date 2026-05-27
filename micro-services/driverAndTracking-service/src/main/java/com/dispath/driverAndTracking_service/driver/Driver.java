package com.dispath.driverAndTracking_service.driver;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "drivers")
public class Driver {

    @Id
    private String id;
    private String name;
    private String email;
    private String phone;
    private String licenceType;
    private String status;
    private String passwordHash;
    private String currentRouteId;
    private String currentRouteName;
    private List<String> currentOrderIds = new ArrayList<>();

    public Driver() {
    }

    public Driver(String id, String name, String email, String phone, String licenceType) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.licenceType = licenceType;
        this.status = "active";
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getLicenceType() {
        return licenceType;
    }

    public void setLicenceType(String licenceType) {
        this.licenceType = licenceType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getCurrentRouteId() {
        return currentRouteId;
    }

    public void setCurrentRouteId(String currentRouteId) {
        this.currentRouteId = currentRouteId;
    }

    public String getCurrentRouteName() {
        return currentRouteName;
    }

    public void setCurrentRouteName(String currentRouteName) {
        this.currentRouteName = currentRouteName;
    }

    public List<String> getCurrentOrderIds() {
        return currentOrderIds;
    }

    public void setCurrentOrderIds(List<String> currentOrderIds) {
        this.currentOrderIds = currentOrderIds;
    }
}
