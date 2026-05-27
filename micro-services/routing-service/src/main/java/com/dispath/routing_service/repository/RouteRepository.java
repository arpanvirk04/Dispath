package com.dispath.routing_service.repository;

import com.dispath.routing_service.entity.Route;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RouteRepository extends MongoRepository<Route, String> {
    List<Route> findByDate(String date);
}
