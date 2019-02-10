'use strict'

exports.up = function (db) {
  return db.runSql(`
    CREATE TABLE clients (
      client_id   INTEGER PRIMARY KEY,
      token       TEXT    NOT NULL,
      resource    TEXT,
      information TEXT
    );
  `)
}

exports.down = function (db) {
  return db.runSql(`
    DROP TABLE clients;
`)
}
