require('dotenv').config();
const express = require("express");
const bodyparser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const bcrypt = require("bcrypt");

const app = express();

app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(bodyparser.urlencoded({extended: true}));


const userschema= new mongoose.Schema({
    email: String,
    password: String
});

const saltRounds = 10;



/*userschema.plugin(encrypt, { secret: process.env.SECRET , encryptedFields: ["password"] });*/

const User = new mongoose.model("User", userschema);



mongoose.connect('mongodb://127.0.0.1:27017/UsersDB')
   .then(function(){
    console.log("Succesfullly conected to mongoose");
    app.post("/register",function(req,res){

        bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
            
            const newuser = new User({
                email: req.body.username,
                password: hash
            });
            newuser.save()
            .then(function(){
              res.render("secrets.ejs");
            })
            .catch(function(err){
              console.error("Error while saving new user : ", err);
            });

        }); 
         
       });

    app.post("/login",function(req,res){
        const username = req.body.username;
        const password = req.body.password;

        User.findOne({email: username})
          .then(function(founduser){
            if(founduser){
                bcrypt.compare(password, founduser.password, function(err, result) {
                    if(result === true)
                    {
                        res.render("secrets");
                        console.log("Succefull login ");
                    }
                });
              
            }
          })

          .catch(function(err){
            console.error("Error while finding user : ",err);
          });
    })
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