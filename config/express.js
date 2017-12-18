module.exports = function(){
  var express = require('express');
  var app = express();
  var session = require('express-session');
  var MySQLStore = require('express-mysql-session')(session);
  var bodyParser = require('body-parser');

  app.engine('ejs', require('express-ejs-extend'));
  app.set('views', './views')
  app.set('view engine', 'ejs');
  app.use(bodyParser.urlencoded( {extended: false} ));
  app.use(express.static('./public'));
  app.use(session({
    secret: 'ndjwc;kbwaube121n!#!@',
    resave: false,
    saveUninitialized: true,
    store: new MySQLStore({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'star3244',
      database: 'o2',
    })
  }));
  return app;
}
