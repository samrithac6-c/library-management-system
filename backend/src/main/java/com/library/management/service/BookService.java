package com.library.management.service;

import com.library.management.entity.Book;
import com.library.management.repository.BookRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookService {

    private final BookRepository repository;

    public BookService(BookRepository repository) {
        this.repository = repository;
    }

    public Book createBook(Book book) {
        return repository.save(book);
    }

    public List<Book> getAllBooks() {
        return repository.findAll();
    }

    public Book getBookById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found"));
    }

    public Book updateBook(Long id, Book book) {
        Book existing = getBookById(id);

        existing.setTitle(book.getTitle());
        existing.setAuthor(book.getAuthor());
        existing.setIsbn(book.getIsbn());
        existing.setCategory(book.getCategory());
        existing.setPublisher(book.getPublisher());
        existing.setPublicationYear(book.getPublicationYear());
        existing.setQuantity(book.getQuantity());
        existing.setAvailableQuantity(book.getAvailableQuantity());
        existing.setStatus(book.getStatus());

        return repository.save(existing);
    }

    public void deleteBook(Long id) {
        Book book = getBookById(id);
        repository.delete(book);
    }
}
