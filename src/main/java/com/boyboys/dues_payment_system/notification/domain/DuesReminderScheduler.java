package com.boyboys.dues_payment_system.notification.domain;

import com.boyboys.dues_payment_system.student.PaymentStatus;
import com.boyboys.dues_payment_system.student.Student;
import com.boyboys.dues_payment_system.student.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor

public class DuesReminderScheduler {

    private final StudentRepository studentRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Scheduled(cron = "0 0 9 1 * *") // 9AM on the 1st of every month
    public void sendMonthlyDuesReminders() {
        List<Student> unpaidStudents = studentRepository.findAllByPaymentStatus(PaymentStatus.UNPAID);
        for (Student student : unpaidStudents) {
            eventPublisher.publishEvent(new DuesReminderEvent(student.getEmail(), student.getFirstName()));
        }
    }
}
