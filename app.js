require('dotenv').config();
const express = require("express");
const bodyparser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const passportLocalmongoose =require("passport-local-mongoose");


const app = express();

app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(bodyparser.urlencoded({extended: true}));

app.use(session({
    secret: 'Our Secret',
    resave: false,
    saveUninitialized: true,
  }));
  app.use(passport.initialize());
  app.use(passport.session());




const userschema= new mongoose.Schema({
    email: String,
    password: String
});

userschema.plugin(passportLocalmongoose);

const User = new mongoose.model("User", userschema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



mongoose.connect('mongodb://127.0.0.1:27017/UsersDB')
   .then(function(){
    console.log("Succesfullly conected to mongoose");
    app.post("/register",function(req,res){
           User.register({username: req.body.username}, req.body.password, function(err, user){
            if(err){
                console.log(err);
                res.redirect("/register");
            }
            else{
                passport.authenticate("local")(req,res,function(){
                    res.redirect("/secrets");
                });
            }
           })
         
       });

    app.get("/secrets", function(req,res){
        if(req.isAuthenticated())
        {
            res.render("secrets");
        }
        else{
            res.redirect("/login");
        }
    });

    app.get('/logout', function(req, res, next){
        req.logout(function(err) {
          if (err) {
             console.log("Error while Logging out : ", err);
             }
          else{
            res.redirect('/');
            console.log("Succesully Logged out. ");
          }       
        });
      });

    app.post("/login",function(req,res){
         
        const user = new User({
            username: req.body.username,
            password: req.body.password
        });

        req.login(user,function(err){
            if(err){
                console.log(err);
            }
            else{
                passport.authenticate("local")(req,res,function(){
                    res.redirect("/secrets");
                });

                console.log("Succesfully Logged in");
            }
        });
    });



   })

   .catch(function(err){
       console.error("Error while connecting to mongoose : ",err);
   });




app.get("/",function(req,res){
    res.render("home");
});

app.get("/login",function(req,res){
    res.render("login");
});

app.get("/register",function(req,res){
    res.render("register");
});




app.listen(3000,function(){
    console.log("Start hogya BC");
})