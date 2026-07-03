package com.boyboys.dues_payment_system.student.domain.service;

import com.boyboys.dues_payment_system.payment.TransactionRepository;
import com.boyboys.dues_payment_system.student.*;
import com.boyboys.dues_payment_system.student.domain.RefreshTokenRepository;
import com.boyboys.dues_payment_system.student.domain.Role;
import com.boyboys.dues_payment_system.student.domain.dto.*;
import com.boyboys.dues_payment_system.student.domain.exception.EmailAlreadyExistException;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
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
    private final ConfirmationTokenRepository confirmationTokenRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final StudentCsvParser studentCsvParser;
    private final ModelMapper modelMapper;
    private final TransactionRepository transactionRepository;


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

    public StudentResponse registerStudent(@Valid RegisterRequest request) {
        log.info("Request made to register student");
        boolean studentExist = studentRepository.existsByEmail(request.getEmail());
        if(studentExist){
            throw new EmailAlreadyExistException("EMAIL ALREADY TAKEN");
        }
        Student student = new Student();
        student.setFirstName(request.getFirstName());
        student.setMiddleName(request.getMiddleName());
        student.setLastName(request.getLastName());
        student.setEmail(request.getEmail());
        student.setPhoneNumber(request.getPhoneNumber());
        student.setLevel(request.getLevel());
        student.setQualificationType(request.getQualificationType());
        student.setRole(Role.STUDENT);
        student.setPaymentStatus(PaymentStatus.UNPAID);
        student.setAcademicYear(request.getAcademicYear());
        student.setProgramme(request.getProgramme());

        Student savedStudent = studentRepository.save(student);
        log.info("Student saved into the db");
        return modelMapper.map(savedStudent, StudentResponse.class);
    }

    @Transactional
    public StudentResponse updateStudent(String email, UpdateStudentRequest request) {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new StudentNotFoundException("Student not found"));
        modelMapper.map(request, student);
        Student savedStudent = studentRepository.save(student);
        log.info("Student details updated");
        return modelMapper.map(savedStudent, StudentResponse.class);
    }

    @Transactional
    public void deleteStudent(String email) {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new StudentNotFoundException("Student not found"));
        refreshTokenRepository.deleteByStudent(student);
        confirmationTokenRepository.deleteByStudent(student);
        transactionRepository.deleteByStudent(student);
        studentRepository.delete(student);
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

    @Transactional
    public List<StudentResponse> getStudentsByProgramme(Programme programme, Pageable pageable) {
        return studentRepository.findByProgramme(programme, pageable)
                .stream().map(student -> modelMapper.map(student, StudentResponse.class)).toList();
    }

    @Transactional
    public List<StudentResponse> getStudentsByProgrammeAndPaymentStatus(Programme programme, PaymentStatus paymentStatus, Pageable pageable) {
        return studentRepository.findByProgrammeAndPaymentStatus(programme, paymentStatus, pageable)
                .stream().map(student -> modelMapper.map(student, StudentResponse.class)).toList();
    }
}