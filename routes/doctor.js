var express = require('express');
var router = express.Router();
var doctorHelper = require('../helper/doctorHelper');

// doctor page
router.get('/', (req, res) => {
    res.send('Doctor page')
    console.log(req.session);
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
    doctorHelper.verifyDoctorLoginCredentials(req.body).then(resp=>{
        console.log(resp);
      if(resp===false){
          req.session.doctorLoginError = 'incorrect username or password';
          res.redirect('/doctor/doctorLogin');
      }
      else{
        req.session.doctor=resp;
        res.redirect('/doctor')
      }
    })
  })
  

module.exports = router;