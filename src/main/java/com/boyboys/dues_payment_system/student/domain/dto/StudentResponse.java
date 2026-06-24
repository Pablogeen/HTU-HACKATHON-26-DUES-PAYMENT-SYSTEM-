package com.boyboys.dues_payment_system.student.domain.dto;

import com.boyboys.dues_payment_system.student.Programme;
import com.boyboys.dues_payment_system.student.domain.Level;
import com.boyboys.dues_payment_system.student.domain.Qualification;
import com.boyboys.dues_payment_system.student.domain.PaymentStatus;
import lombok.Data;

@Data
public class StudentResponse {

        private String firstName;
        private String lastName;
        private String middleName;
        private String email;
        private String phoneNumber;
        private String academicYear;
        private Level level;
        private Qualification qualificationType;
        private PaymentStatus paymentStatus;
        private Programme programme;
}
