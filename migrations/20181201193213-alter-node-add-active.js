exports.up = function (db) {
  return db.runSql(`ALTER TABLE nodes ADD active INTEGER DEFAULT 0`)
}

exports.down = function (db) {
  return null
}
