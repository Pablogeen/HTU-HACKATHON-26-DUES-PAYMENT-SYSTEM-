CREATE TABLE student (
                      id BIGINT AUTO_INCREMENT PRIMARY KEY,
                      first_name VARCHAR(100) NOT NULL,
                      last_name VARCHAR(100) NOT NULL,
                      middle_name VARCHAR(100),
                      email VARCHAR(100) NOT NULL UNIQUE,
                      phone_number VARCHAR(10) NOT NULL UNIQUE,
                      qualification_type ENUM('BTECH','HND') NOT NULL,
                      level INT NOT NULL,
                      role ENUM('STUDENT', 'FINANCIAL_SECRETARY', 'PRESIDENT') NOT NULL
);



CREATE TABLE confirmation_token (
                                    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
                                    token        VARCHAR(255),
                                    created_at      DATETIME,
                                    expires_at      DATETIME,
                                    confirmed_at DATETIME,
                                    student_id      BIGINT NOT NULL,
                                    CONSTRAINT fk_confirmation_token_user FOREIGN KEY (student_id) REFERENCES student(id)
);

CREATE TABLE event_publication (
                                   id VARCHAR(36) NOT NULL,
                                   listener_id VARCHAR(512) NOT NULL,
                                   event_type VARCHAR(512) NOT NULL,
                                   serialized_event VARCHAR(2048) NOT NULL,
                                   publication_date DATETIME(6) NOT NULL,
                                   completion_date DATETIME(6),
                                   PRIMARY KEY (id)
);