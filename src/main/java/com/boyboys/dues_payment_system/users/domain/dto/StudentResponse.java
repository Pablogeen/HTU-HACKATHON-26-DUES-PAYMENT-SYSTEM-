package com.boyboys.dues_payment_system.users.domain.dto;

import com.boyboys.dues_payment_system.users.Qualification;
import com.boyboys.dues_payment_system.users.Role;
import com.boyboys.dues_payment_system.users.domain.PaymentStatus;
import lombok.Data;

@Data
public class StudentResponse {

        private String firstName;
        private String lastName;
        private String middleName;
        private String email;
        private String phoneNumber;
        private Integer level;
        private Qualification qualification;
        private PaymentStatus paymentStatus;
}
