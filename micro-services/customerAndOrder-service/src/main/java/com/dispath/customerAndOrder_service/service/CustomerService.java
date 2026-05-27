package com.dispath.customerAndOrder_service.service;

import com.dispath.customerAndOrder_service.client.RouteServiceClient;
import com.dispath.customerAndOrder_service.dto.AddressSuggestionDTO;
import com.dispath.customerAndOrder_service.dto.AddressValidationDTO;
import com.dispath.customerAndOrder_service.dto.CustomerDTO;
import com.dispath.customerAndOrder_service.entity.Customer;
import com.dispath.customerAndOrder_service.entity.Order;
import com.dispath.customerAndOrder_service.repository.CustomerRepository;
import com.dispath.customerAndOrder_service.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private NominatimGeocodingService geocodingService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private RouteServiceClient routeServiceClient;

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Optional<Customer> getCustomerById(String id) {
        return customerRepository.findById(id);
    }

    public Customer createCustomer(CustomerDTO customerDTO) {
        Customer customer = new Customer(
                customerDTO.getName(),
                customerDTO.getEmail(),
                customerDTO.getPhone(),
                customerDTO.getAddress(),
                customerDTO.getCity(),
                customerDTO.getState(),
                customerDTO.getPostalCode(),
                customerDTO.getCountry(),
                customerDTO.getLatitude(),
                customerDTO.getLongitude(),
                customerDTO.getOpeningHours());
        enrichCoordinates(customer);
        return customerRepository.save(customer);
    }

    public Customer updateCustomer(String id, CustomerDTO customerDTO) {
        Optional<Customer> existing = customerRepository.findById(id);
        if (existing.isPresent()) {
            Customer customer = existing.get();
            customer.setName(customerDTO.getName());
            customer.setEmail(customerDTO.getEmail());
            customer.setPhone(customerDTO.getPhone());
            customer.setAddress(customerDTO.getAddress());
            customer.setCity(customerDTO.getCity());
            customer.setState(customerDTO.getState());
            customer.setPostalCode(customerDTO.getPostalCode());
            customer.setCountry(customerDTO.getCountry());
            customer.setLatitude(customerDTO.getLatitude());
            customer.setLongitude(customerDTO.getLongitude());
            customer.setOpeningHours(customerDTO.getOpeningHours());
            enrichCoordinates(customer);
            return customerRepository.save(customer);
        }
        return null;
    }

    public boolean deleteCustomer(String id) {
        Optional<Customer> existing = customerRepository.findById(id);
        if (existing.isEmpty()) {
            return false;
        }

        List<Order> associatedOrders = orderRepository.findByCustomerId(id);
        for (Order order : associatedOrders) {
            try {
                routeServiceClient.removeOrderFromRoutes(order.getId());
            } catch (Exception ex) {
                System.err.printf("Failed to detach order %s from routes: %s%n", order.getId(), ex.getMessage());
            }
        }
        if (!associatedOrders.isEmpty()) {
            orderRepository.deleteAll(associatedOrders);
        }

        customerRepository.deleteById(id);
        return true;
    }

    public Optional<Customer> getCustomerByEmail(String email) {
        return customerRepository.findByEmail(email);
    }

    public List<Customer> searchCustomersByName(String name) {
        return customerRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Customer> createCustomersBulk(List<CustomerDTO> customerDTOs) {
        List<Customer> customers = new java.util.ArrayList<>();
        for (CustomerDTO dto : customerDTOs) {
            Customer customer = new Customer(
                    dto.getName(),
                    dto.getEmail(),
                    dto.getPhone(),
                    dto.getAddress(),
                    dto.getCity(),
                    dto.getState(),
                    dto.getPostalCode(),
                    dto.getCountry(),
                    dto.getLatitude(),
                    dto.getLongitude(),
                    dto.getOpeningHours());
            enrichCoordinates(customer);
            customers.add(customer);
        }
        return customerRepository.saveAll(customers);
    }

    public List<AddressSuggestionDTO> getAddressSuggestions(String query) {
        return geocodingService.suggest(query).stream()
                .map(s -> new AddressSuggestionDTO(
                        s.displayName(),
                        s.latitude(),
                        s.longitude(),
                        nullIfBlank(s.street()),
                        nullIfBlank(s.city()),
                        nullIfBlank(s.state()),
                        nullIfBlank(s.postalCode()),
                        nullIfBlank(s.country())
                ))
                .toList();
    }

    public AddressValidationDTO validateAddress(String query) {
        return geocodingService.validateExact(query)
                .map(s -> new AddressValidationDTO(
                        true,
                        s.displayName(),
                        s.latitude(),
                        s.longitude(),
                        nullIfBlank(s.street()),
                        nullIfBlank(s.city()),
                        nullIfBlank(s.state()),
                        nullIfBlank(s.postalCode()),
                        nullIfBlank(s.country())
                ))
                .orElseGet(() -> new AddressValidationDTO(false, null, null, null, null, null, null, null, null));
    }

    private void enrichCoordinates(Customer customer) {
        if (customer == null)
            return;
        boolean missingCoords = customer.getLatitude() == null || customer.getLongitude() == null;
        if (!missingCoords)
            return;
        String query = buildFullAddress(customer);
        geocodingService.geocode(query)
                .ifPresent(point -> {
                    customer.setLatitude(point.latitude());
                    customer.setLongitude(point.longitude());
                });
    }

    private String nullIfBlank(String value) {
        return (value == null || value.isBlank()) ? null : value;
    }

    private String buildFullAddress(Customer customer) {
        List<String> parts = List.of(
                customer.getAddress(),
                customer.getCity(),
                customer.getState(),
                customer.getPostalCode(),
                customer.getCountry());
        List<String> filtered = parts.stream()
                .filter(value -> value != null && !value.isBlank())
                .toList();
        return String.join(", ", filtered);
    }
}
