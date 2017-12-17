var express = require('express');
var app = express();
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var mysql = require('mysql');
var bkfd2Password = require("pbkdf2-password");
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var hasher = bkfd2Password();

var conn = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'star3244',
  database : 'o2'
});
conn.connect();

var bodyParser = require('body-parser');

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
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/login', function(req, res){
  var output = `
    <h1>Login</h1>
    <form action="/auth/login" method="POST">
      <p>
        <input type="text" name="username" placeholder="username" />
      </p>
      <p>
        <input type="password" name="password" placeholder="password" />
      </p>
      <p>
        <input type="submit" />
      </p>
    </form>
    <a href="/auth/facebook">Facebook</a>
  `;
  res.send(output);
});

passport.serializeUser(function(user, done) {
  console.log('serializeUser', user);
  done(null, user.username);
});

passport.deserializeUser(function(id, done) {
  console.log('deserializeUser', id);
  for(var i = 0; i < users.length; i++){
    var user = users[i];
    if(user.username === id){
      return done(null, user);
    }
  }
});

passport.use(new LocalStrategy(
  function(username, password, done){

      var uname = username;
      var pwd = password;

      for(var i = 0; i < users.length; i++){
        var user = users[i];
        if(uname === user.username){
          return hasher({password: pwd, salt: user.salt}, function(err, pass, salt, hash){
            if(hash === user.password){
              console.log('LocalStrategy', user);
              done(null, user);
            } else {
              done(null, false);
            }
          });
        }
      }
      done(null, false);
  }
));

passport.use(new FacebookStrategy({
    clientID: '1732964370110628',
    clientSecret: 'e074e79a4737e6e6b051f3f1bad8f566',
    callbackURL: "/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate(..., function(err, user) {
      if (err) { return done(err); }
      done(null, user);
    });
  }
));

app.post(
  '/auth/login',
  passport.authenticate(
    'local',
    {
      successRedirect: '/welcome',
      failureRedirect: '/auth/login',
      failureFlash: false
    }
  )
);

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get(
  '/auth/facebook/callback',
  passport.authenticate(
    'facebook',
    {
      successRedirect: '/welcome',
      failureRedirect: '/auth/login' }
    )
  );

app.get('/auth/logout', function(req, res){
  req.logout();
  req.session.save(function(){
    res.redirect('/welcome');
  });
});

app.get('/auth/register', function(req, res){
  var output = `
    <h1>Register</h1>
    <form action="/auth/register" method="POST">
      <p>
        <input type="text" name="username" placeholder="username" />
      </p>
      <p>
        <input type="password" name="password" placeholder="password" />
      </p>
      <p>
        <input type="text" name="displayName" placeholder="displayName" />
      </p>
      <p>
        <input type="submit" />
      </p>
    </form>
  `;
  res.send(output);
});

var users = [
  {
    username: 'egoing',
    password: 'PKkoCnCoiZFBmNXyuPL/vLy9CCVygSnFvp8UBrVtX1qdU+ZIdqdCuf6wSjMB2mHO45bc04oH2xZ1lh7QgAi815twivUajZbci2pl4Qu0VSs9mTXhTal0TIeYlhyZR2hoBQkXh+9rX77TAhdgxeCderuVDv9Y7vk9QpKPvdCmMBk=',
    salt: 'ECVuU+JZUcVTHOpSiBCQ9GK/j2ZLiJwDuV5pgCiisJj14DjzwuNWNqShI93Yesllv+FiT4blv3yHKwc5HwBx/A==',
    displayName: 'Egoing'
  },
];

app.post('/auth/register', function(req, res){
  hasher({password: req.body.password}, function(err, pass, salt, hash){
    var user = {
      username: req.body.username,
      password: hash,
      salt: salt,
      displayName: req.body.displayName
    };
    users.push(user);
    req.login(user, function(err){
      req.session.save(function(){
        res.redirect('/welcome');
      });
    });
  });
});

app.get('/welcome', function(req, res){
  if(req.user && req.user.displayName){
    res.send(`
      <h1>Hello, ${req.user.displayName}</h1>
      <a href="/auth/logout">Logout</a>
    `);
  } else {
    res.send(`
      <h1>Welcome</h1>
      <ul>
        <li><a href="/auth/register">Register</a></li>
        <li><a href="/auth/login">Login</a></li>
      </ul>
    `);
  }
});

app.get('/topic/add', function(req, res){
  var sql = 'SELECT id, title FROM topic';
  conn.query(sql, function(err, topics, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Sever Error.');
    } else {
      res.render('add', {topics: topics});
    }
  });
});

app.post('/topic/add', function(req, res){
  var title = req.body.title;
  var description = req.body.description;
  var author = req.body.author;
  var sql = 'INSERT INTO topic (title, description, author) VALUES(?, ?, ?)';
  conn.query(sql, [title, description, author] ,function(err, result, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Sever Error.');
    } else {
      res.redirect('/topic/' + result.insertId);
    }
  });
});

app.get('/topic/:id/edit', function(req, res){
  var sql = "SELECT * FROM topic";
  conn.query(sql, function(err, topics, fields){
    var id = req.params.id;
    if(id){
      var sql = 'SELECT * FROM topic WHERE id=?';
      conn.query(sql, [id], function(err, topic, fields){
        if(err){
          console.log(err);
          res.status(500).send('Internal Sever Error.');
        } else {
          res.render('edit', {topics: topics, topic:topic[0]});
        }
      });
    } else {
      console.log('There is no id.');
      res.status(500).send('Internal Sever Error.');
    }
  });
});

app.post('/topic/:id/edit', function(req, res){
  var title = req.body.title;
  var description = req.body.description;
  var author = req.body.author;
  var id = req.params.id;
  var sql = "UPDATE topic SET title=?, description=?, author=? WHERE id=?";
  conn.query(sql, [title, description, author, id], function(err, result, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Sever Error.');
    } else {
      res.redirect('/topic/'+ id);
    }
  });
});

app.get('/topic/:id/delete', function(req, res){
  var sql = "SELECT * FROM topic";
  var id = req.params.id;
  conn.query(sql, function(err, topics, fields){
    var sql = 'SELECT * FROM topic WHERE id=?';
    conn.query(sql, [id], function(err, topic, fields){
      if(err){
        console.log(err);
        res.status(500).send('Internal Sever Error.');
      } else {
        if(topic.length === 0){
          console.log('There is no record.');
          res.status(500).send('Internal Sever Error.');
        } else {
          res.render('delete', {topics: topics, topic:topic[0]});
        }
      }
    });
  });
});

app.post('/topic/:id/delete', function(req, res){
  var id = req.params.id;
  var sql = 'DELETE FROM topic WHERE id=?';
  conn.query(sql, [id], function(err, result){
    res.redirect('/');
  });
});

app.get(['/', '/topic/:id'], function(req, res){
  var sql = "SELECT * FROM topic";
  conn.query(sql, function(err, topics, fields){
    var id = req.params.id;
    if(id){
      var sql = 'SELECT * FROM topic WHERE id=?';
      conn.query(sql, [id], function(err, topic, fields){
        if(err){
          console.log(err);
          res.status(500).send('Internal Sever Error.');
        } else {
          res.render('view', {topics: topics, topic:topic[0]});
        }
      });
    } else {
      res.render('view', {topics: topics, topic: false});
    }
  });
});

app.listen(3000, function(){
  console.log('Port 3000 connected!');
});
