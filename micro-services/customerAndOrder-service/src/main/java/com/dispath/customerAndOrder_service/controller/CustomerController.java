package com.dispath.customerAndOrder_service.controller;

import com.dispath.customerAndOrder_service.dto.AddressSuggestionDTO;
import com.dispath.customerAndOrder_service.dto.AddressValidationDTO;
import com.dispath.customerAndOrder_service.dto.CustomerDTO;
import com.dispath.customerAndOrder_service.entity.Customer;
import com.dispath.customerAndOrder_service.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @GetMapping
    public ResponseEntity<List<Customer>> getAllCustomers() {
        List<Customer> customers = customerService.getAllCustomers();
        return ResponseEntity.ok(customers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(@PathVariable String id) {
        Optional<Customer> customer = customerService.getCustomerById(id);
        return customer.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Customer> createCustomer(@Valid @RequestBody CustomerDTO customerDTO) {
        try {
            Customer customer = customerService.createCustomer(customerDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(customer);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> updateCustomer(@PathVariable String id, @Valid @RequestBody CustomerDTO customerDTO) {
        Customer customer = customerService.updateCustomer(id, customerDTO);
        if (customer != null) {
            return ResponseEntity.ok(customer);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable String id) {
        boolean deleted = customerService.deleteCustomer(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Find customer by email
    @GetMapping("/email/{email}")
    public ResponseEntity<Customer> getCustomerByEmail(@PathVariable String email) {
        Optional<Customer> customer = customerService.getCustomerByEmail(email);
        return customer.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    // Search customers by name (case-insensitive contains)
    @GetMapping("/search")
    public ResponseEntity<List<Customer>> searchCustomers(@RequestParam String name) {
        List<Customer> customers = customerService.searchCustomersByName(name);
        return ResponseEntity.ok(customers);
    }

    // Bulk create customers
    @PostMapping("/bulk")
    public ResponseEntity<List<Customer>> createCustomersBulk(@RequestBody List<CustomerDTO> customerDTOs) {
        try {
            List<Customer> created = customerService.createCustomersBulk(customerDTOs);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/address-suggestions")
    public ResponseEntity<List<AddressSuggestionDTO>> getAddressSuggestions(@RequestParam String query) {
        if (query == null || query.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(customerService.getAddressSuggestions(query));
    }

    @GetMapping("/validate-address")
    public ResponseEntity<AddressValidationDTO> validateAddress(@RequestParam String query) {
        if (query == null || query.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(customerService.validateAddress(query));
    }
}
