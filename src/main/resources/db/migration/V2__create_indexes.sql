-- Student table
CREATE INDEX idx_student_email ON student(email);
CREATE INDEX idx_student_role ON student(role);
CREATE INDEX idx_student_payment_status ON student(payment_status);

-- Confirmation token table
CREATE INDEX idx_confirmation_token_student_id ON confirmation_token(student_id);
CREATE INDEX idx_confirmation_token_confirmed_at ON confirmation_token(confirmed_at);
CREATE INDEX idx_confirmation_token_expires ON confirmation_token(expires_at);

CREATE INDEX idx_refresh_token_student_id ON refresh_token(student_id);
CREATE INDEX idx_refresh_token_token ON refresh_token(token);

CREATE INDEX idx_student_programme ON student(programme);
CREATE INDEX idx_student_programme_payment_status ON student(programme, payment_status);