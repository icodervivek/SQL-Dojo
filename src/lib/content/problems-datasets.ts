// Problems on the Cricket, Hospital, Bank, Movies and School datasets.
// They are merged into the main list (and sorted into curriculum order) in problems.ts.
import type { Problem } from "./problems";

export const datasetProblems: Problem[] = [
  // ======================= More CREATE TABLE =======================
  // The checks below test behavior (do the constraints actually reject bad rows?) rather than
  // the exact spelling of the DDL, so any correct way of writing it passes.
  {
    slug: "create-table-as-select",
    title: "Blockbusters Table",
    difficulty: "Medium",
    topic: "Create Table",
    dataset: "movies",
    description:
      "Create a new table `blockbusters` holding the `title` and `box_office_cr` of every movie that earned **200 crore or more**, all in one statement.",
    solution: "CREATE TABLE blockbusters AS\nSELECT title, box_office_cr FROM movies WHERE box_office_cr >= 200;",
    check: "SELECT * FROM blockbusters",
    orderMatters: false,
    hints: [
      "`CREATE TABLE new_table AS SELECT ...` creates a table and fills it with the query's rows.",
      "The SELECT part is a normal query with a WHERE clause.",
    ],
  },
  {
    slug: "create-table-constraints",
    title: "Feedback Form with Rules",
    difficulty: "Medium",
    topic: "Create Table",
    dataset: "hospital",
    description:
      "Create a table `feedback` with:\n\n`id` INTEGER primary key · `message` TEXT that is **required** · `rating` INTEGER that must be **between 1 and 5** · `created_on` DATE that **defaults to today**\n\nThe checker inserts test rows, including a rating of 6 and a missing message, to make sure your rules really reject bad data.",
    solution: `CREATE TABLE feedback (
  id INTEGER PRIMARY KEY,
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  created_on DATE DEFAULT CURRENT_DATE
);`,
    check: `INSERT INTO feedback (id, message, rating) VALUES (1, 'Very helpful staff', 5);
DO $$ BEGIN
  BEGIN
    INSERT INTO feedback (id, message, rating) VALUES (2, 'Too high', 6);
    RAISE EXCEPTION 'A rating of 6 was accepted. Add a CHECK so rating must be between 1 and 5.';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  BEGIN
    INSERT INTO feedback (id, message, rating) VALUES (3, NULL, 3);
    RAISE EXCEPTION 'A row without a message was accepted. Make message NOT NULL.';
  EXCEPTION WHEN not_null_violation THEN NULL;
  END;
END $$;
SELECT id, message, rating, created_on = CURRENT_DATE AS defaults_to_today FROM feedback`,
    orderMatters: false,
    hints: [
      "Constraints go after the type: `NOT NULL`, `CHECK (rating BETWEEN 1 AND 5)`, `DEFAULT CURRENT_DATE`.",
      "`CURRENT_DATE` is today's date, so it makes a good default for a date column.",
    ],
  },
  {
    slug: "create-table-composite-key",
    title: "Attendance Register",
    difficulty: "Hard",
    topic: "Create Table",
    dataset: "school",
    description:
      "Create a table `attendance` with `student_id` (must reference `students(id)`), `attend_date` DATE, and `present` BOOLEAN that is required and **defaults to true**.\n\nA student can have **only one row per date**, so make `(student_id, attend_date)` the primary key. The checker tests duplicates, unknown students and the default value.",
    solution: `CREATE TABLE attendance (
  student_id INTEGER REFERENCES students(id),
  attend_date DATE,
  present BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (student_id, attend_date)
);`,
    check: `INSERT INTO attendance (student_id, attend_date) VALUES (1, '2024-11-04');
DO $$ BEGIN
  BEGIN
    INSERT INTO attendance (student_id, attend_date) VALUES (1, '2024-11-04');
    RAISE EXCEPTION 'The same student and date were accepted twice. Use PRIMARY KEY (student_id, attend_date).';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;
  BEGIN
    INSERT INTO attendance (student_id, attend_date) VALUES (99, '2024-11-04');
    RAISE EXCEPTION 'Student 99 does not exist but was accepted. Add REFERENCES students(id).';
  EXCEPTION WHEN foreign_key_violation THEN NULL;
  END;
END $$;
SELECT student_id, attend_date, present FROM attendance`,
    orderMatters: false,
    hints: [
      "A primary key over two columns is written as a separate line: `PRIMARY KEY (student_id, attend_date)`.",
      "`present BOOLEAN NOT NULL DEFAULT TRUE` makes the column required, with true as the default.",
    ],
  },

  // ======================= Cricket League =======================
  {
    slug: "cricket-list-teams",
    title: "Meet the Teams",
    difficulty: "Easy",
    topic: "Basics",
    dataset: "cricket",
    description: "Return the `name` and `city` of every team in the league.",
    solution: "SELECT name, city FROM teams;",
    orderMatters: false,
    hints: ["Pick the two columns you need after SELECT."],
  },
  {
    slug: "cricket-overseas-players",
    title: "Overseas Players",
    difficulty: "Easy",
    topic: "Filtering",
    dataset: "cricket",
    description: "Return the `name` and `country` of every player who is **not** from India.",
    solution: "SELECT name, country FROM players WHERE country <> 'India';",
    orderMatters: false,
    hints: ["`<>` (or `!=`) means \"not equal\"."],
  },
  {
    slug: "cricket-most-expensive",
    title: "Auction Superstars",
    difficulty: "Easy",
    topic: "Sorting",
    dataset: "cricket",
    description: "Return the `name` and `price_cr` of the **3 most expensive** players, most expensive first.",
    solution: "SELECT name, price_cr FROM players ORDER BY price_cr DESC LIMIT 3;",
    orderMatters: true,
    hints: ["Sort by price from highest to lowest, then keep 3 rows."],
  },
  {
    slug: "cricket-total-runs",
    title: "Runs in 2024",
    difficulty: "Easy",
    topic: "Aggregates",
    dataset: "cricket",
    description: "Return a single number: the total runs scored by all players in the **2024** season.",
    solution: "SELECT SUM(runs) FROM player_stats WHERE season = 2024;",
    orderMatters: false,
    hints: ["Filter to season 2024 first, then add up the runs with SUM."],
  },
  {
    slug: "cricket-team-wins",
    title: "Wins per Team",
    difficulty: "Medium",
    topic: "Joins",
    dataset: "cricket",
    description:
      "Return each team's `name` and the number of matches it has **won**. Only include teams with at least one win. Matches with no result have a NULL `winner_id`.",
    solution: `SELECT t.name, COUNT(*)
FROM matches m
JOIN teams t ON t.id = m.winner_id
GROUP BY t.name;`,
    orderMatters: false,
    hints: ["Join `matches.winner_id` to `teams.id`.", "Then GROUP BY the team and COUNT the rows."],
  },
  {
    slug: "cricket-strike-rate",
    title: "Aggressive or Anchor?",
    difficulty: "Medium",
    topic: "CASE",
    dataset: "cricket",
    description:
      "For every player who scored **at least 100 runs in 2024**, return their `name`, their strike rate (`runs * 100 / balls_faced`, rounded to 1 decimal) and a style: **'Aggressive'** if the strike rate is 140 or more, otherwise **'Anchor'**.",
    solution: `SELECT p.name,
       ROUND(s.runs * 100.0 / s.balls_faced, 1) AS strike_rate,
       CASE WHEN s.runs * 100.0 / s.balls_faced >= 140 THEN 'Aggressive' ELSE 'Anchor' END AS style
FROM player_stats s
JOIN players p ON p.id = s.player_id
WHERE s.season = 2024 AND s.runs >= 100;`,
    orderMatters: false,
    hints: [
      "Watch out for integer division: `runs * 100 / balls_faced` drops the decimals. Use `100.0`.",
      "Use the same expression inside `CASE WHEN ... >= 140 THEN 'Aggressive' ELSE 'Anchor' END`.",
    ],
  },
  {
    slug: "cricket-top-scorer-per-season",
    title: "Orange Cap Winners",
    difficulty: "Hard",
    topic: "Window Functions",
    dataset: "cricket",
    description: "For each `season`, return the season, the **name** of the player who scored the most runs, and their runs.",
    solution: `SELECT season, name, runs
FROM (
  SELECT s.season, p.name, s.runs,
         RANK() OVER (PARTITION BY s.season ORDER BY s.runs DESC) AS rnk
  FROM player_stats s
  JOIN players p ON p.id = s.player_id
) ranked
WHERE rnk = 1;`,
    orderMatters: false,
    hints: [
      "Rank players within each season: `RANK() OVER (PARTITION BY season ORDER BY runs DESC)`.",
      "You can't filter on a window function in WHERE directly. Wrap it in a subquery or CTE, then keep rank 1.",
    ],
  },
  {
    slug: "cricket-update-titles",
    title: "Champions!",
    difficulty: "Easy",
    topic: "Update",
    dataset: "cricket",
    description: "The **Hyderabad Hawks** just won the league. Increase their `titles` count by 1.",
    solution: "UPDATE teams SET titles = titles + 1 WHERE name = 'Hyderabad Hawks';",
    check: "SELECT id, titles FROM teams",
    orderMatters: false,
    hints: ["`SET titles = titles + 1` adds one to the current value."],
  },

  // ======================= Hospital =======================
  {
    slug: "hospital-cardiologists",
    title: "Find a Cardiologist",
    difficulty: "Easy",
    topic: "Filtering",
    dataset: "hospital",
    description: "Return the `name` and `fee` of every doctor whose specialty is **Cardiology**.",
    solution: "SELECT name, fee FROM doctors WHERE specialty = 'Cardiology';",
    orderMatters: false,
    hints: ["Text comparisons are case-sensitive, so match `'Cardiology'` exactly."],
  },
  {
    slug: "hospital-patient-labels",
    title: "Patient Wristbands",
    difficulty: "Easy",
    topic: "Strings",
    dataset: "hospital",
    description: "Return one column for every patient: their name followed by their blood group in brackets, for example `Aakash Jain (B+)`.",
    solution: "SELECT name || ' (' || blood_group || ')' FROM patients;",
    orderMatters: false,
    hints: ["Join pieces of text with `||`, including the literal `' ('` and `')'`.", "`CONCAT(name, ' (', blood_group, ')')` works too."],
  },
  {
    slug: "hospital-patient-ages",
    title: "How Old Are Our Patients?",
    difficulty: "Medium",
    topic: "Dates",
    dataset: "hospital",
    description:
      "Return each patient's `name` and their **age in whole years** on **1 January 2025**. Use the fixed date `'2025-01-01'` rather than today's date, so the answer never changes.",
    solution: "SELECT name, EXTRACT(YEAR FROM AGE(DATE '2025-01-01', birth_date)) AS age FROM patients;",
    orderMatters: false,
    hints: [
      "`AGE(later_date, earlier_date)` returns an interval like '39 years 6 mons 17 days'.",
      "Pull out just the years with `EXTRACT(YEAR FROM AGE(DATE '2025-01-01', birth_date))`.",
    ],
  },
  {
    slug: "hospital-busiest-doctors",
    title: "Busiest Doctors",
    difficulty: "Medium",
    topic: "Group By",
    dataset: "hospital",
    description: "Return the `doctor_id` and number of **completed** appointments for every doctor with **at least 2** completed appointments.",
    solution: `SELECT doctor_id, COUNT(*)
FROM appointments
WHERE status = 'completed'
GROUP BY doctor_id
HAVING COUNT(*) >= 2;`,
    orderMatters: false,
    hints: ["Filter rows with WHERE status = 'completed', then filter groups with HAVING."],
  },
  {
    slug: "hospital-never-visited",
    title: "Registered but Never Visited",
    difficulty: "Medium",
    topic: "Subqueries",
    dataset: "hospital",
    description: "Return the `name` and `city` of every patient who has **no appointments at all**.",
    solution: `SELECT name, city
FROM patients
WHERE NOT EXISTS (SELECT 1 FROM appointments a WHERE a.patient_id = patients.id);`,
    orderMatters: false,
    hints: [
      "`NOT EXISTS (subquery)` is true when the subquery returns no rows.",
      "A LEFT JOIN with `WHERE a.id IS NULL` works too.",
    ],
  },
  {
    slug: "hospital-doctor-revenue",
    title: "Top Earning Doctors",
    difficulty: "Hard",
    topic: "CTEs",
    dataset: "hospital",
    description:
      "A doctor earns their `fee` for every **completed** appointment. Return the `name` and total earnings of the **3 highest-earning doctors**, highest first.",
    solution: `WITH completed AS (
  SELECT doctor_id, COUNT(*) AS visits
  FROM appointments
  WHERE status = 'completed'
  GROUP BY doctor_id
)
SELECT d.name, c.visits * d.fee AS earnings
FROM completed c
JOIN doctors d ON d.id = c.doctor_id
ORDER BY earnings DESC
LIMIT 3;`,
    orderMatters: true,
    hints: [
      "Step 1 (in a CTE): count completed appointments per doctor.",
      "Step 2: join to doctors, multiply visits by fee, then ORDER BY ... DESC LIMIT 3.",
    ],
  },
  {
    slug: "hospital-book-appointment",
    title: "Book an Appointment",
    difficulty: "Easy",
    topic: "Insert",
    dataset: "hospital",
    description:
      "Book appointment **23**: patient **16** sees doctor **7** on **'2025-02-10'** with status **'scheduled'**. There's no diagnosis yet, so leave it NULL.",
    solution: "INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, status) VALUES (23, 16, 7, '2025-02-10', 'scheduled');",
    check: "SELECT * FROM appointments",
    orderMatters: false,
    hints: ["Columns you leave out of the column list become NULL.", "Or write `NULL` explicitly as the last value."],
  },
  {
    slug: "hospital-mark-no-shows",
    title: "Mark the No-Shows",
    difficulty: "Medium",
    topic: "Update",
    dataset: "hospital",
    description: "Any appointment still **'scheduled'** with a date **before 1 January 2025** was missed. Set the status of those appointments to **'no-show'**.",
    solution: "UPDATE appointments SET status = 'no-show' WHERE status = 'scheduled' AND appointment_date < '2025-01-01';",
    check: "SELECT id, status FROM appointments",
    orderMatters: false,
    hints: ["You need two conditions joined with AND.", "Dates compare like numbers: `appointment_date < '2025-01-01'`."],
  },

  // ======================= Bank =======================
  {
    slug: "bank-list-branches",
    title: "Our Branches",
    difficulty: "Easy",
    topic: "Basics",
    dataset: "bank",
    description: "Return every column of every row in the `branches` table.",
    solution: "SELECT * FROM branches;",
    orderMatters: false,
    hints: ["`SELECT *` returns all columns."],
  },
  {
    slug: "bank-total-deposits",
    title: "Money in the Bank",
    difficulty: "Easy",
    topic: "Aggregates",
    dataset: "bank",
    description: "Return two numbers: how many **active** accounts there are, and their **total balance**.",
    solution: "SELECT COUNT(*), SUM(balance) FROM accounts WHERE status = 'active';",
    orderMatters: false,
    hints: ["You can use COUNT and SUM in the same SELECT."],
  },
  {
    slug: "bank-balance-by-type",
    title: "Balance by Account Type",
    difficulty: "Medium",
    topic: "Group By",
    dataset: "bank",
    description: "For each `account_type`, return the type, the number of accounts and the total balance. Include every status.",
    solution: "SELECT account_type, COUNT(*), SUM(balance) FROM accounts GROUP BY account_type;",
    orderMatters: false,
    hints: ["GROUP BY account_type, then COUNT(*) and SUM(balance)."],
  },
  {
    slug: "bank-above-average",
    title: "Above-Average Accounts",
    difficulty: "Medium",
    topic: "Subqueries",
    dataset: "bank",
    description: "Return the `id` and `balance` of every **active** account whose balance is higher than the **average balance of active accounts**.",
    solution: `SELECT id, balance
FROM accounts
WHERE status = 'active'
  AND balance > (SELECT AVG(balance) FROM accounts WHERE status = 'active');`,
    orderMatters: false,
    hints: ["The subquery needs the same `status = 'active'` filter as the outer query."],
  },
  {
    slug: "bank-defaulters",
    title: "Loan Defaulters",
    difficulty: "Medium",
    topic: "Joins",
    dataset: "bank",
    description: "Return the `full_name` of each customer with a **defaulted** loan, the loan's `principal`, and the **name of their branch**.",
    solution: `SELECT c.full_name, l.principal, b.name
FROM loans l
JOIN customers c ON c.id = l.customer_id
JOIN branches b ON b.id = c.branch_id
WHERE l.status = 'defaulted';`,
    orderMatters: false,
    hints: ["You need three tables: loans → customers → branches."],
  },
  {
    slug: "bank-customer-tier",
    title: "Customer Tiers",
    difficulty: "Medium",
    topic: "CASE",
    dataset: "bank",
    description:
      "Add up each customer's balance across **all** their accounts. Return `full_name`, the total and a tier: **'Platinum'** for 1,000,000 or more, **'Gold'** for 200,000 or more, otherwise **'Silver'**.",
    solution: `SELECT c.full_name,
       SUM(a.balance) AS total,
       CASE WHEN SUM(a.balance) >= 1000000 THEN 'Platinum'
            WHEN SUM(a.balance) >= 200000 THEN 'Gold'
            ELSE 'Silver' END AS tier
FROM customers c
JOIN accounts a ON a.customer_id = c.id
GROUP BY c.id, c.full_name;`,
    orderMatters: false,
    hints: [
      "GROUP BY customer, and SUM the balances.",
      "CASE can test an aggregate: `CASE WHEN SUM(a.balance) >= 1000000 THEN ...`.",
    ],
  },
  {
    slug: "bank-monthly-transactions",
    title: "Transactions per Month",
    difficulty: "Medium",
    topic: "Dates",
    dataset: "bank",
    description: "Return each month as text in the form `YYYY-MM` and the number of transactions in that month, oldest month first.",
    solution: `SELECT TO_CHAR(txn_date, 'YYYY-MM') AS month, COUNT(*)
FROM transactions
GROUP BY 1
ORDER BY 1;`,
    orderMatters: true,
    hints: ["`TO_CHAR(txn_date, 'YYYY-MM')` turns a date into its month text.", "GROUP BY and ORDER BY that expression."],
  },
  {
    slug: "bank-running-balance",
    title: "Running Net Change",
    difficulty: "Hard",
    topic: "Window Functions",
    dataset: "bank",
    description:
      "For account **101**, list every transaction's `txn_date`, its **signed amount** (deposits and transfer_in are positive, withdrawals and transfer_out are negative), and the **running total** of those signed amounts. Oldest first.",
    solution: `SELECT txn_date,
       signed,
       SUM(signed) OVER (ORDER BY txn_date) AS running_total
FROM (
  SELECT txn_date,
         CASE WHEN txn_type IN ('deposit', 'transfer_in') THEN amount ELSE -amount END AS signed
  FROM transactions
  WHERE account_id = 101
) t
ORDER BY txn_date;`,
    orderMatters: true,
    hints: [
      "Turn the amount into + or − with `CASE WHEN txn_type IN ('deposit','transfer_in') THEN amount ELSE -amount END`.",
      "Then `SUM(...) OVER (ORDER BY txn_date)` gives the running total.",
    ],
  },
  {
    slug: "bank-close-empty-accounts",
    title: "Purge Dead Accounts",
    difficulty: "Medium",
    topic: "Delete",
    dataset: "bank",
    description:
      "Delete every account that is **closed**, has a **zero balance**, and has **no transactions** (accounts with transaction history must be kept for auditing).",
    solution: `DELETE FROM accounts
WHERE status = 'closed'
  AND balance = 0
  AND id NOT IN (SELECT account_id FROM transactions);`,
    check: "SELECT id FROM accounts",
    orderMatters: false,
    hints: ["Combine three conditions with AND.", "`id NOT IN (SELECT account_id FROM transactions)` finds accounts without history."],
  },

  // ======================= Movies =======================
  {
    slug: "movies-top-rated",
    title: "Top 5 Rated Movies",
    difficulty: "Easy",
    topic: "Sorting",
    dataset: "movies",
    description: "Return the `title` and `rating` of the **5 highest-rated** movies, best first.",
    solution: "SELECT title, rating FROM movies ORDER BY rating DESC LIMIT 5;",
    orderMatters: true,
    hints: ["ORDER BY rating DESC, then LIMIT 5."],
  },
  {
    slug: "movies-long-films",
    title: "Grab Some Popcorn",
    difficulty: "Easy",
    topic: "Filtering",
    dataset: "movies",
    description: "Return the `title` and `duration_min` of every movie **longer than 150 minutes**.",
    solution: "SELECT title, duration_min FROM movies WHERE duration_min > 150;",
    orderMatters: false,
    hints: ["`WHERE duration_min > 150`"],
  },
  {
    slug: "movies-title-search",
    title: "Search: \"night\"",
    difficulty: "Easy",
    topic: "Strings",
    dataset: "movies",
    description: "Return the `title` of every movie whose title contains the word **night**, ignoring upper/lower case (so 'Midnight' and 'Nights' count too).",
    solution: "SELECT title FROM movies WHERE title ILIKE '%night%';",
    orderMatters: false,
    hints: ["`%` matches any text before or after.", "`ILIKE` is the case-insensitive version of `LIKE` in PostgreSQL."],
  },
  {
    slug: "movies-per-genre",
    title: "Movies per Genre",
    difficulty: "Easy",
    topic: "Group By",
    dataset: "movies",
    description: "Return each `genre` and how many movies belong to it.",
    solution: "SELECT genre, COUNT(*) FROM movies GROUP BY genre;",
    orderMatters: false,
    hints: ["GROUP BY genre and COUNT(*)."],
  },
  {
    slug: "movies-director-stats",
    title: "Director Report Card",
    difficulty: "Medium",
    topic: "Joins",
    dataset: "movies",
    description: "For each director, return their `name`, how many movies they directed, and their **average rating** rounded to 2 decimals.",
    solution: `SELECT d.name, COUNT(*), ROUND(AVG(m.rating), 2)
FROM directors d
JOIN movies m ON m.director_id = d.id
GROUP BY d.id, d.name;`,
    orderMatters: false,
    hints: ["Join movies to directors, then GROUP BY the director."],
  },
  {
    slug: "movies-versatile-actors",
    title: "Versatile Actors",
    difficulty: "Medium",
    topic: "Group By",
    dataset: "movies",
    description: "Return the `name` of every actor who has appeared in movies of **at least 3 different genres**, along with that number of genres.",
    solution: `SELECT a.name, COUNT(DISTINCT m.genre)
FROM actors a
JOIN movie_cast mc ON mc.actor_id = a.id
JOIN movies m ON m.id = mc.movie_id
GROUP BY a.id, a.name
HAVING COUNT(DISTINCT m.genre) >= 3;`,
    orderMatters: false,
    hints: ["`COUNT(DISTINCT genre)` counts each genre once.", "Filter the groups with HAVING."],
  },
  {
    slug: "movies-best-per-decade",
    title: "Box Office King of Each Decade",
    difficulty: "Hard",
    topic: "CTEs",
    dataset: "movies",
    description:
      "For each decade (2000, 2010, 2020), return the decade, the `title` of its **highest-grossing** movie (by `box_office_cr`) and that box office figure.",
    solution: `WITH ranked AS (
  SELECT (release_year / 10) * 10 AS decade,
         title,
         box_office_cr,
         ROW_NUMBER() OVER (PARTITION BY (release_year / 10) * 10 ORDER BY box_office_cr DESC) AS rn
  FROM movies
)
SELECT decade, title, box_office_cr
FROM ranked
WHERE rn = 1;`,
    orderMatters: false,
    hints: [
      "Integer division gives the decade: `(release_year / 10) * 10` turns 2017 into 2010.",
      "Rank movies within each decade in a CTE with ROW_NUMBER(), then keep row 1.",
    ],
  },
  {
    slug: "movies-add-movie",
    title: "Add a New Release",
    difficulty: "Easy",
    topic: "Insert",
    dataset: "movies",
    description:
      "Add movie **19**: 'Monsoon Mission', released **2025**, genre 'Action', language 'Hindi', **146** minutes, rating **7.1**, box office **0** (it just came out), directed by director **5**.",
    solution:
      "INSERT INTO movies (id, title, release_year, genre, language, duration_min, rating, box_office_cr, director_id)\nVALUES (19, 'Monsoon Mission', 2025, 'Action', 'Hindi', 146, 7.1, 0, 5);",
    check: "SELECT * FROM movies",
    orderMatters: false,
    hints: ["Nine columns, nine values, in the same order."],
  },

  // ======================= School =======================
  {
    slug: "school-missing-emails",
    title: "Missing Email Addresses",
    difficulty: "Easy",
    topic: "Filtering",
    dataset: "school",
    description: "Return the `name` and `grade` of students who **don't have an email address** on file.",
    solution: "SELECT name, grade FROM students WHERE email IS NULL;",
    orderMatters: false,
    hints: ["A missing value is NULL. Test it with `IS NULL`, not `= NULL`."],
  },
  {
    slug: "school-email-usernames",
    title: "Email Usernames",
    difficulty: "Medium",
    topic: "Strings",
    dataset: "school",
    description: "For students who have an email, return their `name` and the part of the email **before the @**. For example, `aarohi@school.edu` gives `aarohi`.",
    solution: "SELECT name, SPLIT_PART(email, '@', 1) FROM students WHERE email IS NOT NULL;",
    orderMatters: false,
    hints: ["`SPLIT_PART(text, '@', 1)` returns the piece before the first @."],
  },
  {
    slug: "school-course-averages",
    title: "Average Marks per Course",
    difficulty: "Easy",
    topic: "Aggregates",
    dataset: "school",
    description:
      "Return each course `name` and its average marks rounded to 1 decimal. Absent students have NULL marks. Notice that AVG ignores them automatically.",
    solution: `SELECT c.name, ROUND(AVG(e.marks), 1)
FROM courses c
JOIN enrollments e ON e.course_id = c.id
GROUP BY c.id, c.name;`,
    orderMatters: false,
    hints: ["Join courses to enrollments, GROUP BY course, and use ROUND(AVG(marks), 1)."],
  },
  {
    slug: "school-letter-grades",
    title: "Report Card Grades",
    difficulty: "Medium",
    topic: "CASE",
    dataset: "school",
    description:
      "For every enrollment, return the `student_id`, `course_id` and a letter grade: **'A'** for 90+, **'B'** for 75–89, **'C'** for 50–74, **'F'** below 50, and **'Absent'** when marks are NULL.",
    solution: `SELECT student_id, course_id,
       CASE WHEN marks IS NULL THEN 'Absent'
            WHEN marks >= 90 THEN 'A'
            WHEN marks >= 75 THEN 'B'
            WHEN marks >= 50 THEN 'C'
            ELSE 'F' END AS grade
FROM enrollments;`,
    orderMatters: false,
    hints: [
      "Check for NULL first, because NULL fails every comparison and would otherwise fall through to 'F'.",
      "Then test from the highest band down: >= 90, >= 75, >= 50.",
    ],
  },
  {
    slug: "school-above-course-average",
    title: "Beat the Class Average",
    difficulty: "Hard",
    topic: "Subqueries",
    dataset: "school",
    description: "Return `student_id`, `course_id` and `marks` for every exam where the student scored **above that course's average**.",
    solution: `SELECT e.student_id, e.course_id, e.marks
FROM enrollments e
WHERE e.marks > (
  SELECT AVG(e2.marks) FROM enrollments e2 WHERE e2.course_id = e.course_id
);`,
    orderMatters: false,
    hints: [
      "Each row needs the average of *its own* course. That's a **correlated** subquery.",
      "Inside the subquery, refer to the outer row: `WHERE e2.course_id = e.course_id`.",
    ],
  },
  {
    slug: "school-class-rank",
    title: "Class Rankings",
    difficulty: "Hard",
    topic: "Window Functions",
    dataset: "school",
    description:
      "Add up each student's marks across all their exams (absences count as nothing). Return `name`, `grade`, the total, and their **rank within their grade** (1 = highest total). Use DENSE_RANK.",
    solution: `SELECT s.name, s.grade, SUM(e.marks) AS total,
       DENSE_RANK() OVER (PARTITION BY s.grade ORDER BY SUM(e.marks) DESC) AS rank_in_grade
FROM students s
JOIN enrollments e ON e.student_id = s.id
GROUP BY s.id, s.name, s.grade;`,
    orderMatters: false,
    hints: [
      "First GROUP BY student to get SUM(marks). SUM skips NULLs.",
      "A window function can use an aggregate: `DENSE_RANK() OVER (PARTITION BY grade ORDER BY SUM(e.marks) DESC)`.",
    ],
  },
  {
    slug: "school-fix-email",
    title: "Update a Missing Email",
    difficulty: "Easy",
    topic: "Update",
    dataset: "school",
    description: "Chetna Gill (student id **3**) has given us her email: **'chetna@school.edu'**. Save it.",
    solution: "UPDATE students SET email = 'chetna@school.edu' WHERE id = 3;",
    check: "SELECT id, email FROM students",
    orderMatters: false,
    hints: ["UPDATE ... SET email = '...' WHERE id = 3;"],
  },
  {
    slug: "school-exam-days",
    title: "Exam Weekdays",
    difficulty: "Medium",
    topic: "Dates",
    dataset: "school",
    description: "Return each distinct `exam_date` and the **name of the weekday** it falls on (for example 'Monday'), earliest date first.",
    solution: `SELECT DISTINCT exam_date, TRIM(TO_CHAR(exam_date, 'Day')) AS weekday
FROM enrollments
ORDER BY exam_date;`,
    orderMatters: true,
    hints: [
      "`TO_CHAR(date, 'Day')` gives the weekday name, padded with spaces. Wrap it in TRIM().",
      "Use DISTINCT so each date appears once.",
    ],
  },
];
