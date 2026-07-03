package com.boyboys.dues_payment_system.reports.domain;

import com.boyboys.dues_payment_system.payment.TransactionRepository;
import com.boyboys.dues_payment_system.payment.TransactionStatus;
import com.boyboys.dues_payment_system.student.PaymentStatus;
import com.boyboys.dues_payment_system.student.Programme;
import com.boyboys.dues_payment_system.student.StudentRepository;
import com.boyboys.dues_payment_system.student.Level;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final TransactionRepository transactionRepository;
    private final StudentRepository studentRepository;

    public OverallSummaryResponse getOverallSummary() {
        log.info("Generating overall summary report");

        long totalStudents = studentRepository.count();
        long totalPaid = studentRepository.countByPaymentStatus(PaymentStatus.PAID);
        long totalUnpaid = studentRepository.countByPaymentStatus(PaymentStatus.UNPAID);
        BigDecimal totalAmountCollected = transactionRepository.sumPaidTransactions().divide(BigDecimal.valueOf(100));

        List<ProgrammeSummary> programmeSummaries = Arrays.stream(Programme.values())
                .map(programme -> new ProgrammeSummary(
                        programme.name(),
                        studentRepository.countByProgramme(programme),
                        studentRepository.countByProgrammeAndPaymentStatus(programme, PaymentStatus.PAID),
                        studentRepository.countByProgrammeAndPaymentStatus(programme, PaymentStatus.UNPAID),
                        transactionRepository.sumAmountByProgramme(programme)
                ))
                .toList();

        List<LevelSummary> levelSummaries = Arrays.stream(Level.values())
                .map(level -> new LevelSummary(
                        level.name().replace("L", ""),
                        studentRepository.countByLevel(level),
                        studentRepository.countByLevelAndPaymentStatus(level, PaymentStatus.PAID),
                        studentRepository.countByLevelAndPaymentStatus(level, PaymentStatus.UNPAID)
                ))
                .toList();

        log.info("Overall summary report generated successfully");
        return new OverallSummaryResponse(
                totalStudents,
                totalPaid,
                totalUnpaid,
                totalAmountCollected,
                programmeSummaries,
                levelSummaries
        );
    }

    public ProgrammeDetailSummaryResponse getProgrammeSummary(Programme programme) {
        log.info("Generating programme summary report for: {}", programme);

        long totalStudents = studentRepository.countByProgramme(programme);
        long totalPaid = studentRepository.countByProgrammeAndPaymentStatus(programme, PaymentStatus.PAID);
        long totalUnpaid = studentRepository.countByProgrammeAndPaymentStatus(programme, PaymentStatus.UNPAID);
        Long totalAmountInPesewas = transactionRepository.sumPaidTransactionsByProgramme(programme);
        long totalAmountInCedis = totalAmountInPesewas != null ? totalAmountInPesewas / 100 : 0;

        List<LevelSummary> levelSummaries = Arrays.stream(Level.values())
                .map(level -> new LevelSummary(
                        level.name().replace("L", ""),
                        studentRepository.countByProgrammeAndLevel(programme, level),
                        studentRepository.countByProgrammeAndLevelAndPaymentStatus(programme, level, PaymentStatus.PAID),
                        studentRepository.countByProgrammeAndLevelAndPaymentStatus(programme, level, PaymentStatus.UNPAID)))
                .toList();

        log.info("Programme summary report generated for: {}", programme);
        return new ProgrammeDetailSummaryResponse(
                programme.name(),
                totalStudents,
                totalPaid,
                totalUnpaid,
                totalAmountInCedis,
                levelSummaries
        );
    }

    public List<TransactionReportResponse> getTransactionHistory() {
        log.info("Generating transaction history report");
        return transactionRepository.findAllByStatus(TransactionStatus.SUCCESS)
                .stream()
                .map(t -> new TransactionReportResponse(
                        t.getReference(),
                        t.getStudent().getFirstName() + " " +
                                (t.getStudent().getMiddleName() != null ?
                                        t.getStudent().getMiddleName() + " " : "") +
                                t.getStudent().getLastName(),
                        t.getStudent().getEmail(),
                        t.getStudent().getProgramme().name(),
                        t.getStudent().getLevel().name().replace("L", ""),
                        t.getAmount() / 100,
                        t.getPaidAt().format(DateTimeFormatter.ofPattern("dd MMMM yyyy HH:mm"))))
                .toList();
    }
}
