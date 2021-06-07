--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE Challenge (
  id            TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  count_number 	INTEGER NOT NULL,
  count_unit 	TEXT NOT NULL,
  date 			INTEGER NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE Achievements (
  id            TEXT NOT NULL,
  user_id				TEXT NOT NULL,
  exercise_name 		TEXT NOT NULL,
  count_number 			INTEGER NOT NULL,
  count_unit	 		TEXT NOT NULL,
  date 					INTEGER NOT NULL,
  PRIMARY KEY (id)
);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TABLE Challenges;
DROP TABLE Achievements;
