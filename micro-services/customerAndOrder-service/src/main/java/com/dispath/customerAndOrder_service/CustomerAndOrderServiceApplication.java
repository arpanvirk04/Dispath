package com.dispath.customerAndOrder_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class CustomerAndOrderServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(CustomerAndOrderServiceApplication.class, args);
	}

}
