// "Movies" dataset: fictional films, directors, actors and cast lists.
export const moviesSql = `
CREATE TABLE directors (
  id       INTEGER PRIMARY KEY,
  name     TEXT NOT NULL,
  country  TEXT NOT NULL
);

CREATE TABLE movies (
  id             INTEGER PRIMARY KEY,
  title          TEXT NOT NULL,
  release_year   INTEGER NOT NULL,
  genre          TEXT NOT NULL,
  language       TEXT NOT NULL,
  duration_min   INTEGER NOT NULL,
  rating         NUMERIC(3,1) NOT NULL,
  box_office_cr  NUMERIC(8,2) NOT NULL,
  director_id    INTEGER REFERENCES directors(id)
);

CREATE TABLE actors (
  id          INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,
  birth_year  INTEGER NOT NULL
);

CREATE TABLE movie_cast (
  movie_id   INTEGER REFERENCES movies(id),
  actor_id   INTEGER REFERENCES actors(id),
  role_name  TEXT NOT NULL,
  PRIMARY KEY (movie_id, actor_id)
);

INSERT INTO directors VALUES
  (1, 'Anjali Varma',    'India'),
  (2, 'Marco Bellini',   'Italy'),
  (3, 'Hiroshi Tanaka',  'Japan'),
  (4, 'Sarah Whitfield', 'USA'),
  (5, 'Karan Malik',     'India'),
  (6, 'Camille Laurent', 'France');

INSERT INTO movies VALUES
  (1,  'The Monsoon Letters',     2008, 'Drama',     'Hindi',    142, 8.1, 85.50,  1),
  (2,  'Midnight Express Lane',   2012, 'Thriller',  'English',  118, 7.4, 210.00, 4),
  (3,  'Kites Over Jaipur',       2015, 'Romance',   'Hindi',    155, 7.9, 160.25, 5),
  (4,  'Shadows of Kyoto',        2010, 'Drama',     'Japanese', 128, 8.4, 45.00,  3),
  (5,  'The Last Gondola',        2016, 'Comedy',    'Italian',  101, 6.8, 30.00,  2),
  (6,  'Night of the Fireflies',  2019, 'Horror',    'English',  97,  6.2, 120.00, 4),
  (7,  'Spice Route',             2021, 'Adventure', 'Hindi',    168, 7.2, 340.50, 5),
  (8,  'Paper Boats',             2018, 'Drama',     'Hindi',    134, 8.6, 95.00,  1),
  (9,  'Silent Tides',            2022, 'Thriller',  'Japanese', 112, 7.7, 60.00,  3),
  (10, 'Parisian Nights',         2014, 'Romance',   'French',   109, 7.0, 70.00,  6),
  (11, 'The Clockmaker',          2020, 'Drama',     'French',   131, 8.3, 55.75,  6),
  (12, 'Galaxy Cricket Club',     2023, 'Comedy',    'Hindi',    152, 6.9, 410.00, 5),
  (13, 'Red Planet Diaries',      2017, 'Sci-Fi',    'English',  140, 7.8, 520.00, 4),
  (14, 'Winter in Milan',         2009, 'Romance',   'Italian',  116, 7.3, 25.00,  2),
  (15, 'Ghosts of the Hill Fort', 2024, 'Horror',    'Hindi',    124, 5.9, 75.00,  1),
  (16, 'Neon Samurai',            2023, 'Action',    'Japanese', 121, 7.5, 180.00, 3),
  (17, 'The Night Train',         2005, 'Thriller',  'English',  104, 7.6, 90.00,  4),
  (18, 'Desert Storm Rising',     2024, 'Action',    'Hindi',    171, 6.4, 450.00, 5);

INSERT INTO actors VALUES
  (1,  'Ishita Mehra',    1990),
  (2,  'Vikrant Sood',    1984),
  (3,  'Kabir Anand',     1979),
  (4,  'Sofia Marchetti', 1987),
  (5,  'Kenji Mori',      1975),
  (6,  'Claire Dubois',   1992),
  (7,  'Jake Harmon',     1981),
  (8,  'Nandini Iyer',    1995),
  (9,  'Arjun Bhalla',    1988),
  (10, 'Yuki Sato',       1998);

INSERT INTO movie_cast VALUES
  (1, 3, 'Raghav'),         (1, 1, 'Meenal'),
  (2, 7, 'Detective Cole'),
  (3, 9, 'Aman'),           (3, 1, 'Noor'),
  (4, 5, 'Takeshi'),
  (5, 4, 'Lucia'),
  (6, 7, 'Ben Archer'),     (6, 6, 'Amelie'),
  (7, 2, 'Captain Rana'),   (7, 8, 'Zoya'),
  (8, 3, 'Masterji'),       (8, 8, 'Chhaya'),
  (9, 10, 'Aiko'),          (9, 5, 'Inspector Ono'),
  (10, 6, 'Juliette'),
  (11, 6, 'Margot'),
  (12, 9, 'Rocky'),         (12, 2, 'Coach Bedi'),
  (13, 7, 'Commander Hale'),
  (14, 4, 'Giulia'),
  (15, 1, 'Kamini'),
  (16, 10, 'Hana'),         (16, 5, 'Ronin'),
  (17, 7, 'The Conductor'),
  (18, 2, 'Major Sinha'),   (18, 9, 'Lt. Dev');
`;
