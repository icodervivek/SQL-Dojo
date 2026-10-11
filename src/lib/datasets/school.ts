// "School" dataset: students, teachers, courses and exam marks (all fictional).
// A NULL mark means the student was absent for that exam.
export const schoolSql = `
CREATE TABLE teachers (
  id       INTEGER PRIMARY KEY,
  name     TEXT NOT NULL,
  subject  TEXT NOT NULL,
  salary   NUMERIC(10,2) NOT NULL
);

CREATE TABLE courses (
  id          INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,
  teacher_id  INTEGER REFERENCES teachers(id),
  credits     INTEGER NOT NULL
);

CREATE TABLE students (
  id       INTEGER PRIMARY KEY,
  name     TEXT NOT NULL,
  grade    INTEGER NOT NULL,
  section  CHAR(1) NOT NULL,
  gender   CHAR(1) NOT NULL,
  city     TEXT NOT NULL,
  email    TEXT
);

CREATE TABLE enrollments (
  student_id  INTEGER REFERENCES students(id),
  course_id   INTEGER REFERENCES courses(id),
  marks       INTEGER,
  exam_date   DATE NOT NULL,
  PRIMARY KEY (student_id, course_id)
);

INSERT INTO teachers VALUES
  (1, 'Mrs. Kavita Rao',  'Mathematics',      62000),
  (2, 'Mr. Sunil Dutta',  'Physics',          58000),
  (3, 'Ms. Rina George',  'English',          55000),
  (4, 'Mr. Ashok Pandey', 'Chemistry',        57000),
  (5, 'Ms. Farzana Ali',  'Computer Science', 64000);

INSERT INTO courses VALUES
  (1, 'Mathematics',      1, 4),
  (2, 'Physics',          2, 4),
  (3, 'English',          3, 3),
  (4, 'Chemistry',        4, 4),
  (5, 'Computer Science', 5, 3);

INSERT INTO students VALUES
  (1,  'Aarohi Nair',   10, 'A', 'F', 'Kochi',      'aarohi@school.edu'),
  (2,  'Bhuvan Rawat',  10, 'A', 'M', 'Dehradun',   'bhuvan@school.edu'),
  (3,  'Chetna Gill',   10, 'B', 'F', 'Amritsar',   NULL),
  (4,  'Dhruv Saxena',  10, 'B', 'M', 'Lucknow',    'dhruv@school.edu'),
  (5,  'Esha Kaur',     11, 'A', 'F', 'Chandigarh', 'esha@school.edu'),
  (6,  'Faisal Ansari', 11, 'A', 'M', 'Bhopal',     NULL),
  (7,  'Gita Hegde',    11, 'B', 'F', 'Mangaluru',  'gita@school.edu'),
  (8,  'Harsh Vora',    11, 'B', 'M', 'Surat',      'harsh@school.edu'),
  (9,  'Ira Banerjee',  12, 'A', 'F', 'Kolkata',    'ira@school.edu'),
  (10, 'Jai Thakkar',   12, 'A', 'M', 'Rajkot',     NULL),
  (11, 'Kriti Sinha',   12, 'B', 'F', 'Patna',      'kriti@school.edu'),
  (12, 'Laksh Chauhan', 12, 'B', 'M', 'Shimla',     'laksh@school.edu');

INSERT INTO enrollments VALUES
  (1, 1, 95, '2024-11-04'),   (1, 2, 88, '2024-11-06'),   (1, 3, 79, '2024-11-08'),
  (2, 1, 67, '2024-11-04'),   (2, 2, 72, '2024-11-06'),   (2, 5, 91, '2024-11-13'),
  (3, 1, 45, '2024-11-04'),   (3, 3, 83, '2024-11-08'),   (3, 4, 58, '2024-11-11'),
  (4, 1, 78, '2024-11-04'),   (4, 2, NULL, '2024-11-06'), (4, 5, 85, '2024-11-13'),
  (5, 1, 99, '2024-11-04'),   (5, 2, 93, '2024-11-06'),   (5, 4, 90, '2024-11-11'),
  (6, 3, 61, '2024-11-08'),   (6, 4, 49, '2024-11-11'),   (6, 5, 77, '2024-11-13'),
  (7, 1, 82, '2024-11-04'),   (7, 3, 94, '2024-11-08'),   (7, 5, 88, '2024-11-13'),
  (8, 1, 71, '2024-11-04'),   (8, 2, 66, '2024-11-06'),   (8, 4, NULL, '2024-11-11'),
  (9, 1, 88, '2024-11-04'),   (9, 2, 97, '2024-11-06'),   (9, 5, 99, '2024-11-13'),
  (10, 3, 55, '2024-11-08'),  (10, 4, 63, '2024-11-11'),  (10, 5, 70, '2024-11-13'),
  (11, 1, 91, '2024-11-04'),  (11, 3, 87, '2024-11-08'),  (11, 4, 84, '2024-11-11'),
  (12, 1, 58, '2024-11-04'),  (12, 2, 74, '2024-11-06'),  (12, 5, 66, '2024-11-13');
`;
