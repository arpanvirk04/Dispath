package com.dispath.driverAndTracking_service.driver.invite;

import com.dispath.driverAndTracking_service.driver.Driver;
import com.dispath.driverAndTracking_service.driver.DriverRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Service
public class DriverInviteService {

    private final DriverInviteRepository inviteRepository;
    private final DriverRepository driverRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Value("${driver.invites.registration-url:https://localhost:5173/driver/onboard}")
    private String registrationBaseUrl;

    @Value("${driver.invites.expiry-hours:72}")
    private long expiryHours;

    @Value("${driver.invites.email-from:no-reply@dispath.com}")
    private String fromAddress;

    public DriverInviteService(DriverInviteRepository inviteRepository,
                               DriverRepository driverRepository,
                               JavaMailSender mailSender) {
        this.inviteRepository = inviteRepository;
        this.driverRepository = driverRepository;
        this.mailSender = mailSender;
    }

    public DriverInviteResponse createInvite(DriverInviteRequest request) {
        DriverInvite invite = new DriverInvite();
        invite.setEmail(request.getEmail());
        invite.setName(request.getName());
        invite.setPhone(request.getPhone());
        invite.setLicenceType(request.getLicenceType());
        invite.setToken(UUID.randomUUID().toString());
        invite.setExpiresAt(Instant.now().plus(expiryHours, ChronoUnit.HOURS));
        invite.setStatus("PENDING");
        inviteRepository.save(invite);

        String link = registrationBaseUrl + "?token=" + invite.getToken();
        System.out.printf("Driver invite link for %s: %s%n", invite.getEmail(), link);
        sendInviteEmail(invite, link);

        return new DriverInviteResponse(invite.getToken(), invite.getEmail(), invite.getName(), invite.getExpiresAt(), link);
    }

    public Optional<DriverInvite> getInviteByToken(String token) {
        return inviteRepository.findByToken(token);
    }

    public Driver registerDriver(String token, DriverRegistrationRequest registrationRequest) {
        DriverInvite invite = inviteRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invite not found"));
        if (!"PENDING".equalsIgnoreCase(invite.getStatus())) {
            throw new IllegalStateException("Invite already used or cancelled");
        }
        if (invite.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalStateException("Invite expired");
        }
        if (!StringUtils.hasText(registrationRequest.getPassword())) {
            throw new IllegalArgumentException("Password is required");
        }

        Driver driver = new Driver();
        driver.setName(StringUtils.hasText(registrationRequest.getName()) ? registrationRequest.getName() : invite.getName());
        driver.setEmail(invite.getEmail());
        driver.setPhone(StringUtils.hasText(registrationRequest.getPhone()) ? registrationRequest.getPhone() : invite.getPhone());
        driver.setLicenceType(StringUtils.hasText(registrationRequest.getLicenceType()) ? registrationRequest.getLicenceType() : invite.getLicenceType());
        driver.setStatus("active");
        driver.setPasswordHash(passwordEncoder.encode(registrationRequest.getPassword()));

        Driver saved = driverRepository.save(driver);

        invite.setStatus("USED");
        invite.setConsumedAt(Instant.now());
        inviteRepository.save(invite);

        return saved;
    }

    private void sendInviteEmail(DriverInvite invite, String link) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(invite.getEmail());
            message.setFrom(fromAddress);
            message.setSubject("You're invited to DisPath as a driver");
            message.setText(String.format("Hi %s,%n%nYou've been invited to join DisPath. Complete your registration here: %s%n%nThis link expires on %s.%n",
                    invite.getName() != null ? invite.getName() : "there",
                    link,
                    invite.getExpiresAt()));
            mailSender.send(message);
        } catch (Exception ex) {
            System.err.printf("Failed to send invite email to %s: %s%n", invite.getEmail(), ex.getMessage());
        }
    }
}
