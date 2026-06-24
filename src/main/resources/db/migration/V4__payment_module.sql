CREATE TABLE transaction (
                             id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
                             reference           VARCHAR(255) NOT NULL UNIQUE,
                             paystack_reference  VARCHAR(255),
                             access_code         VARCHAR(255),
                             amount              BIGINT NOT NULL,
                             status              ENUM('PENDING','SUCCESS','FAILED') NOT NULL,
                             paid_at             DATETIME,
                             created_at          DATETIME NOT NULL,
                             student_id          BIGINT NOT NULL,
                             CONSTRAINT fk_transaction_student FOREIGN KEY (student_id) REFERENCES student(id)
);

CREATE INDEX idx_transaction_reference ON transaction(reference);
CREATE INDEX idx_transaction_student_id ON transaction(student_id);
CREATE INDEX idx_transaction_status ON transaction(status);