var express = require('express');
var router = express.Router();
var doctorHelper = require('../helper/doctorHelper');
const { doctors } = require('../config/collectionNames');



// doctor page
router.get('/', async (req, res) => {
  if (!req.session.doctor) {
    res.redirect('/')
  }
  //get all appointments of particular doctor
  // get today appointments
  let doctorName = req.session.doctor.doctorName;
  let todayAppointments = await doctorHelper.getTodayAppointments(doctorName);
  let upcomingAppointments = await doctorHelper.getUpcomingAppointments(doctorName);
  let expiredAppointments = await doctorHelper.getExpiredAppointments(doctorName);
  let allCancelledAppointments = await doctorHelper.getCancelledAppointments(doctorName);

  let allConsultedAppointments = await doctorHelper.getAllConsultedAppointments(doctorName);

  let allPatients = await doctorHelper.getAllPatients(doctorName);
  doctorHelper.getOneDoctor(doctorName).then((doctordetails) => {

    //  all appointments where status is pending
    doctorHelper.getAllAppointments(doctorName, (allAppointments => {
      res.render('doctor/doctorPage', { allAppointments, doctordetails, todayAppointments, upcomingAppointments, allConsultedAppointments, expiredAppointments, allPatients, allCancelledAppointments })
    }))

  })

})

// doctorLogin
router.get('/doctorLogin', (req, res) => {

  if (req.session.doctorLoginError) {
    let doctorLoginError = req.session.doctorLoginError;
    res.render('doctor/doctorLoginForm', { doctorLoginError })
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
  doctorHelper.verifyDoctorLoginCredentials(req.body).then(resp => {

    if (resp === false) {
      req.session.doctorLoginError = 'incorrect username or password';
      res.redirect('/doctor/doctorLogin');
    }
    else {
      let doctor = {
        doctorName: resp.username,
        id: resp._id,
      }
      req.session.doctor = doctor;
      res.redirect('/doctor')
    }
  })
})

// doctor accepting request
router.get('/accepted/:id', (req, res) => {
  doctorHelper.doctorAccepted(req.params.id).then(() => {
    res.redirect('/doctor')
  })
})

// doctor rejected request 
router.get('/rejected/:id', (req, res) => {
  doctorHelper.doctorRejected(req.params.id).then(() => {
    res.redirect('/doctor')
  })
})
// doctor consulted
router.get('/consult', (req, res) => {
  let patientName = (req.query.name);
  let appointmentId = req.query.id;
  res.render('doctor/consultingPage', { patientName, appointmentId })
})
router.get('/consulted/:id', async (req, res) => {
  console.log(req.params.id);
  console.log(req.query);
  await doctorHelper.consultingAppointment(req.params.id, req.query.perscription)
  res.redirect('/doctor')
})
router.get('/doctorProfile/:id', async (req, res) => {
  await doctorHelper.getDoctorProfile(req.params.id).then(doctor => {
    res.render('doctor/doctorProfile', { doctor })
  })
})
router.get('/editDoctor/:id', async (req, res) => {
  await doctorHelper.getDoctorProfile(req.params.id).then(doctor => {
    res.render('doctor/editDoctor', { doctor })
  })
})
router.post('/editDoctor/:id', async (req, res) => {
  console.log(req.body);
  console.log(req.files);

  req.session.doctor.doctorName = req.body.name;
  console.log(req.session);
  if (req.files) {
    let image = req.files.image;
    await image.mv("public/images/doctors/" + req.body.id + ".jpg");
  }
  await doctorHelper.updateDoctor(req.body, req.session.doctor.id);
  res.redirect('/doctor')
})

// block user
router.get('/block', async (req, res) => {
  console.log(req.query);
  await doctorHelper.blockUser(req.query.user, req.query.doctor);
  res.redirect('/doctor');
})
//unblock user
router.get('/unblock', async (req, res) => {
  console.log(req.query);
  await doctorHelper.unblockUser(req.query.user, req.query.doctor);
  res.redirect('/doctor');
})

router.get('/excel/:id', async(req, res) => {
  let data = await doctorHelper.excel(req.params.id);
  const excel = require("exceljs");

  let workbook = new excel.Workbook();
  let worksheet = workbook.addWorksheet("Tutorials");

  worksheet.columns = [
    { header: 'Doctor Name', key: 'doctorname', width: 20 },
    { header: 'Patients Name', key: 'patientname', width: 20 },
    { header: 'date', key: 'date', width: 10 },
    { header: 'time', key: 'time', width: 10 },
    { header: 'perscription', key: 'perscription', width: 30 },
  ];

  worksheet.addRow({ doctorname: data[0].doctor,patientname:data[0].bookingFor, date: data[0].date, time: data[0].time, perscription: data[0].perscription });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=" + "Data.xlsx"
  );

  return workbook.xlsx.write(res).then(function () {
    res.status(200).end();
  });
})


module.exports = router;