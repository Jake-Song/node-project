module.exports = function(){
  var conn = require('../config/db')();
  var bkfd2Password = require("pbkdf2-password");
  var hasher = bkfd2Password();
  var route = require('express').Router();

  route.get('/', function(req, res, next){
    var sql = "SELECT * FROM users";
    conn.query(sql, function(err, results, fields){
      if(err){
        res.send(JSON.stringify({"status": 500, "error": err, "response": null}));
      } else {
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
      }
    });
  });

  route.post('/', function(req, res, next){
    hasher({password: req.body.password}, function(err, pass, salt, hash){
      var user = {
        authId: 'local:' + req.body.username,
        username: req.body.username,
        password: hash,
        salt: salt,
        displayName: req.body.displayName
      };
      var sql = 'INSERT INTO users SET ?';
      conn.query(sql, user, function(err, results, fields){
        if(err){
          res.send(JSON.stringify({"status": 500, "error": err, "response": null}));
        } else {
          res.send(JSON.stringify({"status": 200, "error": null, "response": user}));
        }
      });
    });
  });

  route.put('/:id', function(req, res, next){
    var username = req.body.username;
    var displayName = req.body.displayName;
    var email = req.body.email;
    var id = req.params.id;
    var sql = "UPDATE users SET username=?, displayName=?, email=? WHERE id=?";
    conn.query(sql, [username, displayName, email, id], function(err, result, fields){
      if(err){
        res.send(JSON.stringify({"status": 500, "error": err, "response": null}));
      } else {
        res.send(JSON.stringify({"status": 200, "error": null, "response": result}));
      }
    });
  });

  route.delete('/:id', function(req, res, next){
    var id = req.params.id;
    var sql = 'DELETE FROM users WHERE id=?';
    conn.query(sql, [id], function(err, result){
      if(err){
        res.send(JSON.stringify({"status": 500, "error": err, "response": null}));
      } else {
        res.send(JSON.stringify({"status": 200, "error": null, "response": result}));
      }
    });
  });

  return route;

}
