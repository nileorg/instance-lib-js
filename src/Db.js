module.exports = class Db {
  constructor (db) {
    this.db = db
  }
  async run (query, parameters) {
    return new Promise((resolve, reject) => {
      this.db.all(query, parameters, (error, results) => {
        if (error) {
          resolve({
            success: false,
            error: error
          })
        }
        resolve({
          success: true,
          results: results
        })
      })
    })
  }
}
