const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");

const Schema = mongoose.Schema

const mongoDb = "mongodb+srv://m-001-student:m001-mongodb@sandbox.zoqk7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

const User = mongoose.model(
  "User",
  new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true }
  })
);

const app = express()

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

app.set('views',path.join(__dirname,'views'))
app.set("view engine", 'pug')



passport.use(
    new LocalStrategy((user,password,done)=>{
        console.log(user)
       User.findOne({username:user})
       .exec((err,result)=>{
        //console.log(result.password)
           if(err) return done(err)

           console.log(result.password)
           if(result.password!== password){
               return done(null,false,{message : "password not match"})
           }

           if(result.password == password){
            return done(null,user)
           }

       })
    })
)



app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.get('/',(req,res)=>{
    res.render('index')
})

app.get('/sign_up',(req,res)=>{
    res.render('sign_up')
})

app.get('/log_in',(req,res)=>{
    res.render('log_in',{user:req.user})
})

app.post('/log_in',
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/log_in",
  })
)

app.post('/log-out',(req,res)=>{
  res.render('log_in')
})

app.post('/sign_up',(req,res,next)=>{
    if(req.body){

        const user = new User({
            username: req.body.username,
            password: req.body.password
          }).save(err => {
            if (err) { 
              return next(err);
            }
            res.redirect("/");
          });
    }
})

app.listen(3001, (req,res)=>{
    console.log('server is working at :3001 ')
})