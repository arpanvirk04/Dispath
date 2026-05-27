package com.dispath.customerAndOrder_service.repository;

import com.dispath.customerAndOrder_service.entity.Route;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RouteRepository extends MongoRepository<Route, String> {
    List<Route> findByDate(String date);
}
