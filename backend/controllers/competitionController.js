const db = require("../config/db");

exports.start = (req, res) => {
  db.run(
    "INSERT INTO competitions(status,start_time) VALUES('running',datetime('now'))",
  );

  res.json({ message: "Competition started" });
};

exports.stop = (req, res) => {
  db.run("UPDATE competitions SET status='stopped'");

  res.json({ message: "Competition stopped" });
};
