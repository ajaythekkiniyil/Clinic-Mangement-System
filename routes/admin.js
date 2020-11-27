var express = require("express");
var router = express.Router();
var adminCollection = "admin";
var dbo = require("../config/connection");
var adminHelper = require("../helper/adminHelper");
var session = require("express-session");

/* GET admin login page */
router.get("/", function (req, res, next) {
  if (req.session.adminLogedin) {
    res.redirect("admin/adminPanel");
  }
  if (req.session.loggedErr) {
    let loggedErr = req.session.loggedErr;
    res.render("admin/adminLogin", { loggedErr });
  } else {
    res.render("admin/adminLogin");
  }
});

// Admin panel page
router.get("/adminPanel", (req, res) => {
  if (req.session.adminLogedin) {
    let adminName = req.session.adminName;
    res.render("admin/adminPanel", { adminName });
  } else {
    res.redirect("/admin");
  }
});
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/admin");
});

//admin credentials verification
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

router.get("/dashboard", (req, res) => {
  let adminName = req.session.adminName;
  res.render("admin/adminPanel",{ adminName });
});
router.get("/doctors", (req, res) => {
  let adminName = req.session.adminName;
  res.render("admin/adminDoctors",{ adminName });
});
router.get("/appointments", (req, res) => {
  let adminName = req.session.adminName;
  res.render("admin/adminAppointment",{ adminName });
});
router.get("/patients", (req, res) => {
  let adminName = req.session.adminName;
  res.render("admin/adminPatients",{ adminName });
});


//GET add doctors
router.get('/adddoctors',(req,res)=>{
  let adminName = req.session.adminName;
  res.render("admin/addDoctors",{ adminName });
})


//adding doctors details to database
router.post('/addDoctorData',(req,res)=>{
  adminHelper.addDoctorData(req.body)
  res.send('doctors added')
})


module.exports = router;
