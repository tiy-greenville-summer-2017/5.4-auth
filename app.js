var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mustacheExpress = require('mustache-express');
var session = require('express-session');
var parseurl = require('parseurl');

var app = express();

// Registered users
var users = [
  {'username': 'faith', 'password': 'puppies'},
  {'username': 'dan', 'password': '123456'},
  {'username': 'joel', 'password': 'safepass'}
];

// View engine
app.engine('mustache', mustacheExpress());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'mustache');

// app.use
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extend: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

/**
 * Middleware to require user to be logged in
 *
 * Does a redirect to the login screen if they are not
 * logged in
 */
app.use(function(req, res, next){
  var pathname = parseurl(req).pathname;

  if(!req.session.user && pathname != '/login'){
    res.redirect('/login');
  }else{
    next();
  }
});

app.use(function(req, res, next){
  var views = req.session.views;

  if(!views){
    // req.session.views = {};
    // views = req.session.views;
    views = req.session.views = {};
  }

  var pathname = parseurl(req).pathname;

  views[pathname] = (views[pathname] || 0) + 1;

  next();
});

app.get('/login', function(req, res){
  res.render('login', {});
});

app.post('/login', function(req, res){
  var username = req.body.username;
  var password = req.body.password;

  var person = users.find(function(user){
    return user.username === username;
  });

  if(person && person.password == password){
    req.session.user = person;
  }

  if(req.session.user){
    res.redirect('/foo');
  }else{
    res.redirect('/login');
  }
});

app.get('/foo', function(req, res){
  res.send('you viewed this page ' + req.session.views['/foo'] + ' times');
});

app.get('/bar', function(req, res){
  res.send('you viewed this page ' + req.session.views['/bar'] + ' times');
});

app.listen(3000);
