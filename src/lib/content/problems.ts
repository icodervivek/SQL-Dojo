import type { DatasetId } from "@/lib/datasets";
import { datasetProblems } from "./problems-datasets";

export type Difficulty = "Easy" | "Medium" | "Hard";

/**
 * Curriculum order. The CRUD basics come first (Create → Read → Update → Delete), then the
 * more advanced querying topics from simplest to hardest. Problems are listed in this order.
 */
export const topics = [
  "Create Table",
  "Insert",
  "Basics",
  "Filtering",
  "Sorting",
  "Update",
  "Delete",
  "Strings",
  "Dates",
  "CASE",
  "Aggregates",
  "Group By",
  "Joins",
  "Subqueries",
  "CTEs",
  "Window Functions",
] as const;

export type Topic = (typeof topics)[number];

export interface Problem {
  slug: string;
  title: string;
  difficulty: Difficulty;
  topic: Topic;
  dataset: DatasetId;
  /** Plain text; `backticks` render as inline code. Blank lines split paragraphs. */
  description: string;
  solution: string;
  /**
   * For problems that change data (INSERT, UPDATE, DELETE, CREATE TABLE): a SELECT that is run
   * after the user's statements. The answer is correct when it returns the same rows as it does
   * after the official solution. Omitted for regular SELECT problems.
   */
  check?: string;
  /** True when the question (or the check query) needs a specific row order. */
  orderMatters: boolean;
  hints: string[];
}

