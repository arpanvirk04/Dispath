package com.dispath.routing_service.service;

record OrderStop(String orderId, double latitude, double longitude) {
    double[] toCoordinatePair() {
        return new double[]{longitude, latitude};
    }
}

