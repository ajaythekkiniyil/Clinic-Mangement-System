var express = require('express');
var router = express.Router();
var userHelper = require('../helper/userHelper');

var passport = require('passport');
const { ReplSet } = require('mongodb');
require('../config/passport-setup')

const client = require('twilio')(process.env.AccountSID, process.env.AuthToken);

/* GET home page. */
router.get('/',async function (req, res, next) {
  let allDoctorDetails = await userHelper.getAllDoctors();
  
  if (req.session.passport) {
    // when user login through gmail a session created and details stored
    let displayName = req.session.passport.user.displayName;
    res.render('user/index', { displayName ,allDoctorDetails})
  }
  res.render('user/index',{allDoctorDetails})
});

// registerForm
router.get('/registerForm', (req, res) => {
  res.render('user/registerForm')
})

router.post('/registerForm', (req, res) => {
  // console.log(req.body);
  if (req.body.codeVerified == 'approved') {
    userHelper.userRegisteration(req.body);
    // user registration success
    res.redirect('/')
  }
  else {
    res.send('Wrong Verification code');
  }

})
// loginForm
router.get('/loginForm', (req, res) => {
  if (req.session.userLoginError) {
    let userLoginError = req.session.userLoginError;
    res.render('user/loginForm', { userLoginError })
    req.session.userLoginError = "";
  }
  else if (req.session.passport) {
    res.redirect('/userPage');
  }
  else
    res.render('user/loginForm')


})

// registeration and mobile number verification
router.post('/send-code', (req, res) => {
  // console.log(req.body.mobile);
  client
    .verify
    .services(process.env.ServiceID)
    .verifications
    .create({
      to: req.body.mobile,
      channel: 'sms'
    })
    .then((data) => {
      console.log(data);
      console.log('verification code send');
    })
})
// registeration and mobile number verification

router.post('/verify-otp', (req, res) => {
  // console.log('call');
  // console.log(req.body.mobile);
  // console.log(req.body.code);
  client
    .verify
    .services(process.env.ServiceID)
    .verificationChecks
    .create({
      to: req.body.mobile,
      code: req.body.code,
    })
    .then((resp) => {
      console.log('verification success');
      console.log(resp);
      res.json(resp);
    })
})
// verifyLoginCredentials  and creating a session for user 
router.post('/verifyLoginCredentials', (req, res) => {

  // if user login credentials is correct setting a session passport and inside user inside display name
  // this displayName check in landing page and show displayName 
  userHelper.verifyLoginCredentials(req.body, function (resp) {
    if (resp) {
      let user = {
        user: {
          displayName: resp.name,
        }
      }
      req.session.passport = user;

      res.redirect('/userPage');
    }
    else {
      req.session.userLoginError = 'incorrect username or password';
      res.redirect('/loginForm')
    }
  })
})

// user login success render this page
router.get('/userPage', async (req, res) => {
  // if there is no user login redirect to home page
  if (!req.session.passport) {
    res.redirect('/')
  }
  let displayName = req.session.passport.user.displayName;
  // fetch all doctors details from database and send to user page
  // fetch all appointments  from database and send to user page
  // fetch all deleted appointments  from database and send to user page
  let allDoctorDetails = await userHelper.getAllDoctors();
  let allAppointments = await userHelper.getAllAppointments(displayName);
  let allDeletedAppointments=await userHelper.getAllDeteltedAppointments(displayName);
  
  res.render('user/userPage', { displayName, allDoctorDetails, allAppointments,allDeletedAppointments });
})

// login with google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/failed' }), async(req, res) => {
  // console.log(req.user.displayName);
  // user registration success
  res.redirect('/userPage');
})

// logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
})

// directBookAppointment
router.get('/directBookAppointment/:id',(req,res)=>{
  userHelper.getOneDoctor(req.params.id).then(doctor => {
    res.render('user/bookAppointment', {  doctor });
  })
})

// bookAppointment
router.get('/bookAppointment/:id', async (req, res) => {
  // fetch doctor from database match with id
  userHelper.getOneDoctor(req.params.id).then(doctor => {

    let displayName = req.session.passport.user.displayName;
    res.render('user/bookAppointment', { displayName, doctor });
  })

})

// appointment booking user fill date and time
router.post('/bookDoctor', async (req, res) => {
  if(!req.session.passport){
    res.redirect('/loginForm')
  }
  // Bookin date time doctor name department stored in database
  userHelper.storeBooking(req.body, req.session.passport.user.displayName, (resp) => {
    let appointment = {
      doctorName: resp.doctor,
      department: resp.department,
      date: resp.date,
      time: resp.time,
      bookingfor: resp.bookingFor,
      status:resp.status,
    }
    res.render('user/bookingConfirmed', { appointment })
  });
})

// appointment confirmed page
router.get('/bookingConfirmed', (req, res) => {
  res.render('user/bookingConfirmed');
})

// cancelAppointment
router.get('/cancelAppointment/:id', (req, res) => {
  userHelper.cancelAppointment(req.params.id);
  res.json(true)
})



module.exports = router;
