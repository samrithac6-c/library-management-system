CREATE DATABASE IF NOT EXISTS library_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'library_user'@'%' IDENTIFIED BY 'library_password';
GRANT ALL PRIVILEGES ON library_db.* TO 'library_user'@'%';
FLUSH PRIVILEGES;

USE library_db;

CREATE TABLE IF NOT EXISTS books (
  id BIGINT NOT NULL AUTO_INCREMENT,
  title VARCHAR(180) NOT NULL,
  author VARCHAR(140) NOT NULL,
  isbn VARCHAR(32) NOT NULL,
  category VARCHAR(80) NOT NULL,
  publisher VARCHAR(140) NOT NULL,
  publication_year INT NOT NULL,
  quantity INT NOT NULL,
  available_quantity INT NOT NULL,
  status VARCHAR(24) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_books_isbn (isbn),
  CONSTRAINT chk_books_quantity CHECK (quantity > 0),
  CONSTRAINT chk_books_available_quantity CHECK (available_quantity >= 0 AND available_quantity <= quantity),
  CONSTRAINT chk_books_publication_year CHECK (publication_year BETWEEN 1000 AND 2100)
) ENGINE=InnoDB;

INSERT INTO books (title, author, isbn, category, publisher, publication_year, quantity, available_quantity, status)
SELECT 'Clean Code', 'Robert C. Martin', '9780132350884', 'Programming', 'Prentice Hall', 2008, 6, 6, 'Available'
WHERE NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780132350884');

INSERT INTO books (title, author, isbn, category, publisher, publication_year, quantity, available_quantity, status)
SELECT 'The Design of Everyday Things', 'Don Norman', '9780465050659', 'Design', 'Basic Books', 2013, 4, 3, 'Available'
WHERE NOT EXISTS (SELECT 1 FROM books WHERE isbn = '9780465050659');
