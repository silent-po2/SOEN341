let http = require("http");
let fs = require("fs");
let express = require("express");
let bodyParser = require("body-parser");
let app = express();
let urlencodedParser = bodyParser.urlencoded({ extended: false });
let Database = require("./db/db");

const port = 3000;

app.set("view engine", "ejs");

// var server = http.createServer(function(req,res){
//   res.writeHead(200, {'Content-Type': 'text/html'});
//   fs.createReadStream(__dirname + '/home.html').pipe(res);
//   //res.end();
// });

app.get("/", (req, res) => {
  res.sendFile("/home.html", { root: __dirname });
});

app.get("/parentLogin", (req, res) => {
  res.render("parentLogin", { qs: req.query });
});

app.post("/parentLogin", urlencodedParser, (req, res) => {
  console.log(req.body);
  res.render("parentLogin", { qs: req.query });
});

app.get("/teacherLogin", urlencodedParser, (req, res) => {
  res.render("teacherLogin", { qs: req.query });
});

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});

// Instantiate database
// This will start a single instance of a db, it will only connect when u call the query function or any function that uses the query function from within db.js
let db = new Database({
  host: "35.221.26.86",
  database: "kiwidb",
  user: "root",
  password: "soen341"
});

// test it out here
// db.login("admin", "admin").catch(err => {
//   console.log(err);
// });
