package com.library.management.controller;

import com.library.management.entity.Book;
import com.library.management.service.BookService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*")
public class BookController {

    private final BookService service;

    public BookController(BookService service) {
        this.service = service;
    }

    @PostMapping
    public Book createBook(@Valid @RequestBody Book book) {
        return service.createBook(book);
    }

    @GetMapping
    public List<Book> getAllBooks() {
        return service.getAllBooks();
    }

    @GetMapping("/{id}")
    public Book getBook(@PathVariable Long id) {
        return service.getBookById(id);
    }

    @PutMapping("/{id}")
    public Book updateBook(@PathVariable Long id,
                           @Valid @RequestBody Book book) {
        return service.updateBook(id, book);
    }

    @DeleteMapping("/{id}")
    public String deleteBook(@PathVariable Long id) {
        service.deleteBook(id);
        return "Book deleted successfully";
    }
}