var mysql = require('mysql')
config = require('../configuration/APIConfiguration');
var connection

class MysqlClient {
    constructor(){}

    connect() {
        connection = mysql.createConnection(config);
    
          connection.connect(function(err) {
            if (err) throw err;
            console.log("Connected to database!");
          });
    }

    isConnected() {
        return connection.state === 'authenticated'
    }

    query(query) {
      return new Promise((resolve, reject) => {
        connection.query(query, function(err, rows) {
          if (err) { 
            reject(err)
          }
  
          resolve(rows)
        })
      }).then(result)
      .catch(err)
    }

}

module.exports = MysqlClient