package com.dispath.customerAndOrder_service.service;

import com.dispath.customerAndOrder_service.dto.OrderDTO;
import com.dispath.customerAndOrder_service.entity.Customer;
import com.dispath.customerAndOrder_service.entity.Order;
import com.dispath.customerAndOrder_service.entity.OrderStatus;
import com.dispath.customerAndOrder_service.repository.CustomerRepository;
import com.dispath.customerAndOrder_service.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OrderService {
    private static final String COMPANY_DEPOT_ADDRESS = "205 Humber College Blvd., Toronto, ON, M9W 5L7";
    private static final double COMPANY_DEPOT_LAT = 43.7283;
    private static final double COMPANY_DEPOT_LNG = -79.6067;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CustomerRepository customerRepository;

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getOrdersByCustomerId(String customerId) {
        return orderRepository.findByCustomerId(customerId);
    }

    public Optional<Order> getOrderById(String id) {
        return orderRepository.findById(id);
    }

    public Order createOrder(OrderDTO orderDTO) {
        Optional<Customer> customerOpt = customerRepository.findById(orderDTO.getCustomerId());
        if (customerOpt.isEmpty()) {
            throw new IllegalArgumentException("Customer not found");
        }
        Customer customer = customerOpt.get();
        String dropoffAddress = orderDTO.getDropoffAddress() != null
                ? orderDTO.getDropoffAddress()
                : buildCustomerFullAddress(customer);
        Double dropoffLat = orderDTO.getDropoffLat() != null ? orderDTO.getDropoffLat() : customer.getLatitude();
        Double dropoffLng = orderDTO.getDropoffLng() != null ? orderDTO.getDropoffLng() : customer.getLongitude();
        Order order = new Order(
                orderDTO.getCustomerId(),
                orderDTO.getPickupAddress(),
                dropoffAddress,
                orderDTO.getPickupLat(),
                orderDTO.getPickupLng(),
                dropoffLat,
                dropoffLng);
        applyCompanyDepotPickup(order);
        // set prototype fields if provided
        order.setService(orderDTO.getService());
        order.setServiceTime(orderDTO.getServiceTime() != null ? orderDTO.getServiceTime() : 0);
        order.setPriority(orderDTO.getPriority() != null ? orderDTO.getPriority() : "Medium");
        order.setNotes(orderDTO.getNotes());
        if (orderDTO.getStatus() != null) {
            order.setStatus(orderDTO.getStatus());
        }
        return orderRepository.save(order);
    }

    public Order updateOrder(String id, OrderDTO orderDTO) {
        Optional<Order> existing = orderRepository.findById(id);
        if (existing.isPresent()) {
            Order order = existing.get();
            Customer customer = null;
            if (orderDTO.getCustomerId() != null) {
                Optional<Customer> customerOpt = customerRepository.findById(orderDTO.getCustomerId());
                if (customerOpt.isEmpty()) {
                    throw new IllegalArgumentException("Customer not found");
                }
                customer = customerOpt.get();
                order.setCustomerId(orderDTO.getCustomerId());
            } else {
                customer = customerRepository.findById(order.getCustomerId()).orElse(null);
            }
            order.setPickupAddress(orderDTO.getPickupAddress());
            order.setPickupLat(orderDTO.getPickupLat());
            order.setPickupLng(orderDTO.getPickupLng());

            String dropoffAddress = orderDTO.getDropoffAddress() != null
                    ? orderDTO.getDropoffAddress()
                    : customer != null ? buildCustomerFullAddress(customer) : order.getDropoffAddress();
            Double dropoffLat = orderDTO.getDropoffLat() != null
                    ? orderDTO.getDropoffLat()
                    : customer != null ? customer.getLatitude() : order.getDropoffLat();
            Double dropoffLng = orderDTO.getDropoffLng() != null
                    ? orderDTO.getDropoffLng()
                    : customer != null ? customer.getLongitude() : order.getDropoffLng();
            order.setDropoffAddress(dropoffAddress);
            order.setDropoffLat(dropoffLat);
            order.setDropoffLng(dropoffLng);
            // update prototype fields
            if (orderDTO.getService() != null)
                order.setService(orderDTO.getService());
            if (orderDTO.getServiceTime() != null)
                order.setServiceTime(orderDTO.getServiceTime());
            if (orderDTO.getPriority() != null)
                order.setPriority(orderDTO.getPriority());
            if (orderDTO.getNotes() != null)
                order.setNotes(orderDTO.getNotes());
            if (orderDTO.getStatus() != null) {
                order.setStatus(orderDTO.getStatus());
            }
            order.touchUpdatedAt();
            applyCompanyDepotPickup(order);
            return orderRepository.save(order);
        }
        return null;
    }

    public boolean deleteOrder(String id) {
        if (orderRepository.existsById(id)) {
            orderRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public boolean updateOrderStatus(String id, OrderStatus status) {
        if (status == null) {
            throw new IllegalArgumentException("Status must be provided");
        }
        Optional<Order> existing = orderRepository.findById(id);
        if (existing.isPresent()) {
            Order order = existing.get();
            order.setStatus(status);
            order.touchUpdatedAt();
            orderRepository.save(order);
            return true;
        }
        return false;
    }

    private void applyCompanyDepotPickup(Order order) {
        order.setPickupAddress(COMPANY_DEPOT_ADDRESS);
        order.setPickupLat(COMPANY_DEPOT_LAT);
        order.setPickupLng(COMPANY_DEPOT_LNG);
    }

    private String buildCustomerFullAddress(Customer customer) {
        if (customer == null)
            return "";
        return String.join(", ",
                java.util.List.of(
                        customer.getAddress(),
                        customer.getCity(),
                        customer.getState(),
                        customer.getPostalCode(),
                        customer.getCountry()
                ).stream().filter(part -> part != null && !part.isBlank()).toList());
    }
}
