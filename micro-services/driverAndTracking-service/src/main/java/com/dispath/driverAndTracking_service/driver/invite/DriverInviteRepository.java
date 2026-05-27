package com.dispath.driverAndTracking_service.driver.invite;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface DriverInviteRepository extends MongoRepository<DriverInvite, String> {
    Optional<DriverInvite> findByToken(String token);
}
