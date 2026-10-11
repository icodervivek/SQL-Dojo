// "Bank" dataset: branches, customers, accounts, transactions and loans (all fictional).
export const bankSql = `
CREATE TABLE branches (
  id    INTEGER PRIMARY KEY,
  name  TEXT NOT NULL,
  city  TEXT NOT NULL
);

CREATE TABLE customers (
  id         INTEGER PRIMARY KEY,
  full_name  TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  phone      TEXT NOT NULL,
  city       TEXT NOT NULL,
  branch_id  INTEGER REFERENCES branches(id),
  joined_on  DATE NOT NULL
);

CREATE TABLE accounts (
  id            INTEGER PRIMARY KEY,
  customer_id   INTEGER REFERENCES customers(id),
  account_type  TEXT NOT NULL CHECK (account_type IN ('savings','current','fixed_deposit')),
  balance       NUMERIC(12,2) NOT NULL,
  opened_on     DATE NOT NULL,
  status        TEXT NOT NULL CHECK (status IN ('active','frozen','closed'))
);

CREATE TABLE transactions (
  id          INTEGER PRIMARY KEY,
  account_id  INTEGER REFERENCES accounts(id),
  txn_date    DATE NOT NULL,
  txn_type    TEXT NOT NULL CHECK (txn_type IN ('deposit','withdrawal','transfer_in','transfer_out')),
  amount      NUMERIC(12,2) NOT NULL
);

CREATE TABLE loans (
  id             INTEGER PRIMARY KEY,
  customer_id    INTEGER REFERENCES customers(id),
  loan_type      TEXT NOT NULL,
  principal      NUMERIC(12,2) NOT NULL,
  interest_rate  NUMERIC(4,2) NOT NULL,
  start_date     DATE NOT NULL,
  status         TEXT NOT NULL CHECK (status IN ('active','closed','defaulted'))
);

INSERT INTO branches VALUES
  (1, 'Andheri Branch',         'Mumbai'),
  (2, 'Connaught Place Branch', 'Delhi'),
  (3, 'Koramangala Branch',     'Bengaluru'),
  (4, 'Salt Lake Branch',       'Kolkata');

INSERT INTO customers VALUES
  (1,  'Ritu Agarwal',    'ritu.a@mail.com',    '9820011111', 'Mumbai',    1, '2019-03-14'),
  (2,  'Sameer Kulkarni', 'sameer.k@mail.com',  '9820022222', 'Mumbai',    1, '2020-07-01'),
  (3,  'Tanvi Shetty',    'tanvi.s@mail.com',   '9845033333', 'Bengaluru', 3, '2018-11-20'),
  (4,  'Uday Chopra',     'uday.c@mail.com',    '9810044444', 'Delhi',     2, '2021-01-05'),
  (5,  'Vani Pillai',     'vani.p@mail.com',    '9845055555', 'Bengaluru', 3, '2022-06-17'),
  (6,  'Wasim Akhtar',    'wasim.a@mail.com',   '9830066666', 'Kolkata',   4, '2017-09-09'),
  (7,  'Xavier Dsouza',   'xavier.d@mail.com',  '9820077777', 'Mumbai',    1, '2023-02-28'),
  (8,  'Yamini Sen',      'yamini.s@mail.com',  '9830088888', 'Kolkata',   4, '2020-12-12'),
  (9,  'Zubin Mistry',    'zubin.m@mail.com',   '9810099999', 'Delhi',     2, '2019-05-23'),
  (10, 'Anjali Thakur',   'anjali.t@mail.com',  '9810010101', 'Delhi',     2, '2024-01-15'),
  (11, 'Bharat Naidu',    'bharat.n@mail.com',  '9845012121', 'Bengaluru', 3, '2016-04-04'),
  (12, 'Charu Malhotra',  'charu.m@mail.com',   '9820013131', 'Mumbai',    1, '2024-08-08');

INSERT INTO accounts VALUES
  (101, 1,  'savings',        245000.00,  '2019-03-14', 'active'),
  (102, 1,  'fixed_deposit',  1000000.00, '2021-06-01', 'active'),
  (103, 2,  'savings',        18500.50,   '2020-07-01', 'active'),
  (104, 3,  'current',        532000.00,  '2018-11-20', 'active'),
  (105, 3,  'savings',        76000.00,   '2019-01-10', 'active'),
  (106, 4,  'savings',        0.00,       '2021-01-05', 'closed'),
  (107, 5,  'savings',        129999.99,  '2022-06-17', 'active'),
  (108, 6,  'current',        1450000.00, '2017-09-09', 'active'),
  (109, 6,  'savings',        3200.00,    '2018-02-02', 'frozen'),
  (110, 7,  'savings',        54000.00,   '2023-02-28', 'active'),
  (111, 8,  'savings',        0.00,       '2020-12-12', 'closed'),
  (112, 9,  'fixed_deposit',  500000.00,  '2022-03-03', 'active'),
  (113, 9,  'savings',        88000.00,   '2019-05-23', 'active'),
  (114, 10, 'savings',        15000.00,   '2024-01-15', 'active'),
  (115, 11, 'current',        0.00,       '2016-04-04', 'closed'),
  (116, 11, 'savings',        310000.00,  '2016-04-04', 'active'),
  (117, 12, 'savings',        9000.00,    '2024-08-08', 'active');

INSERT INTO transactions VALUES
  (1,  101, '2024-01-05', 'deposit',      50000),
  (2,  101, '2024-01-20', 'withdrawal',   12000),
  (3,  103, '2024-01-25', 'deposit',      5000),
  (4,  101, '2024-02-03', 'transfer_out', 8000),
  (5,  104, '2024-02-10', 'deposit',      150000),
  (6,  105, '2024-02-14', 'withdrawal',   6000),
  (7,  101, '2024-02-28', 'deposit',      25000),
  (8,  108, '2024-03-01', 'transfer_in',  300000),
  (9,  106, '2024-03-05', 'withdrawal',   4500),
  (10, 110, '2024-03-12', 'deposit',      20000),
  (11, 101, '2024-03-18', 'withdrawal',   3000),
  (12, 113, '2024-03-22', 'deposit',      12000),
  (13, 116, '2024-04-02', 'transfer_in',  45000),
  (14, 104, '2024-04-09', 'transfer_out', 80000),
  (15, 107, '2024-04-15', 'deposit',      30000),
  (16, 101, '2024-04-20', 'transfer_in',  10000),
  (17, 114, '2024-04-28', 'deposit',      15000),
  (18, 103, '2024-05-03', 'withdrawal',   2500),
  (19, 108, '2024-05-10', 'withdrawal',   125000),
  (20, 117, '2024-05-19', 'deposit',      9000);

INSERT INTO loans VALUES
  (1, 1,  'home',      4500000, 8.40,  '2020-05-01', 'active'),
  (2, 3,  'car',       800000,  9.10,  '2021-08-15', 'closed'),
  (3, 4,  'personal',  300000,  13.50, '2022-02-01', 'defaulted'),
  (4, 6,  'business',  2500000, 10.75, '2019-11-11', 'active'),
  (5, 8,  'personal',  150000,  14.00, '2021-03-03', 'defaulted'),
  (6, 9,  'education', 600000,  9.80,  '2023-07-07', 'active'),
  (7, 11, 'home',      3200000, 8.25,  '2018-01-20', 'closed');
`;
