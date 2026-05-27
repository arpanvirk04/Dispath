package com.dispath.driverAndTracking_service.driver.invite;

import com.dispath.driverAndTracking_service.driver.Driver;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/driver-invites")
public class DriverInviteController {

    private final DriverInviteService inviteService;

    public DriverInviteController(DriverInviteService inviteService) {
        this.inviteService = inviteService;
    }

    @PostMapping
    public ResponseEntity<DriverInviteResponse> createInvite(@RequestBody DriverInviteRequest request) {
        DriverInviteResponse response = inviteService.createInvite(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{token}")
    public ResponseEntity<DriverInvite> getInvite(@PathVariable String token) {
        return inviteService.getInviteByToken(token)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{token}/register")
    public ResponseEntity<Driver> registerDriver(@PathVariable String token,
                                                 @RequestBody DriverRegistrationRequest registrationRequest) {
        try {
            Driver driver = inviteService.registerDriver(token, registrationRequest);
            return ResponseEntity.ok(driver);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).build();
        }
    }
}
