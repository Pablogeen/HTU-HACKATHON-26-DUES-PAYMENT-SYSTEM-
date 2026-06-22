package com.boyboys.dues_payment_system.users.domain.service;

import com.boyboys.dues_payment_system.users.Student;
import com.boyboys.dues_payment_system.users.domain.StudentRepository;
import com.boyboys.dues_payment_system.users.domain.dto.CsvParseResult;
import com.boyboys.dues_payment_system.users.domain.dto.ImportSummary;
import com.boyboys.dues_payment_system.users.domain.dto.UpdateStudentRequest;
import com.boyboys.dues_payment_system.users.domain.dto.StudentResponse;
import com.boyboys.dues_payment_system.users.domain.exception.StudentNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository userRepository;
    private final StudentCsvParser studentCsvParser;
    private final ModelMapper modelMapper;


    @Transactional
    public ImportSummary importStudents(MultipartFile file) {
        CsvParseResult parseResult = studentCsvParser.parse(file);

        int successCount = 0;
        int skippedCount = parseResult.getSkippedReasons().size();
        List<String> skippedReasons = new ArrayList<>(parseResult.getSkippedReasons());

        for (Student user : parseResult.getValidUsers()) {
            if (userRepository.existsByEmail((user.getEmail()))) {
                skippedCount++;
                skippedReasons.add("Skipped: Email already exists - " + user.getEmail());
                continue;
            }
            userRepository.save(user);
            successCount++;
        }

        ImportSummary summary = new ImportSummary();
        summary.setTotalRows(parseResult.getTotalRows());
        summary.setSuccessCount(successCount);
        summary.setSkippedCount(skippedCount);
        summary.setSkippedReasons(skippedReasons);

        return summary;
    }

    public List<StudentResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).stream()
                .map(user -> modelMapper.map(user, StudentResponse.class))
                .toList();
    }

    public StudentResponse getUserById(Long id) {
        Student user = userRepository.findById(id)
                .orElseThrow(() -> new StudentNotFoundException("User not found"));
        return modelMapper.map(user, StudentResponse.class);
    }

    @Transactional
    public StudentResponse updateUser(Long id, UpdateStudentRequest request) {
        Student user = userRepository.findById(id)
                .orElseThrow(() -> new StudentNotFoundException("User not found"));
        modelMapper.map(request, user);
        userRepository.save(user);
        return modelMapper.map(user, StudentResponse.class);
    }

    @Transactional
    public void deleteUser(Long id) {
        Student user = userRepository.findById(id)
                .orElseThrow(() -> new StudentNotFoundException("User not found"));
        userRepository.delete(user);
    }

    public StudentResponse getMe(String email) {
        Student user = userRepository.findByEmail(email)
                .orElseThrow(() -> new StudentNotFoundException("User not found"));
        return modelMapper.map(user, StudentResponse.class);
    }
}