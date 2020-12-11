var express = require('express');
var router = express.Router();
var userHelper=require('../helper/userHelper');

//Twilio  
const AccountSID= "ACc11fa22fbc75351deb03d32f26951fc2"
const AuthToken="05535af1ba673b35a41c21df0f314516"
const ServiceID="VAe74d7700afcfcea14842e98dd49a05d8"

var passport=require('passport')
require('../config/passport-setup')

const client=require('twilio')(AccountSID,AuthToken);

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.session);
  if(req.session.passport){
    // when user login through gmail a session created and details stored
    let displayName=req.session.passport.user.displayName;
    res.render('user/index',{displayName})
  }
  res.render('user/index')
});

// registerForm
router.get('/registerForm',(req,res)=>{
  res.render('user/registerForm')
})

router.post('/registerForm',(req,res)=>{
  // console.log(req.body);
  if(req.body.codeVerified=='approved'){
    userHelper.userRegisteration(req.body);
    // user registration success
    res.redirect('/')
  }
  else{
    res.send('Wrong Verification code'); 
  }
  
})
// loginForm
router.get('/loginForm',(req,res)=>{
  if(req.session.userLoginError){
    let userLoginError=req.session.userLoginError;
    res.render('user/loginForm',{userLoginError})
    req.session.userLoginError="";
  }
  else
    res.render('user/loginForm')


})

// registeration and mobile number verification
router.post('/send-code',(req,res)=>{
  // console.log(req.body.mobile);
  client
    .verify
    .services(ServiceID)
    .verifications
    .create({
        to:req.body.mobile,
        channel:'sms'
    })
    .then((data)=>{
        // console.log(data);
        console.log('verification code send');
    })
})
// registeration and mobile number verification

router.post('/verify-otp',(req,res)=>{
  // console.log('call');
  // console.log(req.body.mobile);
  // console.log(req.body.code);
  client
  .verify
  .services(ServiceID)
  .verificationChecks
  .create({
    to:req.body.mobile,
    code:req.body.code,
  })
  .then((resp)=>{
    console.log('verification success');
    console.log(resp);
    res.json(resp);
  })
})
// verifyLoginCredentials  and creating a session for user 
router.post('/verifyLoginCredentials',(req,res)=>{

  // if user login credentials is correct setting a session passport and inside user inside display name
  // this displayName check in landing page and show displayName 
  userHelper.verifyLoginCredentials(req.body,function(resp){
    if(resp){
      let user={
        user:{
          displayName:resp.name,
        }
      }
      req.session.passport=user;
      res.redirect('/');
    }
    else{
      req.session.userLoginError='incorrect username or password';
      res.redirect('/loginForm')
    }
  })
})

// login with google
router.get('/google',passport.authenticate('google',{scope:['profile','email']}))

router.get('/google/callback',passport.authenticate('google',{failureRedirect:'/failed'}),(req,res)=>{
  // res.send('google success')
  // console.log(req.user.displayName);
  // user registration success
  res.redirect('/');
})


router.get('/logout',(req,res)=>{
  req.session.destroy();
  res.redirect('/');
})

module.exports = router;
