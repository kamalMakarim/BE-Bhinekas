DROP TABLE IF EXISTS admins, chatlogs, logs, proofs, student_extracurriculars, bills, extracurriculars, parents, students, teachers, users, classes CASCADE;
DROP TYPE bill_status;

CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    username VARCHAR UNIQUE NOT NULL,
    display_name VARCHAR NOT NULL,
    password VARCHAR NOT NULL
);

CREATE TABLE extracurriculars (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    name VARCHAR NOT NULL,
    price INTEGER NOT NULL
);

CREATE TABLE classes (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    name VARCHAR UNIQUE NOT NULL,
    year INTEGER NOT NULL
);

CREATE TABLE parents (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE students (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    name VARCHAR NOT NULL,
    class_id VARCHAR(36) REFERENCES classes(id) ON DELETE CASCADE,
    batch INTEGER NOT NULL,
    special_needs BOOLEAN NOT NULL,
    parent_id VARCHAR(36) REFERENCES parents(id) ON DELETE CASCADE
);

CREATE TABLE student_extracurriculars (
    student_id VARCHAR(36) REFERENCES students(id) ON DELETE CASCADE,
    extracurricular_id VARCHAR(36) REFERENCES extracurriculars(id) ON DELETE CASCADE,
    PRIMARY KEY (student_id, extracurricular_id)
);

CREATE TYPE bill_status AS ENUM ('Not Paid', 'Verifying','Paid', 'Overdue');
CREATE TABLE bills (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    student_id VARCHAR(36) REFERENCES students(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    status bill_status NOT NULL DEFAULT 'Not Paid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '1 month',
    proof VARCHAR(36)
);

CREATE TABLE teachers (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    class_id VARCHAR(36) REFERENCES classes(id) ON DELETE CASCADE NOT NULL
);

CREATE TABLE logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    class_id VARCHAR(36) REFERENCES classes(id) ON DELETE CASCADE,
    for_special_kids BOOLEAN
);

CREATE TABLE admins (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE chatlogs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sender_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    student_id VARCHAR(36) REFERENCES students(id) ON DELETE CASCADE,
    log_id VARCHAR(36) REFERENCES logs(id) ON DELETE CASCADE,
    read BOOLEAN NOT NULL DEFAULT FALSE
);

-- Inserting sample data into `users`
-- Insert users for different roles
INSERT INTO users (username, display_name, password)
VALUES 
('teacher1', 'Teacher One', 'password1'),
('teacher2', 'Teacher Two', 'password2'),
('teacher3', 'Teacher Three', 'password3'),
('parent1', 'Parent One', 'password1'),
('parent2', 'Parent Two', 'password2'),
('parent3', 'Parent Three', 'password3'),
('admin1', 'Admin One', 'password1'),
('admin2', 'Admin Two', 'password2'),
('admin3', 'Admin Three', 'password3');

-- Insert a class that teachers will teach
INSERT INTO classes (name, year)
VALUES 
('Science 101', 2021),
('Math 101', 2021),
('History 101', 2021);

-- Link teachers to classes
INSERT INTO teachers (user_id, class_id)
VALUES 
((SELECT id FROM users WHERE username='teacher1'), (SELECT id FROM classes WHERE name='Science 101')),
((SELECT id FROM users WHERE username='teacher2'), (SELECT id FROM classes WHERE name='Math 101')),
((SELECT id FROM users WHERE username='teacher3'), (SELECT id FROM classes WHERE name='History 101'));

-- Insert parents
INSERT INTO parents (user_id)
VALUES 
((SELECT id FROM users WHERE username='parent1')),
((SELECT id FROM users WHERE username='parent2')),
((SELECT id FROM users WHERE username='parent3'));

-- Insert students, ensuring they are in the same class as a teacher and have the same parent
INSERT INTO students (name, class_id, batch, special_needs, parent_id)
VALUES 
('Student 1A', (SELECT id FROM classes WHERE name='Science 101'), 2022, FALSE, (SELECT id FROM parents WHERE user_id=(SELECT id FROM users WHERE username='parent1'))),
('Student 1B', (SELECT id FROM classes WHERE name='Science 101'), 2022, TRUE,  (SELECT id FROM parents WHERE user_id=(SELECT id FROM users WHERE username='parent1'))),
('Student 2A', (SELECT id FROM classes WHERE name='Math 101'), 2022, FALSE, (SELECT id FROM parents WHERE user_id=(SELECT id FROM users WHERE username='parent2'))),
('Student 2B', (SELECT id FROM classes WHERE name='Math 101'), 2022, TRUE,  (SELECT id FROM parents WHERE user_id=(SELECT id FROM users WHERE username='parent2'))),
('Student 3A', (SELECT id FROM classes WHERE name='History 101'), 2022, FALSE, (SELECT id FROM parents WHERE user_id=(SELECT id FROM users WHERE username='parent3'))),
('Student 3B', (SELECT id FROM classes WHERE name='History 101'), 2022, TRUE,  (SELECT id FROM parents WHERE user_id=(SELECT id FROM users WHERE username='parent3')));

-- Insert admins
INSERT INTO admins (user_id)
VALUES 
((SELECT id FROM users WHERE username='admin1')),
((SELECT id FROM users WHERE username='admin2')),
((SELECT id FROM users WHERE username='admin3'));

-- Insert extracurricular activities
INSERT INTO extracurriculars (name, price)
VALUES 
('Basketball', 200),
('Computer Club', 150);

-- Assign extracurricular activities to students
INSERT INTO student_extracurriculars (student_id, extracurricular_id)
VALUES 
((SELECT id FROM students WHERE name='Student 1A'), (SELECT id FROM extracurriculars WHERE name='Basketball')),
((SELECT id FROM students WHERE name='Student 1B'), (SELECT id FROM extracurriculars WHERE name='Computer Club')),
((SELECT id FROM students WHERE name='Student 2A'), (SELECT id FROM extracurriculars WHERE name='Basketball')),
((SELECT id FROM students WHERE name='Student 2B'), (SELECT id FROM extracurriculars WHERE name='Computer Club')),
((SELECT id FROM students WHERE name='Student 3A'), (SELECT id FROM extracurriculars WHERE name='Basketball')),
((SELECT id FROM students WHERE name='Student 3B'), (SELECT id FROM extracurriculars WHERE name='Computer Club'));

-- Insert bills for students
INSERT INTO bills (student_id, amount, status)
VALUES 
((SELECT id FROM students WHERE name='Student 1A'), 500, 'Paid'),
((SELECT id FROM students WHERE name='Student 1B'), 450, 'Not Paid'),
((SELECT id FROM students WHERE name='Student 2A'), 550, 'Paid'),
((SELECT id FROM students WHERE name='Student 2B'), 450, 'Not Paid');

-- Insert logs related to classes
INSERT INTO logs (message, class_id, for_special_kids)
VALUES 
('Log Entry for Science Class', (SELECT id FROM classes WHERE name='Science 101'), FALSE),
('Log Entry for Math Class', (SELECT id FROM classes WHERE name='Math 101'), FALSE),
('Log Entry for History Class', (SELECT id FROM classes WHERE name='History 101'), TRUE);

-- Insert chatlogs
INSERT INTO chatlogs (message, sender_id, student_id, log_id, read)
VALUES 
('Message from Teacher One', (SELECT id FROM users WHERE username='teacher1'), (SELECT id FROM students WHERE name='Student 1A'), (SELECT id FROM logs WHERE message LIKE '%Science%'), TRUE),
('Message from Parent One', (SELECT id FROM users WHERE username='parent1'), (SELECT id FROM students WHERE name='Student 1B'), (SELECT id FROM logs WHERE message LIKE '%Science%'), FALSE),
('Message from Teacher Two', (SELECT id FROM users WHERE username='teacher2'), (SELECT id FROM students WHERE name='Student 2A'), (SELECT id FROM logs WHERE message LIKE '%Math%'), TRUE),
('Message from Parent Two', (SELECT id FROM users WHERE username='parent2'), (SELECT id FROM students WHERE name='Student 2B'), (SELECT id FROM logs WHERE message LIKE '%Math%'), FALSE);
