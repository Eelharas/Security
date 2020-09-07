//jshint esversion:6
require('dotenv').config();
//not setting a const here, we only need to require and call config. this has to be right at the top.
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
//created 4 constants and requiring all 4 modules that we installed so that we can run it

const app = express();
//creating new app using express

console.log(process.env.API_KEY);

app.set('view engine', 'ejs');
//setting our view engine to use ejs as our templating engine

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
//using bodyparser to parse our requests and use the public directory to store our static
//files like images and css code.

mongoose.connect("mongodb://localhost:27017/userDB2", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});
//to connect to mongodb server and look for db called userDB2, if it doesn't exits, it'll create it

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});
//to create a schema using the mongoose method this time.


userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"]});
//this is our encrypt package that we must put in before the model User.
//because we want to encrypt our userschema before it passes through the mongoose
//model. then we added ann encryption package to our userSchema, defined the
//secret that want to encrypt, and finally encrypted it.

const User = new mongoose.model("User", userSchema);
//to create a model called User where it's connected to the userSchema



app.get('/', (req, res) => {
  res.render('home');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post("/register", function(req,res){
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });
  //creating a register route. in the callback we create a new user. the info is
  //passed from register.ejs. we create a new user using the user model, which
  //specified the values email and password. to get the data we use req.body.username
  //which comes from he register.ejs when the client fills in their data. same with

newUser.save(function(err){
  if(err){
    console.log(err);
  } else {
    res.render("secrets");
  }
//in the process of saving, if there was an error, it will log the error
//otherwise it'll take you to the secrets page. there is no app.get route to
//the secrets page. it's only accessible through the register page.
});
});

app.post("/login", function(req,res){
  const username = req.body.username;
  const password = req.body.password

  User.findOne({email: username}, function(err, foundUser){
    if(err){
      console.log(err);
    } else {
      if(foundUser) {
        if(foundUser.password === password) {
          res.render("secrets");
        }
      }
    }
  });
  //if there was a found user with that email in the database, then we will
  //check if their password matches. if so, they can log in.
});
//to create a post request to check in our database if we have a user with the
//credentials they input.


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
//set up our app to listen on port 3000.
