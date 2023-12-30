var mysql = require('mysql');
require("dotenv").config();
var dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    port: process.env.PORT,
    password:process.env.DB_PASSWORD,
    database: process.env.DB_DBNAME,
};


//#region New Version
var pool = mysql.createPool(dbConfig);

var connection = {
  query: function () {
    var queryArgs = Array.prototype.slice.call(arguments),
      events = [],
      eventNameIndex = {};

    pool.getConnection(function (err, conn) {
      if (err) {
        if (eventNameIndex.error) {
          eventNameIndex.error();
        }
      }
      if (conn) {
        var q = conn.query.apply(conn, queryArgs);
        q.on('end', function () {
          conn.release();
        });

        events.forEach(function (args) {
          q.on.apply(q, args);
        });
      }
    });

    return {
      on: function (eventName, callback) {
        events.push(Array.prototype.slice.call(arguments));
        eventNameIndex[eventName] = callback;
        return this;
      }
    };
  }
};


module.exports = connection;
//#endregion