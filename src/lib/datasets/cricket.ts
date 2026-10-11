// "Cricket League" dataset: a fictional T20 league with teams, players, matches and season stats.
export const cricketSql = `
CREATE TABLE teams (
  id          INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,
  short_name  TEXT NOT NULL,
  city        TEXT NOT NULL,
  titles      INTEGER NOT NULL
);

CREATE TABLE players (
  id        INTEGER PRIMARY KEY,
  name      TEXT NOT NULL,
  team_id   INTEGER REFERENCES teams(id),
  role      TEXT NOT NULL CHECK (role IN ('Batter','Bowler','All-rounder','Wicket-keeper')),
  country   TEXT NOT NULL,
  born      DATE NOT NULL,
  price_cr  NUMERIC(5,2) NOT NULL
);

CREATE TABLE matches (
  id              INTEGER PRIMARY KEY,
  season          INTEGER NOT NULL,
  match_date      DATE NOT NULL,
  team1_id        INTEGER REFERENCES teams(id),
  team2_id        INTEGER REFERENCES teams(id),
  venue           TEXT NOT NULL,
  winner_id       INTEGER REFERENCES teams(id),
  won_by_runs     INTEGER,
  won_by_wickets  INTEGER
);

CREATE TABLE player_stats (
  player_id    INTEGER REFERENCES players(id),
  season       INTEGER NOT NULL,
  matches      INTEGER NOT NULL,
  runs         INTEGER NOT NULL,
  balls_faced  INTEGER NOT NULL,
  wickets      INTEGER NOT NULL,
  catches      INTEGER NOT NULL,
  PRIMARY KEY (player_id, season)
);

INSERT INTO teams VALUES
  (1, 'Mumbai Mavericks',   'MUM', 'Mumbai',    5),
  (2, 'Chennai Chargers',   'CHE', 'Chennai',   4),
  (3, 'Bengaluru Blasters', 'BLR', 'Bengaluru', 0),
  (4, 'Kolkata Comets',     'KOL', 'Kolkata',   2),
  (5, 'Delhi Dragons',      'DEL', 'Delhi',     0),
  (6, 'Hyderabad Hawks',    'HYD', 'Hyderabad', 1),
  (7, 'Jaipur Jaguars',     'JAI', 'Jaipur',    1),
  (8, 'Punjab Panthers',    'PUN', 'Mohali',    0);

INSERT INTO players VALUES
  (1,  'Aryan Kapoor',     1, 'Batter',        'India',        '1995-04-12', 15.00),
  (2,  'Jasdeep Malhi',    1, 'Bowler',        'India',        '1993-12-06', 12.00),
  (3,  'Liam Carter',      1, 'All-rounder',   'Australia',    '1997-02-20',  9.50),
  (4,  'Rohit Iyer',       2, 'Batter',        'India',        '1998-08-01', 11.00),
  (5,  'Dev Raghavan',     2, 'Wicket-keeper', 'India',        '1990-07-07',  8.00),
  (6,  'Matt Henshaw',     2, 'Bowler',        'New Zealand',  '1994-03-15',  6.25),
  (7,  'Kunal Rathod',     3, 'Batter',        'India',        '1996-11-05', 17.00),
  (8,  'Faf Botha',        3, 'All-rounder',   'South Africa', '1992-07-13',  7.00),
  (9,  'Siddharth Rao',    3, 'Bowler',        'India',        '2000-01-21',  4.50),
  (10, 'Shreyas Bhat',     4, 'Batter',        'India',        '1994-12-06', 12.25),
  (11, 'Andre Joseph',     4, 'All-rounder',   'West Indies',  '1988-04-29', 13.50),
  (12, 'Varun Nair',       4, 'Bowler',        'India',        '1991-08-29',  8.75),
  (13, 'Rishi Pandey',     5, 'Wicket-keeper', 'India',        '1997-10-04', 16.00),
  (14, 'Ollie Mason',      5, 'Batter',        'England',      '1999-05-30',  6.75),
  (15, 'Kuldeep Saini',    5, 'Bowler',        'India',        '1995-12-14',  7.50),
  (16, 'Abhinav Sharma',   6, 'Batter',        'India',        '2000-09-04',  6.50),
  (17, 'Pat Hughes',       6, 'Bowler',        'Australia',    '1993-05-08', 14.75),
  (18, 'Heinrich du Toit', 6, 'Wicket-keeper', 'South Africa', '1991-07-19', 10.00),
  (19, 'Sanju Menon',      7, 'Wicket-keeper', 'India',        '1994-11-11', 14.00),
  (20, 'Yash Chahal',      7, 'Bowler',        'India',        '1990-07-23',  5.75),
  (21, 'Jos Fletcher',     7, 'Batter',        'England',      '1990-09-08', 10.25),
  (22, 'Shikhar Gill',     8, 'Batter',        'India',        '1999-09-08',  8.25),
  (23, 'Arsh Dhillon',     8, 'Bowler',        'India',        '1999-02-05',  4.00),
  (24, 'Sam Curtis',       8, 'All-rounder',   'England',      '1998-06-03',  9.00);

INSERT INTO matches VALUES
  (1,  2023, '2023-04-01', 1, 2, 'Wankhede Stadium',       2,    NULL, 6),
  (2,  2023, '2023-04-03', 3, 4, 'Chinnaswamy Stadium',    3,    24,   NULL),
  (3,  2023, '2023-04-05', 5, 6, 'Arun Jaitley Stadium',   6,    NULL, 4),
  (4,  2023, '2023-04-08', 7, 8, 'Sawai Mansingh Stadium', 7,    12,   NULL),
  (5,  2023, '2023-04-12', 1, 3, 'Wankhede Stadium',       1,    31,   NULL),
  (6,  2023, '2023-04-15', 2, 4, 'Chepauk',                2,    NULL, 7),
  (7,  2023, '2023-04-18', 6, 7, 'Rajiv Gandhi Stadium',   NULL, NULL, NULL),
  (8,  2023, '2023-04-21', 8, 5, 'PCA Stadium',            8,    NULL, 3),
  (9,  2024, '2024-03-23', 2, 3, 'Chepauk',                2,    18,   NULL),
  (10, 2024, '2024-03-25', 4, 1, 'Eden Gardens',           4,    NULL, 5),
  (11, 2024, '2024-03-28', 6, 8, 'Rajiv Gandhi Stadium',   6,    45,   NULL),
  (12, 2024, '2024-03-31', 7, 5, 'Sawai Mansingh Stadium', 7,    NULL, 6),
  (13, 2024, '2024-04-04', 1, 2, 'Wankhede Stadium',       1,    NULL, 2),
  (14, 2024, '2024-04-07', 3, 6, 'Chinnaswamy Stadium',    6,    NULL, 8),
  (15, 2024, '2024-04-10', 4, 7, 'Eden Gardens',           4,    9,    NULL),
  (16, 2024, '2024-04-14', 5, 8, 'Arun Jaitley Stadium',   5,    NULL, 1);

INSERT INTO player_stats VALUES
  (1,  2023, 8, 450, 330, 0,  3),
  (2,  2023, 8, 20,  25,  18, 1),
  (4,  2023, 8, 300, 240, 0,  2),
  (7,  2023, 8, 380, 290, 0,  5),
  (10, 2023, 8, 410, 300, 0,  4),
  (11, 2023, 8, 260, 150, 12, 3),
  (13, 2023, 8, 290, 220, 0,  9),
  (16, 2023, 6, 150, 110, 0,  2),
  (17, 2023, 8, 25,  30,  20, 2),
  (19, 2023, 8, 335, 250, 0,  6),
  (20, 2023, 8, 6,   9,   19, 1),
  (21, 2023, 8, 440, 310, 0,  4),
  (1,  2024, 9, 412, 290, 0,  4),
  (2,  2024, 9, 35,  40,  16, 2),
  (3,  2024, 9, 210, 150, 8,  5),
  (4,  2024, 9, 388, 300, 0,  3),
  (5,  2024, 9, 245, 190, 0,  9),
  (6,  2024, 8, 12,  15,  13, 1),
  (7,  2024, 9, 520, 360, 0,  6),
  (8,  2024, 9, 260, 170, 7,  4),
  (9,  2024, 7, 8,   10,  11, 1),
  (10, 2024, 9, 330, 260, 0,  3),
  (11, 2024, 9, 298, 165, 10, 4),
  (12, 2024, 9, 15,  20,  14, 2),
  (13, 2024, 9, 401, 270, 0,  10),
  (14, 2024, 8, 190, 120, 0,  2),
  (15, 2024, 9, 20,  25,  15, 1),
  (16, 2024, 9, 360, 220, 0,  5),
  (17, 2024, 9, 40,  35,  18, 3),
  (18, 2024, 9, 280, 200, 0,  8),
  (19, 2024, 9, 395, 285, 0,  7),
  (20, 2024, 9, 10,  12,  17, 2),
  (21, 2024, 8, 310, 210, 0,  3),
  (22, 2024, 9, 340, 255, 0,  4),
  (23, 2024, 9, 5,   8,   12, 1),
  (24, 2024, 9, 230, 160, 9,  6);
`;
