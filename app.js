let http = require("http");
let fs = require("fs");
let express = require("express");
let bodyParser = require("body-parser");
let path = require("path");
let app = express();
let expressValidator = require('express-validator');
let flash = require('connect-flash');
let session = require('express-session');
let urlencodedParser = bodyParser.urlencoded({ extended: false });

// load view engine
app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'pug');


// var server = http.createServer(function(req,res){
//   res.writeHead(200, {'Content-Type': 'text/html'});
//   fs.createReadStream(__dirname + '/home.html').pipe(res);
//   //res.end();
// });

// set css folder
app.use(express.static(path.join(__dirname, "public")));

// express session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  cookie:{ secure:true }
}))

// express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// express validator middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value){
    var namespace = param.split('.')
    , root  = namespace.shift()
    , formParam = root;

    while(namespace.length){
      formParam += '[' + namespace/shift() + ']';
    }
    return{
      param: formParam,
      msg: msg,
      value: value,
    };
  }
}));


app.get("/", (req, res) =>  {
  res.render("home", { qs: req.query });
});

app.get("/parentLogin", (req, res) =>  {
  res.render("parentLogin", { qs: req.query });
});
app.post("/parentLogin", urlencodedParser, (req, res) =>  {
  console.log(req.body);
  res.render("parentLogin", { qs: req.query });
});
app.get("/parentregister", (req, res) =>  {
  res.render("parentregister", { qs: req.query });
});
app.post("/parentregister", urlencodedParser, (req, res) =>  {
  console.log(req.body);
  res.render("parentregister", { qs: req.query });
});

app.get("/teacherLogin", urlencodedParser, (req, res) =>  {
  res.render("teacherLogin", { qs: req.query });
});

app.post("/teacherLogin", urlencodedParser, (req, res) =>  {
  console.log(req.body);
  res.render("teacherLogin", { qs: req.query });
});
app.get("/teacherregister", (req, res) =>  {
  res.render("teacherregister", { qs: req.query });
});

app.listen(3000, "127.0.0.1");
console.log("listening to port 3000");
