var express = require('express');
var router = express.Router();
var userHelper=require('../helper/userHelper');



const AccountSID= "ACc11fa22fbc75351deb03d32f26951fc2"
const AuthToken="05535af1ba673b35a41c21df0f314516"
const ServiceID="VAe74d7700afcfcea14842e98dd49a05d8"


const client=require('twilio')(AccountSID,AuthToken);



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('user/index')
});

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

router.get('/loginForm',(req,res)=>{
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
        console.log(data);
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
// verifyLoginCredentials  and creating a session for user -- used JSON webtoken
router.post('/verifyLoginCredentials',(req,res)=>{
  console.log(req.body);
})





module.exports = router;
