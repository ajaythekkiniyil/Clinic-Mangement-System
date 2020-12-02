var express = require("express");
var router = express.Router();
var adminCollection = "admin";
var dbo = require("../config/connection");
var adminHelper = require("../helper/adminHelper");
var session = require("express-session");


/* GET admin login page */
router.get("/", function (req, res, next) {
  if(req.session.adminLogedin){
    res.redirect('admin/adminPanel')
  }
  else if(req.session.loggedErr){
    let loggedErr = req.session.loggedErr;
    res.render("admin/adminLogin", { loggedErr });
  }
  else{
    res.render('admin/adminLogin')
  }
});

// Admin panel page
router.get("/adminPanel", (req, res) => {
  adminHelper.getAllDoctors().then((resp)=>{
    let doctorsCount=resp.count;
    let allDoctors=resp.allDoctors;
    let adminName = req.session.adminName;
    res.render("admin/adminPanel", { adminName ,doctorsCount,allDoctors});
  })

});

// delete doctor
router.get('/delete/:id',(req,res)=>{
  adminHelper.deleteDoctor(req.params.id).then(()=>{
    res.send(true);
  })
});

// edit doctor
router.get('/edit/:id',(req,res)=>{
  res.render('admin/editDoctor')
  // adminHelper.editDoctor(req.params.id)
});

// admin logout
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/admin");
});

//admin login- credentials verification
router.post("/verify", (req, res) => {
  adminHelper.verifyAdminLogin(req.body).then((resp) => {
    if (resp.logedin == true) {
      req.session.adminLogedin = true;
      req.session.adminName = resp.adminDetails.username;
      res.redirect("/admin/adminPanel");
    } else {
      req.session.loggedErr = "Invalid username or password";
      res.redirect("/admin");
    }
  });
});



//GET add doctors
router.get("/adddoctors", (req, res) => {
  if (req.session.alert) {
    let alert = req.session.alert;
    res.render("admin/addDoctors", { alert });
  } else {
    res.render("admin/addDoctors");
  }
});

//adding doctors details to database
router.post("/addDoctorData", (req, res) => {
  adminHelper.addDoctorData(req.body).then((resp) => {
    if (resp.admin === false) {
      req.session.alert = "Enter Correct Password";
      res.redirect("/admin/adddoctors");
    } else {
      let doctorId = resp.doctorId;
      let image = req.files.image;
      image.mv("public/images/doctors/" + doctorId + ".jpg");
      res.redirect("/admin");
    }
  });
});

module.exports = router;
