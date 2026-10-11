// "Company" dataset: departments, employees, projects and assignments.
export const companySql = `
CREATE TABLE departments (
  id        INTEGER PRIMARY KEY,
  name      TEXT NOT NULL,
  location  TEXT NOT NULL
);

CREATE TABLE employees (
  id             INTEGER PRIMARY KEY,
  first_name     TEXT NOT NULL,
  last_name      TEXT NOT NULL,
  email          TEXT NOT NULL UNIQUE,
  department_id  INTEGER REFERENCES departments(id),
  manager_id     INTEGER REFERENCES employees(id),
  job_title      TEXT NOT NULL,
  salary         NUMERIC(10,2) NOT NULL,
  hire_date      DATE NOT NULL,
  city           TEXT NOT NULL
);

CREATE TABLE projects (
  id             INTEGER PRIMARY KEY,
  name           TEXT NOT NULL,
  department_id  INTEGER REFERENCES departments(id),
  budget         NUMERIC(12,2) NOT NULL,
  start_date     DATE NOT NULL,
  end_date       DATE
);

CREATE TABLE employee_projects (
  employee_id  INTEGER REFERENCES employees(id),
  project_id   INTEGER REFERENCES projects(id),
  role         TEXT NOT NULL,
  hours        INTEGER NOT NULL,
  PRIMARY KEY (employee_id, project_id)
);

INSERT INTO departments VALUES
  (1, 'Engineering', 'Bengaluru'),
  (2, 'Sales',       'Mumbai'),
  (3, 'Marketing',   'Mumbai'),
  (4, 'Finance',     'Delhi'),
  (5, 'HR',          'Delhi'),
  (6, 'Research',    'Pune');

INSERT INTO employees VALUES
  (1,  'Ananya',  'Sharma',   'ananya.sharma@acme.io',   1, NULL, 'CTO',                  320000, '2015-03-01', 'Bengaluru'),
  (2,  'Rahul',   'Verma',    'rahul.verma@acme.io',     1, 1,    'Engineering Manager',  210000, '2016-07-15', 'Bengaluru'),
  (3,  'Priya',   'Nair',     'priya.nair@acme.io',      1, 2,    'Senior Engineer',      165000, '2017-11-20', 'Bengaluru'),
  (4,  'Arjun',   'Mehta',    'arjun.mehta@acme.io',     1, 2,    'Software Engineer',    120000, '2019-06-03', 'Pune'),
  (5,  'Sneha',   'Iyer',     'sneha.iyer@acme.io',      1, 2,    'Software Engineer',    118000, '2020-01-13', 'Chennai'),
  (6,  'Karan',   'Singh',    'karan.singh@acme.io',     1, 2,    'Junior Engineer',       75000, '2023-08-01', 'Bengaluru'),
  (7,  'Meera',   'Joshi',    'meera.joshi@acme.io',     2, 1,    'Sales Director',       190000, '2016-02-10', 'Mumbai'),
  (8,  'Vikram',  'Rao',      'vikram.rao@acme.io',      2, 7,    'Account Executive',     95000, '2018-09-17', 'Mumbai'),
  (9,  'Pooja',   'Gupta',    'pooja.gupta@acme.io',     2, 7,    'Account Executive',     98000, '2019-04-22', 'Delhi'),
  (10, 'Rohan',   'Das',      'rohan.das@acme.io',       2, 7,    'Sales Associate',       62000, '2022-12-05', 'Kolkata'),
  (11, 'Isha',    'Kapoor',   'isha.kapoor@acme.io',     3, 1,    'Marketing Lead',       150000, '2018-01-08', 'Mumbai'),
  (12, 'Aditya',  'Kulkarni', 'aditya.kulkarni@acme.io', 3, 11,   'Content Strategist',    85000, '2021-03-29', 'Pune'),
  (13, 'Neha',    'Reddy',    'neha.reddy@acme.io',      3, 11,   'SEO Specialist',        80000, '2021-10-11', 'Hyderabad'),
  (14, 'Sanjay',  'Patel',    'sanjay.patel@acme.io',    4, 1,    'Finance Manager',      175000, '2015-09-14', 'Delhi'),
  (15, 'Kavya',   'Menon',    'kavya.menon@acme.io',     4, 14,   'Accountant',            90000, '2020-07-06', 'Delhi'),
  (16, 'Farhan',  'Ali',      'farhan.ali@acme.io',      4, 14,   'Financial Analyst',    105000, '2019-02-18', 'Mumbai'),
  (17, 'Divya',   'Bose',     'divya.bose@acme.io',      5, 1,    'HR Manager',           140000, '2017-05-02', 'Delhi'),
  (18, 'Amit',    'Chauhan',  'amit.chauhan@acme.io',    5, 17,   'Recruiter',             70000, '2022-04-25', 'Delhi'),
  (19, 'Lakshmi', 'Pillai',   'lakshmi.pillai@acme.io',  6, 1,    'Research Scientist',   200000, '2018-08-30', 'Pune'),
  (20, 'Zoya',    'Khan',     'zoya.khan@acme.io',       NULL, 1, 'Executive Assistant',   65000, '2024-02-12', 'Bengaluru');

INSERT INTO projects VALUES
  (1, 'Mobile App Revamp',      1, 2500000, '2024-01-15', '2024-09-30'),
  (2, 'Cloud Migration',        1, 4000000, '2024-04-01', NULL),
  (3, 'Festive Sales Campaign', 3,  800000, '2024-08-01', '2024-11-15'),
  (4, 'CRM Rollout',            2, 1200000, '2023-10-01', '2024-03-31'),
  (5, 'Annual Audit',           4,  300000, '2024-02-01', '2024-04-30'),
  (6, 'Hiring Drive 2025',      5,  450000, '2025-01-10', NULL),
  (7, 'AI Pricing Model',       6, 1800000, '2024-06-01', NULL);

INSERT INTO employee_projects VALUES
  (2, 1, 'Lead',        320),
  (3, 1, 'Developer',   540),
  (4, 1, 'Developer',   610),
  (5, 1, 'Tester',      280),
  (2, 2, 'Lead',        410),
  (3, 2, 'Architect',   390),
  (6, 2, 'Developer',   700),
  (11, 3, 'Lead',       260),
  (12, 3, 'Writer',     340),
  (13, 3, 'Analyst',    300),
  (7, 4, 'Lead',        150),
  (8, 4, 'Member',      220),
  (9, 4, 'Member',      240),
  (14, 5, 'Lead',       180),
  (15, 5, 'Auditor',    260),
  (16, 5, 'Auditor',    230),
  (17, 6, 'Lead',       120),
  (18, 6, 'Recruiter',  400),
  (19, 7, 'Lead',       500),
  (16, 7, 'Analyst',    210),
  (4, 7, 'Developer',   150);
`;
