package com.dispath.customerAndOrder_service.dto;

import com.dispath.customerAndOrder_service.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusUpdateDTO {
    private OrderStatus status;
}
