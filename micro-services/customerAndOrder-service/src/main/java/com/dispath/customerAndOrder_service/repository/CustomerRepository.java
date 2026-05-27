package com.dispath.customerAndOrder_service.repository;

import com.dispath.customerAndOrder_service.entity.Customer;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends MongoRepository<Customer, String> {

    // Find customer by email
    java.util.Optional<Customer> findByEmail(String email);

    // Search customers by name (case-insensitive contains)
    java.util.List<Customer> findByNameContainingIgnoreCase(String name);
}