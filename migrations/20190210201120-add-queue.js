'use strict'

exports.up = function (db) {
  return db.runSql(`
    CREATE TABLE queue (
      queue_id   INTEGER PRIMARY KEY,
      sender       INTEGER    NOT NULL,
      recipient    INTEGER,
      message TEXT
    );
  `)
}

exports.down = function (db) {
  return db.runSql(`
    DROP TABLE queue;
`)
}
