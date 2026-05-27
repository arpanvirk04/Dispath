package com.dispath.driverAndTracking_service.driver;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DriverRepository extends MongoRepository<Driver, String> {
    java.util.Optional<Driver> findByEmail(String email);
}