const problemList: Problem[] = [
  // ---------- Create Table ----------
  {
    slug: "create-skills-table",
    title: "Create a Skills Table",
    difficulty: "Easy",
    topic: "Create Table",
    dataset: "company",
    description:
      "Create a new table called `skills` with three columns:\n\n`id` INTEGER, the primary key · `name` TEXT that can't be empty (NOT NULL) · `level` INTEGER",
    solution: "CREATE TABLE skills (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  level INTEGER\n);",
    check: `SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'skills'
ORDER BY ordinal_position`,
    orderMatters: true,
    hints: [
      "The pattern is `CREATE TABLE name (column TYPE, column TYPE, ...);`",
      "Add `PRIMARY KEY` after the id's type, and `NOT NULL` after the name's type.",
    ],
  },
  {
    slug: "create-table-foreign-key",
    title: "Training Sessions with a Foreign Key",
    difficulty: "Medium",
    topic: "Create Table",
    dataset: "company",
    description:
      "Create a table `training_sessions` with these columns:\n\n`id` INTEGER primary key · `employee_id` INTEGER that **references** `employees(id)` · `topic` TEXT NOT NULL · `session_date` DATE\n\nThe foreign key makes sure every session belongs to a real employee.",
    solution: `CREATE TABLE training_sessions (
  id INTEGER PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id),
  topic TEXT NOT NULL,
  session_date DATE
);`,
    check: `SELECT 'column' AS kind, column_name::text AS name, data_type::text AS detail, is_nullable::text AS nullable
FROM information_schema.columns
WHERE table_name = 'training_sessions'
UNION ALL
SELECT 'foreign key', kcu.column_name::text, ccu.table_name::text || '.' || ccu.column_name::text, ''
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON kcu.constraint_name = tc.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'training_sessions' AND tc.constraint_type = 'FOREIGN KEY'`,
    orderMatters: false,
    hints: [
      "Write `REFERENCES employees(id)` right after the column's type.",
      "`employee_id INTEGER REFERENCES employees(id)`",
    ],
  },

  // ---------- Insert ----------
  {
    slug: "insert-department",
    title: "Open a Legal Department",
    difficulty: "Easy",
    topic: "Insert",
    dataset: "company",
    description:
      "The company is opening a new department. Add it to `departments` with id **7**, name **'Legal'** and location **'Delhi'**.",
    solution: "INSERT INTO departments (id, name, location) VALUES (7, 'Legal', 'Delhi');",
    check: "SELECT * FROM departments",
    orderMatters: false,
    hints: ["`INSERT INTO table (columns...) VALUES (values...);`", "Text values go in single quotes: `'Legal'`."],
  },
  {
    slug: "insert-new-hire",
    title: "Welcome the New Hire",
    difficulty: "Easy",
    topic: "Insert",
    dataset: "company",
    description:
      "Riya Sen just joined! Insert her into `employees` with:\n\nid **21** · first name **'Riya'** · last name **'Sen'** · email **'riya.sen@acme.io'** · department **1** · manager **2** · job title **'Software Engineer'** · salary **95000** · hire date **'2025-01-06'** · city **'Kolkata'**",
    solution: `INSERT INTO employees
  (id, first_name, last_name, email, department_id, manager_id, job_title, salary, hire_date, city)
VALUES
  (21, 'Riya', 'Sen', 'riya.sen@acme.io', 1, 2, 'Software Engineer', 95000, '2025-01-06', 'Kolkata');`,
    check: "SELECT * FROM employees",
    orderMatters: false,
    hints: [
      "List all ten columns in parentheses, then the ten values in the same order.",
      "Dates are written as text in `'YYYY-MM-DD'` format.",
    ],
  },
  {
    slug: "insert-multiple-products",
    title: "Two New Products",
    difficulty: "Medium",
    topic: "Insert",
    dataset: "shop",
    description:
      "Add both of these products to `products` using **a single INSERT statement**:\n\n**16**, 'Smart Watch', 'Electronics', price **5999**, stock **40**\n\n**17**, 'Hoodie', 'Clothing', price **1299**, stock **75**",
    solution: `INSERT INTO products (id, name, category, price, stock) VALUES
  (16, 'Smart Watch', 'Electronics', 5999, 40),
  (17, 'Hoodie', 'Clothing', 1299, 75);`,
    check: "SELECT * FROM products",
    orderMatters: false,
    hints: ["One INSERT can add several rows. Separate each `(...)` group with a comma."],
  },
  {
    slug: "insert-from-select",
    title: "Add the Finance Team as Reviewers",
    difficulty: "Hard",
    topic: "Insert",
    dataset: "company",
    description:
      "Every employee in **department 4** (Finance) should review project **7** ('AI Pricing Model'). Add them to `employee_projects` with role **'Reviewer'** and **0** hours.\n\nSkip anyone who is already assigned to project 7, or you'll get a duplicate-key error.",
    solution: `INSERT INTO employee_projects (employee_id, project_id, role, hours)
SELECT id, 7, 'Reviewer', 0
FROM employees
WHERE department_id = 4
  AND id NOT IN (SELECT employee_id FROM employee_projects WHERE project_id = 7);`,
    check: "SELECT * FROM employee_projects",
    orderMatters: false,
    hints: [
      "You can insert the rows a SELECT returns: `INSERT INTO table (columns) SELECT ...`.",
      "Filter out existing members with `id NOT IN (SELECT employee_id FROM employee_projects WHERE project_id = 7)`.",
    ],
  },

  // ---------- Update ----------
  {
    slug: "update-salary",
    title: "Karan's Promotion",
    difficulty: "Easy",
    topic: "Update",
    dataset: "company",
    description:
      "Karan Singh (employee id **6**) got a raise. Set his salary to **85000**. Nobody else's salary should change!",
    solution: "UPDATE employees SET salary = 85000 WHERE id = 6;",
    check: "SELECT id, salary FROM employees",
    orderMatters: false,
    hints: [
      "`UPDATE table SET column = value WHERE condition;`",
      "Without a WHERE clause, every employee would get the new salary!",
    ],
  },
  {
    slug: "update-department-location",
    title: "Marketing Moves Office",
    difficulty: "Easy",
    topic: "Update",
    dataset: "company",
    description: "The **Marketing** department is moving to **Bengaluru**. Update its location.",
    solution: "UPDATE departments SET location = 'Bengaluru' WHERE name = 'Marketing';",
    check: "SELECT * FROM departments",
    orderMatters: false,
    hints: ["You can find the row by its name: `WHERE name = 'Marketing'`."],
  },
  {
    slug: "update-sales-raise",
    title: "10% Raise for Sales",
    difficulty: "Medium",
    topic: "Update",
    dataset: "company",
    description:
      "Great quarter! Increase the salary of everyone in the **Sales** department (department id **2**) by **10%**.",
    solution: "UPDATE employees SET salary = salary * 1.10 WHERE department_id = 2;",
    check: "SELECT id, salary FROM employees",
    orderMatters: false,
    hints: ["The new value can be computed from the old one: `SET salary = salary * 1.10`."],
  },
  {
    slug: "update-restock",
    title: "Restock Empty Shelves",
    difficulty: "Medium",
    topic: "Update",
    dataset: "shop",
    description: "Set the `stock` of every product that is **out of stock** (stock is 0) to **100**.",
    solution: "UPDATE products SET stock = 100 WHERE stock = 0;",
    check: "SELECT id, stock FROM products",
    orderMatters: false,
    hints: ["Use the same WHERE you'd use to SELECT the out-of-stock products."],
  },
  {
    slug: "update-with-subquery",
    title: "Cancel Pending UK Orders",
    difficulty: "Hard",
    topic: "Update",
    dataset: "shop",
    description:
      "Shipping to the UK is paused. Change the status of every **pending** order placed by a customer from the **UK** to **'cancelled'**.",
    solution: `UPDATE orders
SET status = 'cancelled'
WHERE status = 'pending'
  AND customer_id IN (SELECT id FROM customers WHERE country = 'UK');`,
    check: "SELECT id, status FROM orders",
    orderMatters: false,
    hints: [
      "The country is in `customers`, but you're updating `orders`.",
      "Use a subquery: `customer_id IN (SELECT id FROM customers WHERE country = 'UK')`.",
    ],
  },

  // ---------- Delete ----------
  {
    slug: "delete-product",
    title: "Discontinue a Product",
    difficulty: "Easy",
    topic: "Delete",
    dataset: "shop",
    description: "The shop stopped selling **'Leather Sandals'**. Delete that product.",
    solution: "DELETE FROM products WHERE name = 'Leather Sandals';",
    check: "SELECT * FROM products",
    orderMatters: false,
    hints: ["`DELETE FROM table WHERE condition;`", "Always double-check the WHERE. Without it, every row is deleted!"],
  },
  {
    slug: "delete-project-member",
    title: "Leaving the Project",
    difficulty: "Easy",
    topic: "Delete",
    dataset: "company",
    description:
      "Karan (employee id **6**) has left the **Cloud Migration** project (project id **2**). Remove that assignment from `employee_projects`.",
    solution: "DELETE FROM employee_projects WHERE employee_id = 6 AND project_id = 2;",
    check: "SELECT * FROM employee_projects",
    orderMatters: false,
    hints: ["This table's key has two columns, so match both of them with AND."],
  },
  {
    slug: "delete-inactive-customers",
    title: "Remove Inactive Customers",
    difficulty: "Medium",
    topic: "Delete",
    dataset: "shop",
    description: "Delete every customer who has **never placed an order**.",
    solution: "DELETE FROM customers WHERE id NOT IN (SELECT customer_id FROM orders);",
    check: "SELECT id, name FROM customers",
    orderMatters: false,
    hints: [
      "Use a subquery to find customers who have orders: `SELECT customer_id FROM orders`.",
      "Then delete the ones `NOT IN` that list.",
    ],
  },
  {
    slug: "delete-cancelled-orders",
    title: "Clean Up Cancelled Orders",
    difficulty: "Hard",
    topic: "Delete",
    dataset: "shop",
    description:
      "Delete all orders with status **'cancelled'**, **together with their line items** in `order_items`.\n\nTip: `order_items` references `orders`, so the order you delete things in matters.",
    solution: `DELETE FROM order_items
WHERE order_id IN (SELECT id FROM orders WHERE status = 'cancelled');

DELETE FROM orders WHERE status = 'cancelled';`,
    check: `SELECT 'order' AS kind, id::text AS ref FROM orders
UNION ALL
SELECT 'item', order_id || '-' || product_id FROM order_items`,
    orderMatters: false,
    hints: [
      "Deleting the orders first fails, because their items still point at them (a foreign key).",
      "Delete from `order_items` first, then from `orders`. You can write two statements, separated by `;`.",
    ],
  },

  // ---------- Basics ----------
  {
    slug: "list-departments",
    title: "List All Departments",
    difficulty: "Easy",
    topic: "Basics",
    dataset: "company",
    description: "Return every column and every row from the `departments` table.",
    solution: "SELECT * FROM departments;",
    orderMatters: false,
    hints: ["`*` means \"all columns\".", "The pattern is `SELECT * FROM table_name;`"],
  },
  {
    slug: "employee-contacts",
    title: "Employee Contact List",
    difficulty: "Easy",
    topic: "Basics",
    dataset: "company",
    description: "Return the `first_name`, `last_name` and `email` of every employee.",
    solution: "SELECT first_name, last_name, email FROM employees;",
    orderMatters: false,
    hints: ["List the columns you want after SELECT, separated by commas."],
  },

  // ---------- Filtering ----------
  {
    slug: "high-earners",
    title: "High Earners",
    difficulty: "Easy",
    topic: "Filtering",
    dataset: "company",
    description: "Return the `first_name`, `last_name` and `salary` of employees who earn **more than 150000**.",
    solution: "SELECT first_name, last_name, salary FROM employees WHERE salary > 150000;",
    orderMatters: false,
    hints: ["Use a WHERE clause to keep only some rows.", "`WHERE salary > 150000`"],
  },
  {
    slug: "mumbai-delhi-staff",
    title: "Mumbai & Delhi Staff",
    difficulty: "Easy",
    topic: "Filtering",
    dataset: "company",
    description: "Return the `first_name` and `city` of employees based in **Mumbai** or **Delhi**.",
    solution: "SELECT first_name, city FROM employees WHERE city IN ('Mumbai', 'Delhi');",
    orderMatters: false,
    hints: ["You can combine two conditions with OR.", "`IN ('Mumbai', 'Delhi')` is a shorter way to write it."],
  },
  {
    slug: "out-of-stock",
    title: "Out of Stock",
    difficulty: "Easy",
    topic: "Filtering",
    dataset: "shop",
    description: "Return the `name` of every product whose `stock` is **0**.",
    solution: "SELECT name FROM products WHERE stock = 0;",
    orderMatters: false,
    hints: ["In SQL, equality uses a single `=`."],
  },
  {
    slug: "no-department",
    title: "Employees Without a Department",
    difficulty: "Easy",
    topic: "Filtering",
    dataset: "company",
    description: "Return the `first_name` and `job_title` of employees who are not assigned to any department.",
    solution: "SELECT first_name, job_title FROM employees WHERE department_id IS NULL;",
    orderMatters: false,
    hints: ["Missing values are stored as NULL.", "`= NULL` never matches anything. Use `IS NULL` instead."],
  },

  // ---------- Sorting ----------
  {
    slug: "top-5-salaries",
    title: "Top 5 Salaries",
    difficulty: "Easy",
    topic: "Sorting",
    dataset: "company",
    description: "Return the `first_name` and `salary` of the **5 highest-paid** employees, highest salary first.",
    solution: "SELECT first_name, salary FROM employees ORDER BY salary DESC LIMIT 5;",
    orderMatters: true,
    hints: ["ORDER BY ... DESC sorts from largest to smallest.", "LIMIT 5 keeps only the first 5 rows."],
  },
  {
    slug: "newest-hires",
    title: "Newest Hires",
    difficulty: "Easy",
    topic: "Sorting",
    dataset: "company",
    description: "Return the `first_name` and `hire_date` of the **3 most recently hired** employees, newest first.",
    solution: "SELECT first_name, hire_date FROM employees ORDER BY hire_date DESC LIMIT 3;",
    orderMatters: true,
    hints: ["Dates sort just like numbers: later dates are \"bigger\"."],
  },

  // ---------- Aggregates ----------
  {
    slug: "count-employees",
    title: "Headcount",
    difficulty: "Easy",
    topic: "Aggregates",
    dataset: "company",
    description: "Return a single number: the total number of employees.",
    solution: "SELECT COUNT(*) FROM employees;",
    orderMatters: false,
    hints: ["COUNT(*) counts rows."],
  },
  {
    slug: "salary-stats",
    title: "Salary Statistics",
    difficulty: "Easy",
    topic: "Aggregates",
    dataset: "company",
    description:
      "Return three columns: the **minimum**, **maximum** and **average** salary across all employees. Round the average to 2 decimal places.",
    solution: "SELECT MIN(salary), MAX(salary), ROUND(AVG(salary), 2) FROM employees;",
    orderMatters: false,
    hints: ["Use MIN, MAX and AVG together in one SELECT.", "`ROUND(value, 2)` rounds to 2 decimal places."],
  },

  // ---------- Group By ----------
  {
    slug: "employees-per-department",
    title: "Employees per Department",
    difficulty: "Easy",
    topic: "Group By",
    dataset: "company",
    description:
      "For each `department_id`, return the department id and the number of employees in it. Leave out employees who have no department.",
    solution:
      "SELECT department_id, COUNT(*) FROM employees WHERE department_id IS NOT NULL GROUP BY department_id;",
    orderMatters: false,
    hints: ["GROUP BY department_id makes one group per department.", "Filter out NULL departments with WHERE before grouping."],
  },
  {
    slug: "big-departments",
    title: "Big Departments",
    difficulty: "Medium",
    topic: "Group By",
    dataset: "company",
    description: "Return the `department_id` and employee count of departments with **at least 3** employees.",
    solution: "SELECT department_id, COUNT(*) FROM employees GROUP BY department_id HAVING COUNT(*) >= 3;",
    orderMatters: false,
    hints: [
      "WHERE filters rows before grouping. HAVING filters groups after grouping.",
      "`HAVING COUNT(*) >= 3`",
    ],
  },
  {
    slug: "repeat-customers",
    title: "Repeat Customers",
    difficulty: "Medium",
    topic: "Group By",
    dataset: "shop",
    description:
      "Return the `customer_id` and number of orders for every customer who placed **more than 2 orders**, counting orders with any status.",
    solution: "SELECT customer_id, COUNT(*) FROM orders GROUP BY customer_id HAVING COUNT(*) > 2;",
    orderMatters: false,
    hints: ["Group the orders table by customer_id.", "Use HAVING to keep only groups with COUNT(*) > 2."],
  },

  // ---------- Joins ----------
  {
    slug: "employee-departments",
    title: "Employee Department Names",
    difficulty: "Easy",
    topic: "Joins",
    dataset: "company",
    description:
      "Return each employee's `first_name` and the **name** of their department. Only include employees who belong to a department.",
    solution:
      "SELECT e.first_name, d.name FROM employees e JOIN departments d ON d.id = e.department_id;",
    orderMatters: false,
    hints: ["An INNER JOIN keeps only rows that match in both tables.", "Join on `employees.department_id = departments.id`."],
  },
  {
    slug: "all-employees-with-department",
    title: "Everyone and Their Department",
    difficulty: "Medium",
    topic: "Joins",
    dataset: "company",
    description:
      "Return every employee's `first_name` and their department name. Employees **without** a department must still appear, with NULL as the department name.",
    solution:
      "SELECT e.first_name, d.name FROM employees e LEFT JOIN departments d ON d.id = e.department_id;",
    orderMatters: false,
    hints: ["An INNER JOIN drops employees without a match. Which join keeps them?", "Use LEFT JOIN, with employees as the left table."],
  },
  {
    slug: "employee-manager",
    title: "Who Is My Manager?",
    difficulty: "Medium",
    topic: "Joins",
    dataset: "company",
    description:
      "Return two columns: each employee's `first_name` and their manager's `first_name`. Skip employees who have no manager.",
    solution:
      "SELECT e.first_name, m.first_name FROM employees e JOIN employees m ON m.id = e.manager_id;",
    orderMatters: false,
    hints: [
      "The manager is also a row in the employees table, so join the table with itself.",
      "Give the table two aliases, such as `e` for the employee and `m` for the manager.",
    ],
  },
  {
    slug: "customers-without-orders",
    title: "Customers Who Never Ordered",
    difficulty: "Medium",
    topic: "Joins",
    dataset: "shop",
    description: "Return the `name` of every customer who has **never placed an order**.",
    solution:
      "SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL;",
    orderMatters: false,
    hints: [
      "LEFT JOIN customers to orders. Customers with no orders get NULLs in the order columns.",
      "Then keep only rows WHERE the order id IS NULL. `NOT EXISTS` works too.",
    ],
  },
  {
    slug: "order-totals",
    title: "Order Totals",
    difficulty: "Medium",
    topic: "Joins",
    dataset: "shop",
    description:
      "Return each `order_id` and its total value. The total is the sum of `quantity * unit_price` over the order's items.",
    solution: "SELECT order_id, SUM(quantity * unit_price) FROM order_items GROUP BY order_id;",
    orderMatters: false,
    hints: ["You can do arithmetic inside an aggregate: `SUM(quantity * unit_price)`.", "Group by order_id."],
  },
  {
    slug: "revenue-by-category",
    title: "Revenue by Category",
    difficulty: "Medium",
    topic: "Joins",
    dataset: "shop",
    description:
      "Return each product `category` and its total revenue, using `quantity * unit_price`. Ignore orders with status **cancelled**.",
    solution: `SELECT p.category, SUM(oi.quantity * oi.unit_price)
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN orders o ON o.id = oi.order_id
WHERE o.status <> 'cancelled'
GROUP BY p.category;`,
    orderMatters: false,
    hints: [
      "You need three tables: order_items for amounts, products for the category and orders for the status.",
      "Filter with `WHERE o.status <> 'cancelled'`, then GROUP BY category.",
    ],
  },
  {
    slug: "project-hours",
    title: "Project Effort",
    difficulty: "Medium",
    topic: "Joins",
    dataset: "company",
    description:
      "For each project, return its `name`, the **number of people** working on it and their **total hours**. Sort by total hours, highest first.",
    solution: `SELECT p.name, COUNT(*), SUM(ep.hours)
FROM projects p
JOIN employee_projects ep ON ep.project_id = p.id
GROUP BY p.id, p.name
ORDER BY SUM(ep.hours) DESC;`,
    orderMatters: true,
    hints: ["employee_projects links employees to projects.", "Group by project, then ORDER BY SUM(hours) DESC."],
  },

  // ---------- Subqueries ----------
  {
    slug: "above-average-salary",
    title: "Above Average",
    difficulty: "Medium",
    topic: "Subqueries",
    dataset: "company",
    description: "Return the `first_name` and `salary` of employees who earn **more than the average salary**.",
    solution: "SELECT first_name, salary FROM employees WHERE salary > (SELECT AVG(salary) FROM employees);",
    orderMatters: false,
    hints: [
      "You can't write `WHERE salary > AVG(salary)` directly.",
      "Compute the average in a subquery: `(SELECT AVG(salary) FROM employees)`.",
    ],
  },
  {
    slug: "second-highest-salary",
    title: "Second Highest Salary",
    difficulty: "Medium",
    topic: "Subqueries",
    dataset: "company",
    description: "Return a single value: the **second highest** distinct salary in the company. This is a classic interview question.",
    solution: "SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees);",
    orderMatters: false,
    hints: [
      "Find the highest salary first, then the highest salary below it.",
      "Another way: `SELECT DISTINCT salary ... ORDER BY salary DESC LIMIT 1 OFFSET 1`.",
    ],
  },

  // ---------- CTEs ----------
  {
    slug: "top-spenders",
    title: "Top 3 Spenders",
    difficulty: "Hard",
    topic: "CTEs",
    dataset: "shop",
    description:
      "Return the `name` and total spend of the **3 customers who spent the most** on **delivered** orders, highest spend first.",
    solution: `WITH spend AS (
  SELECT o.customer_id, SUM(oi.quantity * oi.unit_price) AS total
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  WHERE o.status = 'delivered'
  GROUP BY o.customer_id
)
SELECT c.name, s.total
FROM spend s
JOIN customers c ON c.id = s.customer_id
ORDER BY s.total DESC
LIMIT 3;`,
    orderMatters: true,
    hints: [
      "First compute each customer's total in a CTE: `WITH spend AS (...)`.",
      "Then join that CTE to customers to get the names, ORDER BY total DESC and LIMIT 3.",
    ],
  },

  // ---------- Window functions ----------
  {
    slug: "salary-rank-in-department",
    title: "Salary Rank in Department",
    difficulty: "Hard",
    topic: "Window Functions",
    dataset: "company",
    description:
      "For every employee who has a department, return `first_name`, `department_id`, `salary`, and their **rank** within their department by salary, highest first. Use RANK().",
    solution: `SELECT first_name, department_id, salary,
       RANK() OVER (PARTITION BY department_id ORDER BY salary DESC)
FROM employees
WHERE department_id IS NOT NULL;`,
    orderMatters: false,
    hints: [
      "Window functions use `OVER (...)`.",
      "`PARTITION BY department_id` restarts the ranking for each department.",
    ],
  },
  {
    slug: "running-revenue",
    title: "Running Monthly Revenue",
    difficulty: "Hard",
    topic: "Window Functions",
    dataset: "shop",
    description:
      "Using only **delivered** orders, return each month as text in the form `YYYY-MM`, that month's revenue, and the **running total** of revenue up to and including that month. Order by month.",
    solution: `WITH monthly AS (
  SELECT TO_CHAR(o.order_date, 'YYYY-MM') AS month,
         SUM(oi.quantity * oi.unit_price) AS revenue
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  WHERE o.status = 'delivered'
  GROUP BY 1
)
SELECT month, revenue, SUM(revenue) OVER (ORDER BY month)
FROM monthly
ORDER BY month;`,
    orderMatters: true,
    hints: [
      "First get revenue per month. `TO_CHAR(order_date, 'YYYY-MM')` gives the month text.",
      "Then use `SUM(revenue) OVER (ORDER BY month)` for the running total.",
    ],
  },

  // ---------- CASE ----------
  {
    slug: "salary-bands",
    title: "Salary Bands",
    difficulty: "Medium",
    topic: "CASE",
    dataset: "company",
    description:
      "Return each employee's `first_name` and a salary band: **'High'** for 150000 and above, **'Medium'** for 90000 up to 149999.99, and **'Low'** otherwise.",
    solution: `SELECT first_name,
       CASE WHEN salary >= 150000 THEN 'High'
            WHEN salary >= 90000 THEN 'Medium'
            ELSE 'Low' END
FROM employees;`,
    orderMatters: false,
    hints: ["`CASE WHEN condition THEN value ... ELSE value END`", "Conditions are checked from top to bottom, and the first match wins."],
  },

  // ---------- Dates ----------
  {
    slug: "hires-per-year",
    title: "Hires per Year",
    difficulty: "Medium",
    topic: "Dates",
    dataset: "company",
    description: "Return each hire **year** and the number of employees hired that year, ordered by year from oldest to newest.",
    solution: `SELECT EXTRACT(YEAR FROM hire_date) AS year, COUNT(*)
FROM employees
GROUP BY 1
ORDER BY 1;`,
    orderMatters: true,
    hints: ["`EXTRACT(YEAR FROM hire_date)` pulls out the year.", "Group by that expression and order by it."],
  },

  // ---------- Strings ----------
  {
    slug: "engineering-full-names",
    title: "Shout the Engineers' Names",
    difficulty: "Easy",
    topic: "Strings",
    dataset: "company",
    description:
      "Return one column: the full name of every employee in **department 1**, written as `FIRST LAST` in UPPERCASE, for example `ANANYA SHARMA`.",
    solution: "SELECT UPPER(first_name || ' ' || last_name) FROM employees WHERE department_id = 1;",
    orderMatters: false,
    hints: ["`||` joins strings together.", "`UPPER(text)` converts text to uppercase."],
  },
];

const difficultyRank: Record<Difficulty, number> = { Easy: 0, Medium: 1, Hard: 2 };

/** All problems in curriculum order: by topic (see `topics`), then Easy → Medium → Hard. */
export const problems: Problem[] = [...problemList, ...datasetProblems].sort(
  (a, b) =>
    topics.indexOf(a.topic) - topics.indexOf(b.topic) || difficultyRank[a.difficulty] - difficultyRank[b.difficulty],
);

export const problemBySlug = new Map(problems.map((p) => [p.slug, p]));
