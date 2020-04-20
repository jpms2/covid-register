var mysql = require('mysql')
config = require('../configuration/APIConfiguration');
const util = require('util');
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

    async query(sql, values) {
      const query = util.promisify(connection.query).bind(connection);
      return await query(sql, values);
  }

}

module.exports = MysqlClient