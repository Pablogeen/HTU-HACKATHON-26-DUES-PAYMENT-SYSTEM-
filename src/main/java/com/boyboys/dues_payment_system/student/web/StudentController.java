package com.boyboys.dues_payment_system.student.web;

import com.boyboys.dues_payment_system.student.Programme;
import com.boyboys.dues_payment_system.student.PaymentStatus;
import com.boyboys.dues_payment_system.student.domain.dto.ImportSummary;
import com.boyboys.dues_payment_system.student.domain.dto.RegisterRequest;
import com.boyboys.dues_payment_system.student.domain.dto.StudentResponse;
import com.boyboys.dues_payment_system.student.domain.dto.UpdateStudentRequest;
import com.boyboys.dues_payment_system.student.domain.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/students")
@RequiredArgsConstructor
@Slf4j
public class StudentController {

    private final StudentService studentService;

    @PostMapping("/import")
    @PreAuthorize("hasAnyAuthority('PRESIDENT','FINANCIAL_SECRETARY','ADMIN')")
    public ResponseEntity<ImportSummary> importStudents(@RequestParam("file") MultipartFile file) {
        log.info("Request made to import students into the db");
        ImportSummary summary = studentService.importStudents(file);
        log.info("Students have being imported into the system");
        return new ResponseEntity<>(summary, HttpStatus.OK);
    }

    @PostMapping("/register-student")
    @PreAuthorize("hasAnyAuthority('PRESIDENT','ADMIN')")
    public ResponseEntity<StudentResponse> registerStudent(@RequestBody @Valid RegisterRequest request) {
        log.info("Request made to register a single student to the system : {}",request.getEmail());
        StudentResponse response = studentService.registerStudent(request);
        log.info("Student has been registered to the system");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }



    @GetMapping
    @PreAuthorize("hasAnyAuthority('PRESIDENT','ADMIN','FINANCIAL_SECRETARY')")
    public ResponseEntity<List<StudentResponse>> getAllStudents(@RequestParam(defaultValue = "0") int page,
                                                            @RequestParam(defaultValue = "10") int size) {
        log.info("Request made to view all students");
        Pageable pageable = PageRequest.of(page, size);
        List<StudentResponse> users = studentService.getAllStudents(pageable);
        return new ResponseEntity<>(users, HttpStatus.OK);
    }


    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('PRESIDENT','FINANCIAL_SECRETARY','ADMIN')")
    public ResponseEntity<StudentResponse> getStudentById(@PathVariable Long id) {
        log.info("Getting student by id: ",id);
        StudentResponse studentResponse = studentService.getStudentById(id);
        log.info("Student gotten by id {}",studentResponse.getEmail());
        return new ResponseEntity<>(studentResponse, HttpStatus.OK);
    }

    @PutMapping("/{email}")
    @PreAuthorize("hasAnyAuthority('PRESIDENT','ADMIN')")
    public ResponseEntity<StudentResponse> updateStudent(@PathVariable String email,
                                                                @RequestBody @Valid UpdateStudentRequest request) {
        log.info("Request made to update student of email: {}",email);
        StudentResponse updatedResponse = studentService.updateStudent(email, request);
        log.info("Student with email: {} has being updated successfully ",email);
        return new ResponseEntity<>(updatedResponse, HttpStatus.OK);
    }

    @PutMapping("/{email}/assign-role")
    @PreAuthorize("hasAnyAuthority('PRESIDENT','ADMIN')")
    public ResponseEntity<StudentResponse> assignRole(@PathVariable String email) {
        log.info("Assigning role to student with email: {}", email);
        StudentResponse studentResponse = studentService.assignRole(email);
        log.info("Role assigned to student {}", studentResponse.getEmail());
        return new ResponseEntity<>(studentResponse, HttpStatus.OK);
    }

    @PutMapping("/{email}/revoke-role")
    @PreAuthorize("hasAnyAuthority('PRESIDENT','ADMIIN')")
    public ResponseEntity<StudentResponse> revokeRole(@PathVariable String email) {
        log.info("Revoking role from student with email: {}", email);
        StudentResponse studentResponse = studentService.revokeRole(email);
        log.info("Role revoked from student {}", studentResponse.getEmail());
        return new ResponseEntity<>(studentResponse, HttpStatus.OK);
    }

    @GetMapping("/{email}")
    @PreAuthorize("hasAnyAuthority('PRESIDENT','FINANCIAL_SECRETARY')")
    public ResponseEntity<StudentResponse> getStudentByEmail(@PathVariable String email) {
        log.info("Getting student by email: {}", email);
        StudentResponse studentResponse = studentService.getStudentByEmail(email);
        log.info("Student gotten by email {}", studentResponse.getEmail());
        return new ResponseEntity<>(studentResponse, HttpStatus.OK);
    }

    @DeleteMapping("/{email}")
    @PreAuthorize("hasAnyAuthority('PRESIDENT','ADMIN')")
    public ResponseEntity<Void> deleteStudent(@PathVariable String email) {
        log.info("Request made to delete user of email: {} ",email);
        studentService.deleteStudent(email);
       return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<StudentResponse> getMe(@AuthenticationPrincipal UserDetails student) {
        log.info("Request made to view profile");
        StudentResponse studentInfo = studentService.getMe(student.getUsername());
        return new ResponseEntity<>(studentInfo, HttpStatus.OK);
    }

    @GetMapping("/payment-status")
    @PreAuthorize("hasAnyAuthority('PRESIDENT','FINANCIAL_SECRETARY','ADMIN')")
    public ResponseEntity<List<StudentResponse>> getStudentsByPaymentStatus(
                            @RequestParam String paymentStatus,
                            @RequestParam(defaultValue = "0") int page,
                            @RequestParam(defaultValue = "10") int size) {
        log.info("Getting students by payment status: {}", paymentStatus);
        Pageable pageable = PageRequest.of(page, size);
        List<StudentResponse> students = studentService.getStudentsByPaymentStatus(paymentStatus,pageable);
        log.info("Students gotten by payment status: {}", students.size());
        return new ResponseEntity<>(students, HttpStatus.OK);
    }

    @GetMapping("/programme")
    @PreAuthorize("hasAnyAuthority('PRESIDENT','FINANCIAL_SECRETARY','ADMIN')")
    public ResponseEntity<List<StudentResponse>> getStudentsByProgramme(
                                @RequestParam Programme programme,
                                @RequestParam(defaultValue = "0") int page,
                                @RequestParam(defaultValue = "10") int size) {
        log.info("Getting students by programme: {}", programme);
        Pageable pageable = PageRequest.of(page, size);
        List<StudentResponse> students = studentService.getStudentsByProgramme(programme,pageable);
        log.info("Students gotten by programme: {}", students.size());
        return new ResponseEntity<>(students, HttpStatus.OK);
    }

    @GetMapping("/programme/payment-status")
    @PreAuthorize("hasAnyAuthority('PRESIDENT','FINANCIAL_SECRETARY','ADMIN')")
    public ResponseEntity<List<StudentResponse>> getStudentsByProgrammeAndPaymentStatus(
                                    @RequestParam Programme programme,
                                    @RequestParam PaymentStatus paymentStatus,
                                    @RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        log.info("Getting students by programme: {} and payment status: {}", programme, paymentStatus);
        List<StudentResponse> students = studentService.getStudentsByProgrammeAndPaymentStatus(programme, paymentStatus,pageable);
        log.info("Students gotten: {}", students.size());
        return new ResponseEntity<>(students, HttpStatus.OK);
    }
}