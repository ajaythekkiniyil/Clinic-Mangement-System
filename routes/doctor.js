var express = require('express');
var router = express.Router();
var doctorHelper = require('../helper/doctorHelper');
const { doctors } = require('../config/collectionNames');



// doctor page
router.get('/', async(req, res) => {
  //get all appointments of particular doctor
  let doctorName=req.session.doctor.doctorName;
  // get today appointments
  let todayAppointments=await doctorHelper.getTodayAppointments();
   doctorHelper.getOneDoctor(doctorName).then((doctordetails)=>{
    //  all appointments where status is pending
    doctorHelper.getAllAppointments(doctorName,(allAppointments=>{
      res.render('doctor/doctorPage',{allAppointments,doctordetails,todayAppointments})
    }))


  })
  
})

// doctorLogin
router.get('/doctorLogin',(req,res)=>{
 
    if (req.session.doctorLoginError) {
      let doctorLoginError = req.session.doctorLoginError;
      res.render('doctor/doctorLoginForm',{doctorLoginError})
      req.session.doctorLoginError = "";
    }
    else if (req.session.doctor) {
      res.redirect('/doctor')
    }
    else
     res.render('doctor/doctorLoginForm');
   
  
  })
  // verifyDoctorLoginCredentials
  router.post('/verifyDoctorLoginCredentials', (req, res) => {
    // if login success a session is created 
    doctorHelper.verifyDoctorLoginCredentials(req.body).then(resp=>{
        
      if(resp===false){
          req.session.doctorLoginError = 'incorrect username or password';
          res.redirect('/doctor/doctorLogin');
      }
      else{
        let doctor={
          doctorName:resp.username,
          id:resp._id,
        }
        req.session.doctor=doctor;
        res.redirect('/doctor')
      }
    })
  })

// doctor accepting request
  router.get('/accepted/:id',(req,res)=>{
    doctorHelper.doctorAccepted(req.params.id).then(()=>{
      res.redirect('/doctor')
    })
  })

 // doctor rejected request 
 router.get('/rejected/:id',(req,res)=>{
    doctorHelper.doctorRejected(req.params.id).then(()=>{
      res.redirect('/doctor')
    })
 }) 


module.exports = router;