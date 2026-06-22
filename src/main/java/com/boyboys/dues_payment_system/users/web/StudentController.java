package com.boyboys.dues_payment_system.users.web;

import com.boyboys.dues_payment_system.users.domain.dto.ImportSummary;
import com.boyboys.dues_payment_system.users.domain.dto.StudentResponse;
import com.boyboys.dues_payment_system.users.domain.dto.UpdateStudentRequest;
import com.boyboys.dues_payment_system.users.domain.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Slf4j
public class StudentController {

    private final StudentService studentService;

    @PostMapping("/import")
    public ResponseEntity<ImportSummary> importStudents(@RequestParam("file") MultipartFile file) {
        log.info("Request made to import students into the db");
        ImportSummary summary = studentService.importStudents(file);
        log.info("Students have being imported into the system");
        return new ResponseEntity<>(summary, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<StudentResponse>> getAllUsers(@RequestParam(defaultValue = "0") int page,
                                                            @RequestParam(defaultValue = "10") int size) {
        log.info("Request made to view all students");
        Pageable pageable = PageRequest.of(page, size);
        List<StudentResponse> users = studentService.getAllUsers(pageable);
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentResponse> getUserById(@PathVariable Long id) {
        log.info("Getting student by id: ",id);
        StudentResponse studentResponse = studentService.getUserById(id);
        log.info("Student gotten by id {}",studentResponse.getEmail());
        return new ResponseEntity<>(studentResponse, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentResponse> updateUser(@PathVariable Long id,
                                                                @RequestBody @Valid UpdateStudentRequest request) {
        log.info("Request made to update student of id: {}",id);
        StudentResponse updatedResponse = studentService.updateUser(id, request);
        log.info("Student with id: {} has being updated successfully ",id);
        return new ResponseEntity<>(updatedResponse, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        log.info("Request made to delete user of id: {} ",id);
        studentService.deleteUser(id);
       return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<StudentResponse> getMe(@AuthenticationPrincipal UserDetails student) {
        log.info("Request made to view profile");
        StudentResponse studentInfo = studentService.getMe(student.getUsername());
        return new ResponseEntity<>(studentInfo, HttpStatus.OK);
    }
}