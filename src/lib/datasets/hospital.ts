// "Hospital" dataset: doctors, patients, appointments and prescriptions (all fictional).
export const hospitalSql = `
CREATE TABLE doctors (
  id                INTEGER PRIMARY KEY,
  name              TEXT NOT NULL,
  specialty         TEXT NOT NULL,
  years_experience  INTEGER NOT NULL,
  fee               NUMERIC(8,2) NOT NULL
);

CREATE TABLE patients (
  id           INTEGER PRIMARY KEY,
  name         TEXT NOT NULL,
  gender       CHAR(1) NOT NULL,
  birth_date   DATE NOT NULL,
  city         TEXT NOT NULL,
  blood_group  TEXT NOT NULL
);

CREATE TABLE appointments (
  id                INTEGER PRIMARY KEY,
  patient_id        INTEGER REFERENCES patients(id),
  doctor_id         INTEGER REFERENCES doctors(id),
  appointment_date  DATE NOT NULL,
  status            TEXT NOT NULL CHECK (status IN ('scheduled','completed','cancelled','no-show')),
  diagnosis         TEXT
);

CREATE TABLE prescriptions (
  id              INTEGER PRIMARY KEY,
  appointment_id  INTEGER REFERENCES appointments(id),
  medicine        TEXT NOT NULL,
  dosage_mg       INTEGER NOT NULL,
  days            INTEGER NOT NULL
);

INSERT INTO doctors VALUES
  (1, 'Dr. Meera Krishnan', 'Cardiology',       18, 1500),
  (2, 'Dr. Arvind Shah',    'Cardiology',        9, 1000),
  (3, 'Dr. Fatima Sheikh',  'Pediatrics',       12,  800),
  (4, 'Dr. Rajesh Gupta',   'Orthopedics',      22, 1200),
  (5, 'Dr. Nisha Verma',    'Dermatology',       6,  700),
  (6, 'Dr. Thomas Mathew',  'General Medicine', 15,  500),
  (7, 'Dr. Pooja Desai',    'Neurology',        11, 1800);

INSERT INTO patients VALUES
  (1,  'Aakash Jain',         'M', '1985-06-15', 'Mumbai',    'B+'),
  (2,  'Bhavna Iyer',         'F', '1992-11-02', 'Chennai',   'O+'),
  (3,  'Chirag Patel',        'M', '1978-01-30', 'Ahmedabad', 'A+'),
  (4,  'Divya Rao',           'F', '2015-04-18', 'Bengaluru', 'O-'),
  (5,  'Ehsan Qureshi',       'M', '1969-09-09', 'Hyderabad', 'AB+'),
  (6,  'Farah Khan',          'F', '1988-03-25', 'Mumbai',    'B-'),
  (7,  'Gaurav Mehta',        'M', '2010-12-12', 'Delhi',     'A-'),
  (8,  'Harini Subramanian',  'F', '1995-07-07', 'Chennai',   'O+'),
  (9,  'Imran Siddiqui',      'M', '1955-02-14', 'Lucknow',   'B+'),
  (10, 'Jaya Menon',          'F', '1972-10-21', 'Kochi',     'A+'),
  (11, 'Karthik Reddy',       'M', '2001-05-05', 'Hyderabad', 'O+'),
  (12, 'Lata Joshi',          'F', '1960-08-19', 'Pune',      'AB-'),
  (13, 'Manav Arora',         'M', '2018-01-09', 'Delhi',     'B+'),
  (14, 'Neha Bansal',         'F', '1999-12-31', 'Jaipur',    'A+'),
  (15, 'Om Prakash',          'M', '1948-03-03', 'Varanasi',  'O+'),
  (16, 'Priya Nambiar',       'F', '1983-04-04', 'Kochi',     'A-'),
  (17, 'Rahul Bose',          'M', '1990-01-01', 'Kolkata',   'B+');

INSERT INTO appointments VALUES
  (1,  1,  1, '2024-09-02', 'completed', 'Hypertension'),
  (2,  2,  5, '2024-09-03', 'completed', 'Eczema'),
  (3,  4,  3, '2024-09-05', 'completed', 'Viral fever'),
  (4,  5,  1, '2024-09-10', 'completed', 'Arrhythmia'),
  (5,  9,  1, '2024-09-12', 'completed', 'Coronary artery disease'),
  (6,  3,  4, '2024-09-15', 'cancelled', NULL),
  (7,  6,  6, '2024-09-18', 'completed', 'Migraine'),
  (8,  7,  3, '2024-09-20', 'no-show',   NULL),
  (9,  8,  5, '2024-10-01', 'completed', 'Acne'),
  (10, 10, 4, '2024-10-04', 'completed', 'Osteoarthritis'),
  (11, 12, 4, '2024-10-08', 'completed', 'Osteoporosis'),
  (12, 5,  2, '2024-10-11', 'completed', 'Hypertension'),
  (13, 15, 6, '2024-10-15', 'completed', 'Diabetes'),
  (14, 9,  7, '2024-10-22', 'completed', 'Parkinson disease'),
  (15, 1,  1, '2024-11-05', 'completed', 'Hypertension'),
  (16, 11, 6, '2024-11-12', 'cancelled', NULL),
  (17, 13, 3, '2024-11-19', 'completed', 'Asthma'),
  (18, 14, 5, '2024-12-02', 'scheduled', NULL),
  (19, 2,  6, '2024-12-20', 'scheduled', NULL),
  (20, 3,  4, '2025-01-15', 'scheduled', NULL),
  (21, 6,  7, '2025-01-20', 'scheduled', NULL),
  (22, 15, 1, '2025-02-03', 'scheduled', NULL);

INSERT INTO prescriptions VALUES
  (1,  1,  'Amlodipine',      5,   30),
  (2,  2,  'Hydrocortisone',  10,  14),
  (3,  3,  'Paracetamol',     500, 5),
  (4,  4,  'Metoprolol',      50,  30),
  (5,  5,  'Aspirin',         75,  90),
  (6,  5,  'Atorvastatin',    20,  90),
  (7,  7,  'Sumatriptan',     50,  10),
  (8,  9,  'Doxycycline',     100, 21),
  (9,  10, 'Ibuprofen',       400, 14),
  (10, 11, 'Alendronate',     70,  60),
  (11, 12, 'Telmisartan',     40,  30),
  (12, 13, 'Metformin',       500, 90),
  (13, 14, 'Levodopa',        100, 60),
  (14, 15, 'Amlodipine',      10,  30),
  (15, 17, 'Salbutamol',      2,   10);
`;
