package com.boyboys.dues_payment_system.student.domain.service;

import com.boyboys.dues_payment_system.student.domain.Role;
import com.boyboys.dues_payment_system.student.Student;
import com.boyboys.dues_payment_system.student.domain.PaymentStatus;
import com.boyboys.dues_payment_system.student.domain.StudentRepository;
import com.boyboys.dues_payment_system.student.domain.dto.CsvParseResult;
import com.boyboys.dues_payment_system.student.domain.dto.ImportSummary;
import com.boyboys.dues_payment_system.student.domain.dto.UpdateStudentRequest;
import com.boyboys.dues_payment_system.student.domain.dto.StudentResponse;
import com.boyboys.dues_payment_system.student.domain.exception.StudentNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudentService {

    private final StudentRepository studentRepository;
    private final StudentCsvParser studentCsvParser;
    private final ModelMapper modelMapper;


    @Transactional
    public ImportSummary importStudents(MultipartFile file) {
        CsvParseResult parseResult = studentCsvParser.parse(file);

        int successCount = 0;
        int skippedCount = parseResult.getSkippedReasons().size();
        List<String> skippedReasons = new ArrayList<>(parseResult.getSkippedReasons());

        for (Student student : parseResult.getValidUsers()) {
            if (studentRepository.existsByEmail((student.getEmail()))) {
                skippedCount++;
                skippedReasons.add("Skipped: Email already exists - " + student.getEmail());
                continue;
            }
            studentRepository.save(student);
            successCount++;
        }

        ImportSummary summary = new ImportSummary();
        summary.setTotalRows(parseResult.getTotalRows());
        summary.setSuccessCount(successCount);
        summary.setSkippedCount(skippedCount);
        summary.setSkippedReasons(skippedReasons);

        return summary;
    }

    public List<StudentResponse> getAllStudents(Pageable pageable) {
        return studentRepository.findAll(pageable).stream()
                .map(user -> modelMapper.map(user, StudentResponse.class))
                .toList();
    }

    public StudentResponse getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new StudentNotFoundException("Student not found"));
        log.info("Got student from db");
        return modelMapper.map(student, StudentResponse.class);
    }

    @Transactional
    public StudentResponse updateStudent(String email, UpdateStudentRequest request) {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new StudentNotFoundException("Student not found"));
   Student mappedStudent = modelMapper.map(request, Student.class);
        studentRepository.save(mappedStudent);
        log.info("Student details updated");
        return modelMapper.map(student, StudentResponse.class);
    }

    @Transactional
    public void deleteStudent(String email) {
        Student user = studentRepository.findByEmail(email)
                .orElseThrow(() -> new StudentNotFoundException("Student not found"));
        studentRepository.delete(user);
    }

    public StudentResponse getMe(String email) {
        Student user = studentRepository.findByEmail(email)
                .orElseThrow(() -> new StudentNotFoundException("Student not found"));
        return modelMapper.map(user, StudentResponse.class);
    }

    @Transactional
    public StudentResponse assignRole(String email) {
        log.info("About to assign role to: {}",email);
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new StudentNotFoundException("Student not found"));
        log.info("Student gotten from the db");
        student.setRole(Role.FINANCIAL_SECRETARY);
        Student savedStudent = studentRepository.save(student);
        log.info("New role assigned");
        return modelMapper.map(savedStudent, StudentResponse.class);

    }

    @Transactional
    public StudentResponse revokeRole(String email) {
        log.info("About to revoke role of: {}",email);
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new StudentNotFoundException("Student not found"));
        log.info("Student info gotten from the db");
        student.setRole(Role.STUDENT);
        Student savedStudent = studentRepository.save(student);
        log.info("Role Revoked");
        return modelMapper.map(savedStudent, StudentResponse.class);
    }

    @Transactional
    public StudentResponse getStudentByEmail(String email) {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new StudentNotFoundException("Student not found"));
        log.info("Student found in the db");
        return modelMapper.map(student, StudentResponse.class);

    }

    @Transactional
    public List<StudentResponse> getStudentsByPaymentStatus(String paymentStatus, Pageable pageable) {
        return studentRepository.findByPaymentStatus(PaymentStatus.valueOf(paymentStatus), pageable)
                .stream()
                .map(student -> modelMapper.map(student, StudentResponse.class))
                .toList();
    }
}