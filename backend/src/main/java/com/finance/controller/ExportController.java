package com.finance.controller;

import com.finance.entity.User;
import com.finance.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Tuple;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.StringWriter;
import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/export")
public class ExportController {

    private final UserRepository userRepository;
    private final EntityManager em;

    public ExportController(UserRepository userRepository, EntityManager em) {
        this.userRepository = userRepository;
        this.em = em;
    }

    @GetMapping("/csv")
    public ResponseEntity<String> exportCsv(
        @RequestParam LocalDate from,
        @RequestParam LocalDate to,
        Principal principal
    ) {
        User user = userRepository.findByEmail(principal.getName()).orElseThrow();

        String sql = """
            SELECT t.transaction_date, c.name AS category_name, t.amount, t.note, c.type
            FROM transactions t
            JOIN categories c ON c.id = t.category_id
            WHERE t.user_id = :userId
              AND t.transaction_date BETWEEN :from AND :to
              AND t.deleted = false
            ORDER BY t.transaction_date DESC
            """;

        var writer = new StringWriter();
        try (var printer = new CSVPrinter(writer, CSVFormat.DEFAULT
            .withHeader("Date", "Category", "Amount", "Note", "Type"))) {

            @SuppressWarnings("unchecked")
            List<Tuple> rows = em.createNativeQuery(sql, Tuple.class)
                .setParameter("userId", user.getId())
                .setParameter("from", from)
                .setParameter("to", to)
                .getResultList();

            for (Tuple row : rows) {
                printer.printRecord(
                    row.get("transaction_date"),
                    row.get("category_name"),
                    row.get("amount"),
                    row.get("note") != null ? row.get("note") : "",
                    row.get("type")
                );
            }
        } catch (Exception e) {
            throw new RuntimeException("CSV export failed", e);
        }

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=transactions.csv")
            .contentType(MediaType.parseMediaType("text/csv"))
            .body(writer.toString());
    }
}
