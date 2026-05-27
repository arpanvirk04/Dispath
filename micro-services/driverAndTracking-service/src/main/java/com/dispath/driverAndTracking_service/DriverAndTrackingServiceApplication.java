package com.dispath.driverAndTracking_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication(scanBasePackages = {
		"com.dispath.driverAndTracking_service",
		"com.dispath.driver_tracking"
})
@EnableFeignClients(basePackages = {
		"com.dispath.driverAndTracking_service",
		"com.dispath.driver_tracking"
})
public class DriverAndTrackingServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(DriverAndTrackingServiceApplication.class, args);
	}

}