var express = require('express');
var router = express.Router();
var doctorHelper = require('../helper/doctorHelper');
const { doctors } = require('../config/collectionNames');



// doctor page
router.get('/', async(req, res) => {
  if (!req.session.doctor) {
    res.redirect('/')
  }
  //get all appointments of particular doctor
  // get today appointments
  let doctorName=req.session.doctor.doctorName;
  let todayAppointments=await doctorHelper.getTodayAppointments(doctorName);
  let upcomingAppointments=await doctorHelper.getUpcomingAppointments(doctorName);

  let allConsultedAppointments=await doctorHelper.getAllConsultedAppointments(doctorName);
  
  let allPatients=await doctorHelper.getAllPatients(doctorName);
  doctorHelper.getOneDoctor(doctorName).then((doctordetails)=>{
    
    //  all appointments where status is pending
    doctorHelper.getAllAppointments(doctorName,(allAppointments=>{
      res.render('doctor/doctorPage',{allAppointments,doctordetails,todayAppointments,upcomingAppointments,allConsultedAppointments,allPatients})
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
// doctor consulted
 router.get('/consult',(req,res)=>{
    let patientName=(req.query.name);
    let appointmentId=req.query.id;
    res.render('doctor/consultingPage',{patientName,appointmentId})
 })
router.get('/consulted/:id',async(req,res)=>{
  console.log(req.params.id);
  console.log(req.query);
  await doctorHelper.consultingAppointment(req.params.id,req.query.perscription)
  res.redirect('/doctor')
})




// router.get('/updateDoctorProfie/:id',function(req,res){
//   let id=req.params.id;
//   res.render('doctor/updateDoctorProfie',{id})
// })

// router.post('/updateDoctorProfie/:id',async function(req,res){
//   if(req.files.image){
//     let image=req.files.image;
//     image.mv("public/images/doctors/" + req.params.id + ".jpg");
//   }
//   await doctorHelper.updateProfile(req.body,req.params.id);
//   res.redirect('/doctor');

// })
module.exports = router;