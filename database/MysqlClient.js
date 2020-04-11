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
      connection.query(query, function(err, rows) {
        if (err) { console.log(err)}

        return rows
      })
    }

}

module.exports = MysqlClient