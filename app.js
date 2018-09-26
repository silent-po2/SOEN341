var http = require('http');
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();

var urlencodedParser = bodyParser.urlencoded({ extended: false });

//load view engine
app.set('view engine','ejs');

// var server = http.createServer(function(req,res){
//   res.writeHead(200, {'Content-Type': 'text/html'});
//   fs.createReadStream(__dirname + '/home.html').pipe(res);
//   //res.end();
// });

// set css folder
app.use(express.static(path.join(__dirname, 'css')));

app.get('/home', function (req,res){
  res.sendFile('/home.html', {root: __dirname})
});

app.get('/', function (req,res){
  res.sendFile('/home.html', {root: __dirname})
});

app.get('/parentLogin', function (req,res){
  res.render('parentLogin', {qs: req.query});
});
app.post('/parentLogin', urlencodedParser, function (req,res){
  console.log(req.body);
  res.render('parentLogin', {qs: req.query});
});
app.get('/parentregister', function (req,res){
  res.render('parentregister', {qs: req.query});
});
app.post('/parentregister', urlencodedParser, function (req,res){
  console.log(req.body);
  res.render('parentregister', {qs: req.query});
});

app.get('/teacherLogin', urlencodedParser, function (req,res){
  res.render('teacherLogin', {qs: req.query});
});

app.post('/teacherLogin', urlencodedParser, function (req,res){
  console.log(req.body);
  res.render('teacherLogin', {qs: req.query});
});
app.get('/teacherregister', function (req,res){
  res.render('teacherregister', {qs: req.query});
});

app.listen(3000, '127.0.0.1');
console.log('listening to port 3000');
