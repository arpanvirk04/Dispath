package com.dispath.driverAndTracking_service.driver.invite;

import java.time.Instant;

public class DriverInviteResponse {
    private String token;
    private String email;
    private String name;
    private Instant expiresAt;
    private String inviteLink;

    public DriverInviteResponse() {}

    public DriverInviteResponse(String token, String email, String name, Instant expiresAt, String inviteLink) {
        this.token = token;
        this.email = email;
        this.name = name;
        this.expiresAt = expiresAt;
        this.inviteLink = inviteLink;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public String getInviteLink() {
        return inviteLink;
    }

    public void setInviteLink(String inviteLink) {
        this.inviteLink = inviteLink;
    }
}
