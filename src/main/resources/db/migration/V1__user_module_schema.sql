CREATE TABLE user (
                      id BIGINT AUTO_INCREMENT PRIMARY KEY,
                      first_name VARCHAR(100) NOT NULL,
                      last_name VARCHAR(100) NOT NULL,
                      middle_name VARCHAR(100),
                      email VARCHAR(100) NOT NULL UNIQUE,
                      phone_number VARCHAR(10) NOT NULL UNIQUE,
                      qualification ENUM('BTECH','HND') NOT NULL,
                      level INT NOT NULL,
                      role ENUM('STUDENT', 'FINANCIAL_SECRETARY', 'PRESIDENT') NOT NULL
);



CREATE TABLE confirmation_token (
                                    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
                                    token        VARCHAR(255),
                                    created      DATETIME,
                                    expires      DATETIME,
                                    confirmed_at DATETIME,
                                    user_id      BIGINT NOT NULL,
                                    CONSTRAINT fk_confirmation_token_user FOREIGN KEY (user_id) REFERENCES user(id)
);