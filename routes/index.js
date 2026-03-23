var express = require('express');
const User = require("../models/model");
const passport = require("passport");
const LocalStrategy = require("passport-local");
var router = express.Router();
passport.use(new LocalStrategy(User.authenticate()));
/* GET home page. */
router.get('/', async function(req, res, next) {
  res.render('index');
});
router.get('/register', async function(req, res, next) {
  res.render('register');
});
router.post("/register", async function (req, res, next) {
    try {
      const{username,email,DOB,gender,password} = req.body;
        await User.register(
            { username,email,DOB,gender},
            password
        );
        res.redirect("/signin");
    } catch (error) {
        console.log(error);
        res.send(error);
    }
});
router.get('/signin', async function(req, res, next) {
  res.render('signin');
});
router.post(
    "/signin",
    passport.authenticate("local", {
        successRedirect: "/profile",
        failureRedirect: "/signin",
    }),
    function (req, res, next) {}
);

router.get('/profile',isLoggedIn, async function(req, res, next) {
  const newuser =await User.find()
  res.render('profile',{newuser});
  console.log(newuser);
  
});
router.get('/dashboard',isLoggedIn, async function(req, res, next) {
  const newuser =await User.find()
  res.render('dashboard',{newuser});
  console.log(newuser);
});


// Logout CODE
router.get("/logout", isLoggedIn, function (req, res, next) {
    req.session.destroy(() => {
        res.redirect("/signin");
    });
});
// AUTHENTICATED ROUTE MIDDLEWARE
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/signin");
    }
}
module.exports = router;
