--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE Challenge (
  exercise_name TEXT NOT NULL,
  count_number 	INTEGER NOT NULL,
  count_unit 	TEXT NOT NULL,
  date 			INTEGER NOT NULL,
  PRIMARY KEY (exercise_name)
);

CREATE TABLE Achievements (
  user_id				TEXT NOT NULL,
  exercise_name 		TEXT NOT NULL,
  total_count_number 	INTEGER NOT NULL,
  total_count_unit	 	TEXT NOT NULL,
  date 					INTEGER NOT NULL,
  PRIMARY KEY (user_id, exercise_name)
);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TABLE Challenges;
DROP TABLE Achievements;
