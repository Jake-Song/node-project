var app = require('./config/express')();
var passport = require('./config/passport')(app);

var auth = require('./routes/auth')(passport);
app.use('/auth', auth);

var topic = require('./routes/topic')();
app.use('/topic', topic);

var users = require('./routes/users')();
app.use('/api/v1/users', users);

app.listen(3000, function(){
  console.log('Port 3000 connected!');
});
