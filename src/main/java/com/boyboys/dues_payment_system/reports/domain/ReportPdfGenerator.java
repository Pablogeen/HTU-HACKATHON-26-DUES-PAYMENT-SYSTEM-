package com.boyboys.dues_payment_system.reports.domain;


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
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
@Slf4j
public class ReportPdfGenerator {

    private static final DeviceRgb DARK_COLOR = new DeviceRgb(30, 30, 30);
    private static final DeviceRgb GREEN_COLOR = new DeviceRgb(85, 107, 47);
    private static final DeviceRgb LIGHT_GRAY = new DeviceRgb(245, 245, 245);
    private static final DeviceRgb WHITE = new DeviceRgb(255, 255, 255);

    public byte[] generateOverallSummaryPdf(OverallSummaryResponse summary) {
        log.info("Generating overall summary PDF report");
        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdfDocument = new PdfDocument(writer);
            Document document = new Document(pdfDocument, PageSize.A4);
            document.setMargins(40, 50, 40, 50);

            PdfFont boldFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont regularFont = PdfFontFactory.createFont(StandardFonts.HELVETICA);

            addHeader(document, boldFont, regularFont, "FINANCIAL SUMMARY REPORT");

            document.add(new Paragraph("\n"));

            // overall stats
            document.add(new Paragraph("OVERALL STATISTICS")
                    .setFont(boldFont)
                    .setFontSize(11)
                    .setFontColor(GREEN_COLOR)
                    .setMarginBottom(5));

            Table overallTable = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                    .useAllAvailableWidth();
            addStyledRow(overallTable, "Total Students", String.valueOf(summary.totalStudents()), boldFont, regularFont, LIGHT_GRAY, WHITE);
            addStyledRow(overallTable, "Total Paid", String.valueOf(summary.totalPaid()), boldFont, regularFont, WHITE, LIGHT_GRAY);
            addStyledRow(overallTable, "Total Unpaid", String.valueOf(summary.totalUnpaid()), boldFont, regularFont, LIGHT_GRAY, WHITE);
            addStyledRow(overallTable, "Total Amount Collected", "GHS " + summary.totalAmountCollectedInCedis() + ".00", boldFont, regularFont, WHITE, LIGHT_GRAY);
            document.add(overallTable);

            document.add(new Paragraph("\n"));

            // programme breakdown
            document.add(new Paragraph("BREAKDOWN BY PROGRAMME")
                    .setFont(boldFont)
                    .setFontSize(11)
                    .setFontColor(GREEN_COLOR)
                    .setMarginBottom(5));

            Table programmeTable = new Table(UnitValue.createPercentArray(new float[]{30, 20, 20, 30}))
                    .useAllAvailableWidth();
            addTableHeader(programmeTable, boldFont, "Programme", "Total", "Paid", "Unpaid");
            for (ProgrammeSummary ps : summary.programmeSummaries()) {
                addStyledRow(programmeTable, ps.programme(),
                        String.valueOf(ps.totalStudents()),
                        String.valueOf(ps.totalPaid()),
                        String.valueOf(ps.totalUnpaid()),
                        boldFont, regularFont);
            }
            document.add(programmeTable);

            document.add(new Paragraph("\n"));

            // level breakdown
            document.add(new Paragraph("BREAKDOWN BY LEVEL")
                    .setFont(boldFont)
                    .setFontSize(11)
                    .setFontColor(GREEN_COLOR)
                    .setMarginBottom(5));

            Table levelTable = new Table(UnitValue.createPercentArray(new float[]{30, 20, 20, 30}))
                    .useAllAvailableWidth();
            addTableHeader(levelTable, boldFont, "Level", "Total", "Paid", "Unpaid");
            for (LevelSummary ls : summary.levelSummaries()) {
                addStyledRow(levelTable, ls.level(),
                        String.valueOf(ls.totalStudents()),
                        String.valueOf(ls.totalPaid()),
                        String.valueOf(ls.totalUnpaid()),
                        boldFont, regularFont);
            }
            document.add(levelTable);

            addFooter(document, boldFont, regularFont);

            document.close();
            log.info("Overall summary PDF report generated successfully");
            return outputStream.toByteArray();

        } catch (Exception e) {
            log.error("Error generating overall summary PDF: {}", e.getMessage());
            throw new RuntimeException("Failed to generate overall summary PDF");
        }
    }

    public byte[] generateProgrammeSummaryPdf(ProgrammeDetailSummaryResponse summary) {
        log.info("Generating programme summary PDF for: {}", summary.programme());
        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdfDocument = new PdfDocument(writer);
            Document document = new Document(pdfDocument, PageSize.A4);
            document.setMargins(40, 50, 40, 50);

            PdfFont boldFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont regularFont = PdfFontFactory.createFont(StandardFonts.HELVETICA);

            addHeader(document, boldFont, regularFont,
                    summary.programme() + " PROGRAMME REPORT");

            document.add(new Paragraph("\n"));

            // programme stats
            document.add(new Paragraph("PROGRAMME STATISTICS")
                    .setFont(boldFont)
                    .setFontSize(11)
                    .setFontColor(GREEN_COLOR)
                    .setMarginBottom(5));

            Table statsTable = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                    .useAllAvailableWidth();
            addStyledRow(statsTable, "Programme", summary.programme(), boldFont, regularFont, LIGHT_GRAY, WHITE);
            addStyledRow(statsTable, "Total Students", String.valueOf(summary.totalStudents()), boldFont, regularFont, WHITE, LIGHT_GRAY);
            addStyledRow(statsTable, "Total Paid", String.valueOf(summary.totalPaid()), boldFont, regularFont, LIGHT_GRAY, WHITE);
            addStyledRow(statsTable, "Total Unpaid", String.valueOf(summary.totalUnpaid()), boldFont, regularFont, WHITE, LIGHT_GRAY);
            addStyledRow(statsTable, "Total Amount Collected", "GHS " + summary.totalAmountCollectedInCedis() + ".00", boldFont, regularFont, LIGHT_GRAY, WHITE);
            document.add(statsTable);

            document.add(new Paragraph("\n"));

            // level breakdown
            document.add(new Paragraph("BREAKDOWN BY LEVEL")
                    .setFont(boldFont)
                    .setFontSize(11)
                    .setFontColor(GREEN_COLOR)
                    .setMarginBottom(5));

            Table levelTable = new Table(UnitValue.createPercentArray(new float[]{30, 20, 20, 30}))
                    .useAllAvailableWidth();
            addTableHeader(levelTable, boldFont, "Level", "Total", "Paid", "Unpaid");
            for (LevelSummary ls : summary.levelSummaries()) {
                addStyledRow(levelTable, ls.level(),
                        String.valueOf(ls.totalStudents()),
                        String.valueOf(ls.totalPaid()),
                        String.valueOf(ls.totalUnpaid()),
                        boldFont, regularFont);
            }
            document.add(levelTable);

            addFooter(document, boldFont, regularFont);

            document.close();
            log.info("Programme summary PDF generated for: {}", summary.programme());
            return outputStream.toByteArray();

        } catch (Exception e) {
            log.error("Error generating programme summary PDF: {}", e.getMessage());
            throw new RuntimeException("Failed to generate programme summary PDF");
        }
    }

    public byte[] generateTransactionHistoryPdf(List<TransactionReportResponse> transactions) {
        log.info("Generating transaction history PDF report");
        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdfDocument = new PdfDocument(writer);
            Document document = new Document(pdfDocument, PageSize.A4.rotate());
            document.setMargins(40, 50, 40, 50);

            PdfFont boldFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont regularFont = PdfFontFactory.createFont(StandardFonts.HELVETICA);

            addHeader(document, boldFont, regularFont, "TRANSACTION HISTORY REPORT");

            document.add(new Paragraph("\n"));

            Table table = new Table(UnitValue.createPercentArray(new float[]{15, 20, 20, 15, 10, 10, 20}))
                    .useAllAvailableWidth();

            addTableHeader(table, boldFont, "Reference", "Student Name",
                    "Email", "Programme", "Level", "Amount", "Date Paid");

            boolean alternate = false;
            for (TransactionReportResponse t : transactions) {
                DeviceRgb bg = alternate ? LIGHT_GRAY : WHITE;
                addStyledRow(table, t.reference(), t.studentName(), t.email(),
                        t.programme(), t.level(), "GHS " + t.amountInCedis() + ".00",
                        t.paidAt(), boldFont, regularFont, bg);
                alternate = !alternate;
            }

            document.add(table);

            addFooter(document, boldFont, regularFont);

            document.close();
            log.info("Transaction history PDF report generated successfully");
            return outputStream.toByteArray();

        } catch (Exception e) {
            log.error("Error generating transaction history PDF: {}", e.getMessage());
            throw new RuntimeException("Failed to generate transaction history PDF");
        }
    }

    private void addHeader(Document document, PdfFont boldFont, PdfFont regularFont, String title) {
        Table headerTable = new Table(1).useAllAvailableWidth();
        Cell headerCell = new Cell()
                .setBackgroundColor(DARK_COLOR)
                .setPadding(20)
                .setBorder(Border.NO_BORDER)
                .add(new Paragraph("COMPSSA")
                        .setFont(boldFont)
                        .setFontSize(22)
                        .setFontColor(GREEN_COLOR)
                        .setTextAlignment(TextAlignment.CENTER))
                .add(new Paragraph(title)
                        .setFont(boldFont)
                        .setFontSize(14)
                        .setFontColor(WHITE)
                        .setTextAlignment(TextAlignment.CENTER))
                .add(new Paragraph("Ho Technical University — " +
                        LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy")))
                        .setFont(regularFont)
                        .setFontSize(10)
                        .setFontColor(new DeviceRgb(200, 200, 200))
                        .setTextAlignment(TextAlignment.CENTER));
        headerTable.addCell(headerCell);
        document.add(headerTable);
    }

    private void addFooter(Document document, PdfFont boldFont, PdfFont regularFont) {
        document.add(new Paragraph("\n"));
        Table footerTable = new Table(1).useAllAvailableWidth();
        Cell footerCell = new Cell()
                .setBackgroundColor(DARK_COLOR)
                .setPadding(15)
                .setBorder(Border.NO_BORDER)
                .add(new Paragraph("COMPSSA — Ho Technical University")
                        .setFont(boldFont)
                        .setFontSize(10)
                        .setFontColor(GREEN_COLOR)
                        .setTextAlignment(TextAlignment.CENTER))
                .add(new Paragraph("This is an official financial report. Generated on " +
                        LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy HH:mm")))
                        .setFont(regularFont)
                        .setFontSize(9)
                        .setFontColor(new DeviceRgb(200, 200, 200))
                        .setTextAlignment(TextAlignment.CENTER));
        footerTable.addCell(footerCell);
        document.add(footerTable);
    }

    private void addTableHeader(Table table, PdfFont boldFont, String... headers) {
        for (String header : headers) {
            table.addCell(new Cell()
                    .setBackgroundColor(GREEN_COLOR)
                    .setPadding(8)
                    .setBorder(Border.NO_BORDER)
                    .add(new Paragraph(header)
                            .setFont(boldFont)
                            .setFontSize(10)
                            .setFontColor(WHITE)));
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

    private void addStyledRow(Table table, String col1, String col2,
                              String col3, String col4,
                              PdfFont boldFont, PdfFont regularFont) {
        addCell(table, col1, regularFont, LIGHT_GRAY);
        addCell(table, col2, regularFont, LIGHT_GRAY);
        addCell(table, col3, regularFont, LIGHT_GRAY);
        addCell(table, col4, regularFont, LIGHT_GRAY);
    }

    private void addStyledRow(Table table, String col1, String col2, String col3,
                              String col4, String col5, String col6, String col7,
                              PdfFont boldFont, PdfFont regularFont, DeviceRgb bg) {
        addCell(table, col1, regularFont, bg);
        addCell(table, col2, regularFont, bg);
        addCell(table, col3, regularFont, bg);
        addCell(table, col4, regularFont, bg);
        addCell(table, col5, regularFont, bg);
        addCell(table, col6, regularFont, bg);
        addCell(table, col7, regularFont, bg);
    }

    private void addCell(Table table, String value, PdfFont font, DeviceRgb bg) {
        table.addCell(new Cell()
                .setBackgroundColor(bg)
                .setPadding(7)
                .setBorder(Border.NO_BORDER)
                .add(new Paragraph(value)
                        .setFont(font)
                        .setFontSize(9)
                        .setFontColor(DARK_COLOR)));
    }
}
