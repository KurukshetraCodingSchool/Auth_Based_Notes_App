var express = require('express');
const User = require("../models/user");
const Note = require("../models/Notes");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const upload = require('../utils/multer');
const sendMail = require("../utils/sendmail")
const bcrypt = require('bcrypt')
var router = express.Router();
// passport.use(new LocalStrategy(User.authenticate()));
passport.use(User.createStrategy());
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
        req.flash('success_msg',"Signup Successfully✅✅")
        res.redirect("/signin");
    } catch (error) {
        console.log(error);
        res.send(error);
    }
});
router.get('/signin', async function(req, res, next) {
  res.render('signin');
});
// router.post(
//     "/signin",
//     passport.authenticate("local", {
//   successRedirect: "/profile",
//   failureRedirect: "/signin",
//   successFlash: "Signin Successfully ✅"
// }),
//     function (req, res, next) {}
// );
router.post("/signin", (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (!user) {
      req.flash("error_msg", "Invalid Credentials ❌");
      return res.redirect("/signin");
    }

    req.logIn(user, () => {
      req.flash("success_msg", "Signin Successfully ✅");
      return res.redirect("/profile");
    });
  })(req, res, next);
});

router.get('/profile',isLoggedIn, async function(req, res, next) {
  const newuser =await User.findById(req.user._id)
  res.render('profile',{newuser});  
});

router.get('/upload', async function(req, res, next) {
  res.render('upload');
});
router.post('/upload',isLoggedIn,upload.single('profileImage'),async(req,res,next)=>{
await User.findByIdAndUpdate(req.user._id,{
    profileImage:req.file.filename
})
        req.flash('success_msg',"ImageUploaded✅✅")
res.redirect('/profile');
});

router.get('/sendmail', async function(req, res, next) {
  res.render('sendmail');
});

router.post('/sendmail', async function(req, res, next) {
  const user = await User.findOne({email:req.body.email});
  sendMail(user.email,user,res,req);
req.flash('success_msg',"OtpSent✅✅")
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
req.flash('success_msg',"PasswordChanged✅✅")
res.redirect('/signin')
});
router.get('/reset', async function(req, res, next) {
  res.render('resetpassword');
});

router.post('/reset', isLoggedIn ,async function(req, res, next) {
   try {
        await req.user.changePassword(
            req.body.oldpassword,
            req.body.newpassword
        );
        await req.user.save();
        req.flash('success_msg',"PasswordChanged✅✅")
        res.redirect("/profile");
    } catch (error) {
        res.send(error);
    }
});
// Logout CODE
router.get("/logout", isLoggedIn, function (req, res, next) {
    req.session.destroy(() => {
        res.redirect("/signin");
    });
});

// Notes Work 
// Notes Ko Frotend Me bhejna or Db Me store Karna
router.get('/dashboard',isLoggedIn, async function(req, res, next) {
  const notes =await Note.find({user:req.user._id});
  const newuser =await User.findById(req.user._id)
  res.render('dashboard',{notes,newuser});
});

//add notes
router.get('/addnote',isLoggedIn, async function(req, res, next) {
  res.render('addnote');
});

router.post('/addnote',isLoggedIn, async function(req, res, next) {
  const {title,content} = req.body;
  await Note.create({
    title,
    content,
    user:req.user._id
  })
  req.flash('success_msg',"NoteAdded✅✅")
  res.redirect('/dashboard')
});
router.get('/delete/:id',isLoggedIn,async (req,res,next)=>{
  await Note.findByIdAndDelete(req.params.id)
  req.flash('success_msg',"NoteDeleted✅")
  res.redirect("/dashboard")
})

router.get('/edit/:id',isLoggedIn,async (req,res,next)=>{
  const note = await Note.findOne({
    _id:req.params.id,
    user:req.user._id
  })
  if(!note) return res.send("Note Not Found❌❌")
  res.render("editnote",{note});
})

router.post('/edit/:id',isLoggedIn,async (req,res,next)=>{
  const {title,content}= req.body;
  await Note.findOneAndUpdate(
    {_id:req.params.id,user:req.user._id},
    {title,content}
);
  req.flash('success_msg',"NoteUpdated✅")
  res.redirect("/dashboard");
})
router.get('/search', isLoggedIn, async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.redirect('/dashboard')
  }
  const notes = await Note.find({
    user: req.user._id,
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { content: { $regex: query, $options: 'i' } }
    ]
  });

  const newuser = await User.findById(req.user._id);
  res.render('dashboard', { notes, newuser }); 
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
