'use strict'

exports.up = function (db) {
  return db.runSql(`
    CREATE TABLE nodes (
        node_id INTEGER PRIMARY KEY AUTOINCREMENT,
        token text NOT NULL,
        ipfs_hash text NOT NULL,
        information text,
        protocol varchar(10) NOT NULL,
        resource text
    );
  `)
}

exports.down = function (db) {
  return db.runSql(`
    DROP TABLE nodes;
`)
}
