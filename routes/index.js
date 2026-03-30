var express = require('express');
const User = require("../models/model");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const upload = require('../utils/multer');
const sendMail = require("../utils/sendmail")
const bcrypt = require('bcrypt')
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
  const newuser =await User.findById(req.user._id)
  res.render('profile',{newuser});  
});
router.get('/dashboard',isLoggedIn, async function(req, res, next) {
  const newuser =await User.findById(req.user._id)
  res.render('dashboard',{newuser});
  console.log(newuser);
});
router.get('/upload', async function(req, res, next) {
  res.render('upload');
});
router.post('/upload',isLoggedIn,upload.single('profileImage'),async(req,res,next)=>{
await User.findByIdAndUpdate(req.user._id,{
    profileImage:req.file.filename
})
res.redirect('/profile');
});

router.get('/sendmail', async function(req, res, next) {
  res.render('sendmail');
});

router.post('/sendmail', async function(req, res, next) {
  const user = await User.findOne({email:req.body.email});
  sendMail(user.email,user,res,req);
  res.redirect('/changepassword');
});

router.get('/changepassword', async function(req, res, next) {
  res.render('changepassword');
});
router.post('/changepassword', async function(req, res, next) {
  const{email,token,newpassword} = req.body;
    const user = await User.findOne({email});
if(!user){
  return res.send("User not found ❌");
}
if(user.tokenExpiry<Date.now()){
return res.send("Otp Expired ❌")
}
if(user.token!=token){
  return res.send("Invalid Otp❌❌❌")
}
user.token=null;
user.tokenExpiry=null;
await user.setPassword(newpassword);
await user.save();
// console.log(user.password);

res.redirect('/signin')
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
