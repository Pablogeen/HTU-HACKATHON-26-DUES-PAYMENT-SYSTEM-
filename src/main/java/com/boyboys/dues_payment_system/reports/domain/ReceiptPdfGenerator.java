package com.boyboys.dues_payment_system.reports.domain;

import com.boyboys.dues_payment_system.payment.Transaction;
import com.boyboys.dues_payment_system.student.Student;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.element.Table;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Component
@Slf4j
public class ReceiptPdfGenerator {

    private static final DeviceRgb DARK_COLOR = new DeviceRgb(30, 30, 30);
    private static final DeviceRgb GREEN_COLOR = new DeviceRgb(85, 107, 47);
    private static final DeviceRgb LIGHT_GRAY = new DeviceRgb(245, 245, 245);
    private static final DeviceRgb WHITE = new DeviceRgb(255, 255, 255);

    public byte[] generateReceipt(Transaction transaction) {
        log.info("Generating receipt for reference: {}", transaction.getReference());
        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdfDocument = new PdfDocument(writer);
            Document document = new Document(pdfDocument, PageSize.A4);
            document.setMargins(40, 50, 40, 50);

            PdfFont boldFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont regularFont = PdfFontFactory.createFont(StandardFonts.HELVETICA);

            // header block
            Table headerTable = new Table(1).useAllAvailableWidth();
            Cell headerCell = new Cell()
                    .setBackgroundColor(DARK_COLOR)
                    .setPadding(20)
                    .setBorder(Border.NO_BORDER)
                    .add(new Paragraph("COMPSSA")
                            .setFont(boldFont)
                            .setFontSize(22)
                            .setFontColor(new DeviceRgb(85, 107, 47))
                            .setTextAlignment(TextAlignment.CENTER))
                    .add(new Paragraph("DUES PAYMENT RECEIPT")
                            .setFont(boldFont)
                            .setFontSize(14)
                            .setFontColor(WHITE)
                            .setTextAlignment(TextAlignment.CENTER))
                    .add(new Paragraph("Ho Technical University")
                            .setFont(regularFont)
                            .setFontSize(10)
                            .setFontColor(new DeviceRgb(200, 200, 200))
                            .setTextAlignment(TextAlignment.CENTER));
            headerTable.addCell(headerCell);
            document.add(headerTable);

            document.add(new Paragraph("\n"));

            // receipt reference banner
            Table refTable = new Table(1).useAllAvailableWidth();
            Cell refCell = new Cell()
                    .setBackgroundColor(GREEN_COLOR)
                    .setPadding(10)
                    .setBorder(Border.NO_BORDER)
                    .add(new Paragraph("Reference: " + transaction.getReference()
                            + "     |     Date Paid: " + transaction.getPaidAt()
                            .format(DateTimeFormatter.ofPattern("dd MMMM yyyy HH:mm")))
                            .setFont(boldFont)
                            .setFontSize(10)
                            .setFontColor(WHITE)
                            .setTextAlignment(TextAlignment.CENTER));
            refTable.addCell(refCell);
            document.add(refTable);

            document.add(new Paragraph("\n"));

            // student details section
            document.add(new Paragraph("STUDENT DETAILS")
                    .setFont(boldFont)
                    .setFontSize(11)
                    .setFontColor(GREEN_COLOR)
                    .setMarginBottom(5));

            Student student = transaction.getStudent();
            Table studentTable = new Table(UnitValue.createPercentArray(new float[]{40, 60}))
                    .useAllAvailableWidth();

            addStyledRow(studentTable, "Full Name",
                    student.getFirstName() + " " +
                            (student.getMiddleName() != null ? student.getMiddleName() + " " : "") +
                            student.getLastName(), boldFont, regularFont, LIGHT_GRAY, WHITE);
            addStyledRow(studentTable, "Email", student.getEmail(),
                    boldFont, regularFont, WHITE, LIGHT_GRAY);
            addStyledRow(studentTable, "Programme", student.getProgramme().name(),
                    boldFont, regularFont, LIGHT_GRAY, WHITE);
            addStyledRow(studentTable, "Level",
                    student.getLevel().name().replace("L", ""),
                    boldFont, regularFont, WHITE, LIGHT_GRAY);
            addStyledRow(studentTable, "Academic Year", student.getAcademicYear(),
                    boldFont, regularFont, LIGHT_GRAY, WHITE);
            document.add(studentTable);

            document.add(new Paragraph("\n"));

            // payment details section
            document.add(new Paragraph("PAYMENT DETAILS")
                    .setFont(boldFont)
                    .setFontSize(11)
                    .setFontColor(GREEN_COLOR)
                    .setMarginBottom(5));

            Table paymentTable = new Table(UnitValue.createPercentArray(new float[]{40, 60}))
                    .useAllAvailableWidth();

            addStyledRow(paymentTable, "Description", "COMPSSA Dues",
                    boldFont, regularFont, LIGHT_GRAY, WHITE);
            addStyledRow(paymentTable, "Amount",
                    "GHS " + transaction.getAmount() / 100 + ".00",
                    boldFont, regularFont, WHITE, LIGHT_GRAY);
            addStyledRow(paymentTable, "Payment Status", transaction.getStatus().name(),
                    boldFont, regularFont, LIGHT_GRAY, WHITE);
            document.add(paymentTable);

            document.add(new Paragraph("\n"));

            // footer
            Table footerTable = new Table(1).useAllAvailableWidth();
            Cell footerCell = new Cell()
                    .setBackgroundColor(DARK_COLOR)
                    .setPadding(15)
                    .setBorder(Border.NO_BORDER)
                    .add(new Paragraph("Thank you for your payment!")
                            .setFont(boldFont)
                            .setFontSize(12)
                            .setFontColor(new DeviceRgb(85, 107, 47))
                            .setTextAlignment(TextAlignment.CENTER))
                    .add(new Paragraph("This is an official receipt from COMPSSA - Ho Technical University")
                            .setFont(regularFont)
                            .setFontSize(9)
                            .setFontColor(new DeviceRgb(200, 200, 200))
                            .setTextAlignment(TextAlignment.CENTER));
            footerTable.addCell(footerCell);
            document.add(footerTable);

            document.close();
            log.info("Receipt generated successfully for reference: {}", transaction.getReference());
            return outputStream.toByteArray();

        } catch (Exception e) {
            log.error("Error generating receipt for reference {}: {}",
                    transaction.getReference(), e.getMessage());
            throw new RuntimeException("Failed to generate receipt");
        }
    }

    private void addStyledRow(Table table, String label, String value,
                              PdfFont boldFont, PdfFont regularFont,
                              DeviceRgb labelBg, DeviceRgb valueBg) {
        table.addCell(new Cell()
                .setBackgroundColor(labelBg)
                .setPadding(8)
                .setBorder(Border.NO_BORDER)
                .add(new Paragraph(label)
                        .setFont(boldFont)
                        .setFontSize(10)
                        .setFontColor(DARK_COLOR)));
        table.addCell(new Cell()
                .setBackgroundColor(valueBg)
                .setPadding(8)
                .setBorder(Border.NO_BORDER)
                .add(new Paragraph(value)
                        .setFont(regularFont)
                        .setFontSize(10)
                        .setFontColor(DARK_COLOR)));
    }
}
