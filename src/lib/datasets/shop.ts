// "Shop" dataset: an online store with customers, products and orders.
export const shopSql = `
CREATE TABLE customers (
  id           INTEGER PRIMARY KEY,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL UNIQUE,
  city         TEXT NOT NULL,
  country      TEXT NOT NULL,
  signup_date  DATE NOT NULL
);

CREATE TABLE products (
  id        INTEGER PRIMARY KEY,
  name      TEXT NOT NULL,
  category  TEXT NOT NULL,
  price     NUMERIC(10,2) NOT NULL,
  stock     INTEGER NOT NULL
);

CREATE TABLE orders (
  id           INTEGER PRIMARY KEY,
  customer_id  INTEGER REFERENCES customers(id),
  order_date   DATE NOT NULL,
  status       TEXT NOT NULL CHECK (status IN ('pending','shipped','delivered','cancelled'))
);

CREATE TABLE order_items (
  order_id    INTEGER REFERENCES orders(id),
  product_id  INTEGER REFERENCES products(id),
  quantity    INTEGER NOT NULL,
  unit_price  NUMERIC(10,2) NOT NULL,
  PRIMARY KEY (order_id, product_id)
);

INSERT INTO customers VALUES
  (1,  'Aarav Shah',      'aarav@mail.com',    'Mumbai',    'India',     '2023-01-05'),
  (2,  'Diya Patel',      'diya@mail.com',     'Ahmedabad', 'India',     '2023-02-14'),
  (3,  'Kabir Malhotra',  'kabir@mail.com',    'Delhi',     'India',     '2023-03-22'),
  (4,  'Emma Wilson',     'emma@mail.com',     'London',    'UK',        '2023-04-02'),
  (5,  'Liam Brown',      'liam@mail.com',     'Manchester','UK',        '2023-05-19'),
  (6,  'Saanvi Reddy',    'saanvi@mail.com',   'Hyderabad', 'India',     '2023-06-30'),
  (7,  'Noah Smith',      'noah@mail.com',     'New York',  'USA',       '2023-07-11'),
  (8,  'Olivia Johnson',  'olivia@mail.com',   'Austin',    'USA',       '2023-08-08'),
  (9,  'Vihaan Kumar',    'vihaan@mail.com',   'Bengaluru', 'India',     '2023-09-25'),
  (10, 'Ayesha Siddiqui', 'ayesha@mail.com',   'Dubai',     'UAE',       '2023-10-17'),
  (11, 'Lucas Martin',    'lucas@mail.com',    'Paris',     'France',    '2024-01-03'),
  (12, 'Anika Bose',      'anika@mail.com',    'Kolkata',   'India',     '2024-02-20'),
  (13, 'Ethan Clark',     'ethan@mail.com',    'Chicago',   'USA',       '2024-03-15'),
  (14, 'Ishaan Verma',    'ishaan@mail.com',   'Pune',      'India',     '2024-05-09'),
  (15, 'Sofia Rossi',     'sofia@mail.com',    'Milan',     'Italy',     '2024-06-21');

INSERT INTO products VALUES
  (1,  'Wireless Mouse',        'Electronics',  799.00,  150),
  (2,  'Mechanical Keyboard',   'Electronics', 3499.00,   60),
  (3,  'Noise Cancelling Headphones', 'Electronics', 8999.00, 25),
  (4,  'USB-C Charger',         'Electronics', 1299.00,  200),
  (5,  'Cotton T-Shirt',        'Clothing',     499.00,  300),
  (6,  'Denim Jeans',           'Clothing',    1999.00,  120),
  (7,  'Running Shoes',         'Footwear',    4599.00,   80),
  (8,  'Leather Sandals',       'Footwear',    1499.00,    0),
  (9,  'SQL for Beginners',     'Books',        399.00,  500),
  (10, 'Data Science Handbook', 'Books',        899.00,  220),
  (11, 'Steel Water Bottle',    'Home',         599.00,  400),
  (12, 'Ceramic Coffee Mug',    'Home',         349.00,    0),
  (13, 'Desk Lamp',             'Home',        1799.00,   45),
  (14, 'Yoga Mat',              'Sports',      1199.00,   90),
  (15, 'Cricket Bat',           'Sports',      2799.00,   35);

INSERT INTO orders VALUES
  (1,  1,  '2024-01-10', 'delivered'),
  (2,  2,  '2024-01-18', 'delivered'),
  (3,  1,  '2024-02-02', 'delivered'),
  (4,  4,  '2024-02-14', 'delivered'),
  (5,  3,  '2024-03-01', 'cancelled'),
  (6,  6,  '2024-03-09', 'delivered'),
  (7,  7,  '2024-03-21', 'delivered'),
  (8,  9,  '2024-04-05', 'delivered'),
  (9,  1,  '2024-04-18', 'shipped'),
  (10, 8,  '2024-05-02', 'delivered'),
  (11, 10, '2024-05-15', 'delivered'),
  (12, 2,  '2024-06-01', 'cancelled'),
  (13, 11, '2024-06-12', 'delivered'),
  (14, 4,  '2024-07-04', 'delivered'),
  (15, 12, '2024-07-19', 'delivered'),
  (16, 9,  '2024-08-08', 'delivered'),
  (17, 13, '2024-08-27', 'shipped'),
  (18, 3,  '2024-09-10', 'delivered'),
  (19, 6,  '2024-09-30', 'delivered'),
  (20, 1,  '2024-10-15', 'delivered'),
  (21, 7,  '2024-10-29', 'pending'),
  (22, 14, '2024-11-11', 'delivered'),
  (23, 9,  '2024-11-25', 'shipped'),
  (24, 2,  '2024-12-05', 'pending'),
  (25, 4,  '2024-12-20', 'pending');

INSERT INTO order_items VALUES
  (1, 1, 2, 799.00),  (1, 9, 1, 399.00),
  (2, 5, 3, 499.00),  (2, 6, 1, 1999.00),
  (3, 2, 1, 3499.00),
  (4, 3, 1, 8999.00), (4, 4, 2, 1299.00),
  (5, 7, 1, 4599.00),
  (6, 10, 2, 899.00), (6, 9, 2, 399.00),
  (7, 14, 1, 1199.00), (7, 11, 3, 599.00),
  (8, 15, 1, 2799.00), (8, 5, 2, 499.00),
  (9, 13, 1, 1799.00),
  (10, 3, 1, 8999.00),
  (11, 7, 2, 4599.00), (11, 11, 1, 599.00),
  (12, 6, 2, 1999.00),
  (13, 2, 1, 3499.00), (13, 1, 1, 799.00),
  (14, 9, 4, 399.00),
  (15, 12, 4, 349.00), (15, 5, 2, 499.00),
  (16, 4, 1, 1299.00), (16, 1, 1, 799.00),
  (17, 7, 1, 4599.00),
  (18, 10, 1, 899.00),
  (19, 14, 2, 1199.00), (19, 15, 1, 2799.00),
  (20, 3, 1, 8499.00),
  (21, 6, 1, 1999.00),
  (22, 2, 2, 3499.00), (22, 11, 2, 599.00),
  (23, 13, 1, 1799.00),
  (24, 5, 5, 499.00),
  (25, 9, 2, 399.00);
`;
