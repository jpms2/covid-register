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

    async query(sql) {
      const query = util.promisify(connection.query).bind(connection);
      console.log("Preparing query")
      return await query(sql);
      
      /*var response = await connection.query(sql)
      console.log("Response was: " + JSON.stringify(response))
      return response*/
  }

}

module.exports = MysqlClient