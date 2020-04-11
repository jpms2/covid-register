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

    query( sql, args ) {
      return new Promise( (resolve, reject) => {
          this.connection.query(sql, args, ( err, rows ) => {
              if ( err )
                  return reject( err );
              resolve( rows );
          } );
      } );
  }

}

module.exports = MysqlClient