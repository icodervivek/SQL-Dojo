import type { DatasetId } from "@/lib/datasets";
import type { Topic } from "./problems";

export type LessonBlock = { type: "p"; text: string } | { type: "code"; sql: string };

export interface Lesson {
  slug: string;
  title: string;
  summary: string;
  /** Problems with this topic are suggested as practice after the lesson. */
  topic: Topic;
  dataset: DatasetId;
  body: LessonBlock[];
  /** Starting query for the "Try it" editor. */
  tryIt: string;
}

const lessonList: Lesson[] = [
  {
    slug: "create-table",
    title: "CREATE TABLE: Designing Tables",
    summary: "Define a table, its columns, types and keys.",
    topic: "Create Table",
    dataset: "company",
    body: [
      { type: "p", text: "CRUD stands for **Create, Read, Update, Delete**, the four things you do with data. It all starts with a table to put the data in." },
      { type: "code", sql: "CREATE TABLE students (\n  id         INTEGER PRIMARY KEY,\n  name       TEXT NOT NULL,\n  email      TEXT UNIQUE,\n  joined_on  DATE\n);" },
      { type: "p", text: "Each column has a **type**. Common ones are `INTEGER`, `NUMERIC(10,2)` for money, `TEXT`, `DATE` and `BOOLEAN`." },
      { type: "p", text: "**Constraints** protect your data. `PRIMARY KEY` uniquely identifies each row. `NOT NULL` makes a value required. `UNIQUE` forbids duplicates. `REFERENCES other(id)` (a **foreign key**) makes sure a value exists in another table." },
      { type: "code", sql: "CREATE TABLE enrollments (\n  student_id INTEGER REFERENCES students(id),\n  course     TEXT NOT NULL\n);" },
      { type: "p", text: "`DROP TABLE name;` deletes a table and all of its data, so use it carefully." },
    ],
    tryIt: "CREATE TABLE pets (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  species TEXT\n);\nSELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'pets';",
  },
  {
    slug: "insert",
    title: "INSERT: Adding Rows",
    summary: "Put new data into a table.",
    topic: "Insert",
    dataset: "company",
    body: [
      { type: "p", text: "`INSERT INTO` adds new rows. List the columns, then the values in the same order." },
      { type: "code", sql: "INSERT INTO departments (id, name, location)\nVALUES (10, 'Design', 'Pune');" },
      { type: "p", text: "You can add several rows in one statement by separating each group of values with a comma:" },
      { type: "code", sql: "INSERT INTO departments (id, name, location) VALUES\n  (11, 'Support', 'Chennai'),\n  (12, 'Legal',   'Delhi');" },
      { type: "p", text: "Columns you leave out get their default value (usually NULL). You can also insert the rows a SELECT returns, with `INSERT INTO ... SELECT ...`." },
      { type: "p", text: "If a value breaks a constraint (for example, a duplicate primary key or a missing required value), the database refuses the whole insert." },
    ],
    tryIt: "INSERT INTO departments (id, name, location)\nVALUES (10, 'Design', 'Pune');\n\nSELECT * FROM departments;",
  },
  {
    slug: "update",
    title: "UPDATE: Changing Data",
    summary: "Modify existing rows safely.",
    topic: "Update",
    dataset: "company",
    body: [
      { type: "p", text: "`UPDATE` changes values in existing rows. `SET` says what to change, and `WHERE` says which rows to change." },
      { type: "code", sql: "UPDATE employees\nSET city = 'Mumbai'\nWHERE id = 4;" },
      { type: "p", text: "⚠️ **Always write the WHERE clause.** `UPDATE employees SET salary = 0;` changes every single row." },
      { type: "p", text: "The new value can be calculated from the old one, and you can change several columns at once:" },
      { type: "code", sql: "UPDATE employees\nSET salary = salary * 1.05,\n    job_title = 'Senior ' || job_title\nWHERE department_id = 1 AND salary < 150000;" },
      { type: "p", text: "Tip: run a `SELECT` with the same WHERE first, to see exactly which rows you're about to change." },
    ],
    tryIt: "UPDATE employees SET salary = salary + 5000 WHERE city = 'Pune';\n\nSELECT first_name, city, salary FROM employees WHERE city = 'Pune';",
  },
  {
    slug: "delete",
    title: "DELETE: Removing Rows",
    summary: "Remove rows, and respect foreign keys.",
    topic: "Delete",
    dataset: "shop",
    body: [
      { type: "p", text: "`DELETE FROM` removes the rows that match the WHERE clause." },
      { type: "code", sql: "DELETE FROM products\nWHERE stock = 0 AND category = 'Footwear';" },
      { type: "p", text: "⚠️ Just like UPDATE, `DELETE FROM products;` with no WHERE removes **every** row." },
      { type: "p", text: "**Foreign keys** protect related data. You can't delete an order while rows in `order_items` still point to it. Delete the child rows first, then the parent:" },
      { type: "code", sql: "DELETE FROM order_items WHERE order_id = 5;\nDELETE FROM orders WHERE id = 5;" },
      { type: "p", text: "Subqueries are handy for deciding what to delete, for example customers with no orders: `DELETE FROM customers WHERE id NOT IN (SELECT customer_id FROM orders);`" },
    ],
    tryIt: "DELETE FROM order_items WHERE order_id = 5;\nDELETE FROM orders WHERE id = 5;\n\nSELECT id, status FROM orders WHERE status = 'cancelled';",
  },
  {
    slug: "select-basics",
    title: "SELECT: Reading Data",
    summary: "Pull columns out of a table.",
    topic: "Basics",
    dataset: "company",
    body: [
      { type: "p", text: "A database stores data in **tables**. A table is a grid of rows and columns, much like a spreadsheet. `SELECT` is how you read from one." },
      { type: "code", sql: "SELECT first_name, salary\nFROM employees;" },
      { type: "p", text: "List the columns you want after `SELECT`, then name the table after `FROM`. Use `*` to get every column." },
      { type: "code", sql: "SELECT * FROM departments;" },
      { type: "p", text: "You can rename a column in the output with `AS`. This is called an **alias**." },
      { type: "code", sql: "SELECT first_name AS name, salary AS monthly_pay\nFROM employees;" },
    ],
    tryIt: "SELECT first_name, job_title FROM employees;",
  },
  {
    slug: "where-filtering",
    title: "WHERE: Filtering Rows",
    summary: "Keep only the rows you care about.",
    topic: "Filtering",
    dataset: "company",
    body: [
      { type: "p", text: "`WHERE` keeps only the rows where a condition is true." },
      { type: "code", sql: "SELECT first_name, city\nFROM employees\nWHERE city = 'Pune';" },
      { type: "p", text: "Comparison operators: `=`, `<>` (not equal), `<`, `>`, `<=` and `>=`. Combine conditions with `AND` and `OR`. Text values go in **single quotes**." },
      { type: "code", sql: "SELECT first_name, salary\nFROM employees\nWHERE salary BETWEEN 80000 AND 120000\n  AND city IN ('Delhi', 'Mumbai');" },
      { type: "p", text: "`LIKE` matches patterns, where `%` stands for any text. Missing values are `NULL`, and you test for them with `IS NULL`. `= NULL` never matches anything." },
      { type: "code", sql: "SELECT first_name FROM employees WHERE first_name LIKE 'A%';\nSELECT first_name FROM employees WHERE department_id IS NULL;" },
    ],
    tryIt: "SELECT first_name, salary\nFROM employees\nWHERE salary > 100000;",
  },
  {
    slug: "order-by-limit",
    title: "ORDER BY & LIMIT",
    summary: "Sort results and take the top N.",
    topic: "Sorting",
    dataset: "company",
    body: [
      { type: "p", text: "Without `ORDER BY`, a database can return rows in any order. Use it whenever order matters." },
      { type: "code", sql: "SELECT first_name, salary\nFROM employees\nORDER BY salary DESC;" },
      { type: "p", text: "`ASC` (the default) sorts from smallest to largest, and `DESC` sorts the other way. You can sort by more than one column: `ORDER BY city, salary DESC`." },
      { type: "p", text: "`LIMIT n` keeps the first n rows. `OFFSET k` skips k rows first, which is useful for pagination." },
      { type: "code", sql: "SELECT first_name, hire_date\nFROM employees\nORDER BY hire_date\nLIMIT 3;" },
    ],
    tryIt: "SELECT first_name, salary\nFROM employees\nORDER BY salary DESC\nLIMIT 5;",
  },
  {
    slug: "aggregates",
    title: "Aggregate Functions",
    summary: "COUNT, SUM, AVG, MIN and MAX.",
    topic: "Aggregates",
    dataset: "company",
    body: [
      { type: "p", text: "Aggregate functions turn many rows into one value." },
      { type: "code", sql: "SELECT COUNT(*)        AS employees,\n       SUM(salary)     AS payroll,\n       ROUND(AVG(salary), 2) AS avg_salary,\n       MIN(hire_date)  AS first_hire\nFROM employees;" },
      { type: "p", text: "`COUNT(*)` counts rows. `COUNT(column)` counts only the non-NULL values in that column. `COUNT(DISTINCT column)` counts unique values." },
      { type: "code", sql: "SELECT COUNT(department_id), COUNT(DISTINCT city)\nFROM employees;" },
    ],
    tryIt: "SELECT COUNT(*), MAX(salary) FROM employees;",
  },
  {
    slug: "group-by",
    title: "GROUP BY & HAVING",
    summary: "Aggregate per group, then filter groups.",
    topic: "Group By",
    dataset: "company",
    body: [
      { type: "p", text: "`GROUP BY` splits rows into groups and runs the aggregate once for each group." },
      { type: "code", sql: "SELECT city, COUNT(*) AS people, ROUND(AVG(salary)) AS avg_salary\nFROM employees\nGROUP BY city;" },
      { type: "p", text: "Rule of thumb: every column in SELECT must either be listed in GROUP BY or be inside an aggregate." },
      { type: "p", text: "`WHERE` filters **rows** before grouping. `HAVING` filters **groups** after grouping." },
      { type: "code", sql: "SELECT city, COUNT(*)\nFROM employees\nGROUP BY city\nHAVING COUNT(*) >= 3;" },
    ],
    tryIt: "SELECT department_id, COUNT(*)\nFROM employees\nGROUP BY department_id;",
  },
  {
    slug: "joins",
    title: "JOINs",
    summary: "Combine rows from multiple tables.",
    topic: "Joins",
    dataset: "company",
    body: [
      { type: "p", text: "Related data lives in separate tables, linked by keys. For example, `employees.department_id` points to `departments.id`. A JOIN combines matching rows." },
      { type: "code", sql: "SELECT e.first_name, d.name AS department\nFROM employees e\nJOIN departments d ON d.id = e.department_id;" },
      { type: "p", text: "**INNER JOIN** (or just JOIN) keeps only rows that match in both tables. **LEFT JOIN** keeps every row from the left table and fills in NULL where there's no match." },
      { type: "code", sql: "SELECT e.first_name, d.name AS department\nFROM employees e\nLEFT JOIN departments d ON d.id = e.department_id;" },
      { type: "p", text: "A table can also be joined with itself (a **self join**). Here it finds each employee's manager:" },
      { type: "code", sql: "SELECT e.first_name AS employee, m.first_name AS manager\nFROM employees e\nJOIN employees m ON m.id = e.manager_id;" },
    ],
    tryIt: "SELECT e.first_name, d.name\nFROM employees e\nJOIN departments d ON d.id = e.department_id;",
  },
  {
    slug: "subqueries",
    title: "Subqueries",
    summary: "Use one query's result inside another.",
    topic: "Subqueries",
    dataset: "company",
    body: [
      { type: "p", text: "A subquery is a query in parentheses inside another query. A subquery that returns a single value can be used anywhere a value can." },
      { type: "code", sql: "SELECT first_name, salary\nFROM employees\nWHERE salary > (SELECT AVG(salary) FROM employees);" },
      { type: "p", text: "A subquery that returns a list works with `IN`. `EXISTS` checks whether the subquery returns any rows at all." },
      { type: "code", sql: "SELECT name FROM departments d\nWHERE EXISTS (\n  SELECT 1 FROM projects p WHERE p.department_id = d.id\n);" },
    ],
    tryIt: "SELECT first_name FROM employees\nWHERE department_id IN (SELECT id FROM departments WHERE location = 'Mumbai');",
  },
  {
    slug: "ctes",
    title: "CTEs (WITH)",
    summary: "Name intermediate results for readable queries.",
    topic: "CTEs",
    dataset: "shop",
    body: [
      { type: "p", text: "A **Common Table Expression** gives a subquery a name, so you can build a query step by step." },
      { type: "code", sql: "WITH order_totals AS (\n  SELECT order_id, SUM(quantity * unit_price) AS total\n  FROM order_items\n  GROUP BY order_id\n)\nSELECT * FROM order_totals WHERE total > 5000;" },
      { type: "p", text: "You can chain several CTEs, separated by commas. Each one can use the ones defined before it." },
    ],
    tryIt: "WITH big AS (\n  SELECT * FROM products WHERE price > 2000\n)\nSELECT name, price FROM big ORDER BY price DESC;",
  },
  {
    slug: "window-functions",
    title: "Window Functions",
    summary: "Rankings and running totals without collapsing rows.",
    topic: "Window Functions",
    dataset: "company",
    body: [
      { type: "p", text: "Window functions calculate across related rows but, unlike GROUP BY, keep every row in the result. You recognize them by `OVER (...)`." },
      { type: "code", sql: "SELECT first_name, department_id, salary,\n       RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS dept_rank\nFROM employees;" },
      { type: "p", text: "`PARTITION BY` splits rows into groups, and `ORDER BY` inside OVER sets the order within each group. Common functions are `ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`, `LAG()` and `LEAD()`, as well as aggregates like `SUM() OVER (...)` for running totals." },
      { type: "code", sql: "SELECT first_name, hire_date,\n       COUNT(*) OVER (ORDER BY hire_date) AS headcount_so_far\nFROM employees;" },
    ],
    tryIt: "SELECT first_name, salary,\n       ROW_NUMBER() OVER (ORDER BY salary DESC)\nFROM employees;",
  },
  {
    slug: "case-expressions",
    title: "CASE Expressions",
    summary: "If/else logic inside a query.",
    topic: "CASE",
    dataset: "shop",
    body: [
      { type: "p", text: "`CASE` returns different values depending on conditions. It works like if/else in programming." },
      { type: "code", sql: "SELECT name, price,\n       CASE WHEN price >= 3000 THEN 'Premium'\n            WHEN price >= 1000 THEN 'Standard'\n            ELSE 'Budget' END AS tier\nFROM products;" },
      { type: "p", text: "A useful trick is to put CASE inside an aggregate to count only some rows:" },
      { type: "code", sql: "SELECT COUNT(CASE WHEN status = 'delivered' THEN 1 END) AS delivered,\n       COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled\nFROM orders;" },
    ],
    tryIt: "SELECT name, CASE WHEN stock = 0 THEN 'Sold out' ELSE 'Available' END\nFROM products;",
  },
  {
    slug: "dates-and-strings",
    title: "Dates & Strings",
    summary: "EXTRACT, TO_CHAR, ||, UPPER and friends.",
    topic: "Dates",
    dataset: "company",
    body: [
      { type: "p", text: "Dates: `EXTRACT(YEAR FROM d)` gets part of a date. `TO_CHAR(d, 'YYYY-MM')` formats a date as text. `CURRENT_DATE` is today. Subtracting two dates gives the number of days between them." },
      { type: "code", sql: "SELECT first_name,\n       EXTRACT(YEAR FROM hire_date) AS year,\n       TO_CHAR(hire_date, 'Mon YYYY') AS joined\nFROM employees;" },
      { type: "p", text: "Strings: `||` joins text, `UPPER()` and `LOWER()` change case, `LENGTH()` counts characters, and `SUBSTRING()` and `SPLIT_PART()` cut text into pieces." },
      { type: "code", sql: "SELECT first_name || ' ' || last_name AS full_name,\n       SPLIT_PART(email, '@', 2) AS domain\nFROM employees;" },
    ],
    tryIt: "SELECT UPPER(first_name), EXTRACT(YEAR FROM hire_date)\nFROM employees;",
  },
];

/** The learning path: CRUD basics first, then querying from simplest to most advanced. */
const lessonOrder = [
  "create-table",
  "insert",
  "select-basics",
  "where-filtering",
  "order-by-limit",
  "update",
  "delete",
  "dates-and-strings",
  "case-expressions",
  "aggregates",
  "group-by",
  "joins",
  "subqueries",
  "ctes",
  "window-functions",
];

export const lessons: Lesson[] = [...lessonList].sort((a, b) => lessonOrder.indexOf(a.slug) - lessonOrder.indexOf(b.slug));

export const lessonBySlug = new Map(lessons.map((l) => [l.slug, l]));
