package com.internal.tasktracker;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class TaskController {

    private static final int DEFAULT_PAGE_SIZE = 10;
    private static final int MAX_PAGE_SIZE = 100;

    private final TaskRepository taskRepository;

    public TaskController(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @GetMapping("/api/tasks")
    public ResponseEntity<?> searchTasks(
            @RequestParam(required = false, defaultValue = "") String q,
            @RequestParam(required = false) String status,
            @RequestParam(required = false, defaultValue = "1") int page,
            @RequestParam(required = false, defaultValue = "10") int pageSize) {

        /*
         * Validate pagination before performing any database work.
         */
        if (page < 1) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "page must be greater than or equal to 1"));
        }

        if (pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "error",
                            "pageSize must be between 1 and " + MAX_PAGE_SIZE
                    ));
        }

        /*
         * Normalize query input.
         */
        String query = q == null ? "" : q.trim();
        String searchTerm = "%" + query.toLowerCase() + "%";

        /*
         * Validate the optional status filter.
         *
         * TaskStatus.valueOf() throws IllegalArgumentException when
         * an unsupported value is supplied, so convert that into a
         * controlled HTTP 400 response.
         */
        String normalizedStatus = null;

        if (status != null && !status.isBlank()) {
            try {
                normalizedStatus = TaskStatus
                        .valueOf(status.trim().toUpperCase())
                        .name();
            } catch (IllegalArgumentException ex) {
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "error",
                                "Invalid status. Allowed values: OPEN, IN_PROGRESS, DONE"
                        ));
            }
        }

        /*
         * Do not introduce artificial delays into an HTTP request.
         *
         * The original implementation calculated a "complexity"
         * value and called Thread.sleep(). That makes the API slower
         * for no functional reason and consumes a server thread.
         */

        System.out.println(
                "[TaskController] q=\"" + query
                        + "\" status=" + normalizedStatus
                        + " page=" + page
                        + " pageSize=" + pageSize
        );

        List<Task> allResults =
                taskRepository.searchTasks(searchTerm, normalizedStatus);

        /*
         * Calculate the requested page safely.
         */
        int start = (page - 1) * pageSize;

        List<Task> pageResults;

        if (start >= allResults.size()) {
            pageResults = Collections.emptyList();
        } else {
            int end = Math.min(start + pageSize, allResults.size());
            pageResults = allResults.subList(start, end);
        }

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("items", pageResults);
        response.put("total", allResults.size());
        response.put("page", page);
        response.put("pageSize", pageSize);

        return ResponseEntity.ok(response);
    }
}