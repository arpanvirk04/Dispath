package com.dispath.customerAndOrder_service.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderCase {
    private String id;
    private String title;
    private String description;
    private String createdBy;
    private LocalDateTime createdAt = LocalDateTime.now();
}
