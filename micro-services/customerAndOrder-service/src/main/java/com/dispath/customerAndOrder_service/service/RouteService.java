package com.dispath.customerAndOrder_service.service;

import com.dispath.customerAndOrder_service.dto.RouteDTO;
import com.dispath.customerAndOrder_service.entity.Customer;
import com.dispath.customerAndOrder_service.entity.Route;
import com.dispath.customerAndOrder_service.repository.CustomerRepository;
import com.dispath.customerAndOrder_service.repository.RouteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class RouteService {

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private CustomerRepository customerRepository;

    public List<Route> getAllRoutes() {
        return routeRepository.findAll();
    }

    public List<Route> getRoutesByDate(String date) {
        return routeRepository.findByDate(date);
    }

    public Optional<Route> getRouteById(String id) {
        return routeRepository.findById(id);
    }

    public Route createRoute(RouteDTO dto) {
        Route route = new Route(dto.getName(), dto.getDate());
        if (dto.getKilometers() != null)
            route.setKilometers(dto.getKilometers());
        if (dto.getCustomerIds() != null)
            route.setCustomerIds(new ArrayList<>(dto.getCustomerIds()));
        return routeRepository.save(route);
    }

    public boolean deleteRoute(String id) {
        if (routeRepository.existsById(id)) {
            routeRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Route addCustomerToRoute(String routeId, String customerId) {
        Optional<Route> r = routeRepository.findById(routeId);
        if (r.isEmpty())
            throw new IllegalArgumentException("Route not found");
        Optional<Customer> c = customerRepository.findById(customerId);
        if (c.isEmpty())
            throw new IllegalArgumentException("Customer not found");
        Route route = r.get();
        if (route.getCustomerIds() == null)
            route.setCustomerIds(new ArrayList<>());
        if (!route.getCustomerIds().contains(customerId))
            route.getCustomerIds().add(customerId);
        route.touchUpdatedAt();
        return routeRepository.save(route);
    }

    public int addMultipleCustomersToRoute(String routeId, List<String> ids) {
        Optional<Route> r = routeRepository.findById(routeId);
        if (r.isEmpty())
            throw new IllegalArgumentException("Route not found");
        Route route = r.get();
        if (route.getCustomerIds() == null)
            route.setCustomerIds(new ArrayList<>());
        int added = 0;
        for (String id : ids) {
            if (!customerRepository.existsById(id))
                continue;
            if (!route.getCustomerIds().contains(id)) {
                route.getCustomerIds().add(id);
                added++;
            }
        }
        route.touchUpdatedAt();
        routeRepository.save(route);
        return added;
    }

    public Route removeCustomerFromRoute(String routeId, String customerId) {
        Optional<Route> r = routeRepository.findById(routeId);
        if (r.isEmpty())
            throw new IllegalArgumentException("Route not found");
        Route route = r.get();
        if (route.getCustomerIds() != null) {
            route.getCustomerIds().removeIf(cid -> cid.equals(customerId));
        }
        route.touchUpdatedAt();
        return routeRepository.save(route);
    }
}
