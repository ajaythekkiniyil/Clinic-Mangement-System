var express = require("express");
var router = express.Router();
var adminCollection = "admin";
var dbo = require("../config/connection");
var adminHelper = require("../helper/adminHelper");
var session = require("express-session");


/* GET admin login page */
router.get("/", function (req, res, next) {
  if (req.session.adminLogedin) {
    res.redirect('admin/adminPanel')
  }
  else if (req.session.loggedErr) {
    let loggedErr = req.session.loggedErr;
    res.render("admin/adminLogin", { loggedErr });
  }
  else {
    res.render('admin/adminLogin')
  }
});

// Admin panel page
router.get("/adminPanel", async (req, res) => {
  // fetch all details of patients and doctor from databse
  let allPatientsDetails = await adminHelper.getAllPatients();
  let allDoctorDetails = await adminHelper.getAllDoctors();

  let patientscount = allPatientsDetails.patientscount;
  let allPatients = allPatientsDetails.allPatients;
  let doctorsCount = allDoctorDetails.count;
  let allDoctors = allDoctorDetails.allDoctors;

  let adminName = req.session.adminName;
  res.render("admin/adminPanel", { adminName, doctorsCount, allDoctors,patientscount, allPatients});

});

// delete doctor
router.get('/delete/:id', (req, res) => {
  adminHelper.deleteDoctor(req.params.id).then(() => {
    res.send(true);
  })
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
    res.render("admin/addDoctorsForm", { alert });
  } else {
    res.render("admin/addDoctorsForm");
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

// edit doctor
router.get('/edit/:id', (req, res) => {

  if (req.session.alert) {
    let alert = req.session.alert;
    var doctorId = req.params.id;
    adminHelper.getOneDoctorDetails(req.params.id).then((doctor) => {
      res.render('admin/editDoctorForm', { doctor, doctorId, alert });
    })
  } else {
    var doctorId = req.params.id;
    adminHelper.getOneDoctorDetails(req.params.id).then((doctor) => {
      res.render('admin/editDoctorForm', { doctor, doctorId });
    })
  }

});

router.post('/edit/:id', (req, res) => {

  adminHelper.checkAdminPassword(req.body.password).then((resp) => {
    if (resp) {
      adminHelper.updateDoctor(req.body, function () {
        if (req.files) {
          let doctorId = req.body.doctorId;
          let image = req.files.image;
          image.mv("public/images/doctors/" + doctorId + ".jpg");
        }
        res.redirect('/admin');
      })
    }
    else {
      req.session.alert = "Enter Correct Password";
      res.redirect("/admin/edit/" + req.body.doctorId);
    }
  })
})

// patients add
router.get('/addpatientsForm', (req, res) => {
  if (req.session.alert) {
    let alert = req.session.alert;
    res.render("admin/addPatientsForm", { alert });
  } else {
    res.render("admin/addPatientsForm");
  }
})

router.post('/addpatients', (req, res) => {
  adminHelper.checkAdminPassword(req.body.password).then((resp) => {
    if (resp) {
      adminHelper.addPatientData(req.body).then((patientId) => {

        let image = req.files.image;
        image.mv("public/images/patients/" + patientId + ".jpg");
        res.redirect('/admin');
      })
    }
    else {
      req.session.alert = "Enter Correct Password";
      res.redirect("/admin/addpatientsForm");
    }
  })
})




module.exports = router;
