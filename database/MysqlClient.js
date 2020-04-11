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

    async query(sql) {
      var response = await connection.query(sql)
      console.log(JSON.stringify(response))
      return response
  }

}

module.exports = MysqlClient