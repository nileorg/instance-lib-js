exports.up = function (db) {
  return db.runSql(`
    PRAGMA foreign_keys = 0;
    CREATE TABLE sqlitestudio_temp_table AS SELECT * FROM nodes;
    DROP TABLE nodes;
    CREATE TABLE nodes (
        node_id     INTEGER PRIMARY KEY AUTOINCREMENT,
        token       TEXT    NOT NULL,
        components   TEXT    NOT NULL,
        information TEXT,
        resource    TEXT,
        active      INTEGER DEFAULT 0
    );
    INSERT INTO nodes (
        node_id,
        token,
        components,
        information,
        resource,
        active
    )
    SELECT node_id,
            token,
            ipfs_hash,
            information,
            resource,
            active
    FROM sqlitestudio_temp_table;
    DROP TABLE sqlitestudio_temp_table;
    PRAGMA foreign_keys = 1;  
  `)
}

exports.down = function (db) {
  return db.runSql(`
  PRAGMA foreign_keys = 0;
  CREATE TABLE sqlitestudio_temp_table AS SELECT * FROM nodes;
  DROP TABLE nodes;
  CREATE TABLE nodes (
      node_id     INTEGER PRIMARY KEY AUTOINCREMENT,
      token       TEXT    NOT NULL,
      ipfs_hash   TEXT    NOT NULL,
      information TEXT,
      resource    TEXT,
      active      INTEGER DEFAULT 0
  );
  INSERT INTO nodes (
      node_id,
      token,
      ipfs_hash,
      information,
      resource,
      active
  )
  SELECT node_id,
          token,
          components,
          information,
          resource,
          active
  FROM sqlitestudio_temp_table;
  DROP TABLE sqlitestudio_temp_table;
  PRAGMA foreign_keys = 1;  
`)
}
