var dbo = require("../config/connection");
var bcrypt = require("bcrypt");
const { response } = require("express");
var collectionNames = {
  adminDefaultCredentials: "admin",
  doctors: "doctors",
};

module.exports = {
  verifyAdminLogin: function (adminCredentials) {
    return new Promise((resolve, reject) => {
      // fetching admin credentials from database
      dbo
        .get()
        .collection(collectionNames.adminDefaultCredentials)
        .find()
        .toArray()
        .then((credentials) => {
          // console.log(credentials[0].password);
          if (adminCredentials.username === credentials[0].username) {
            console.log("username matched");
            bcrypt.compare(
              adminCredentials.password,
              credentials[0].password,
              (err, match) => {
                if (match) {
                  console.log("Login success");
                  let adminDetails = credentials[0];
                  resolve({ logedin: true, adminDetails });
                } else {
                  console.log("Login failed");
                  resolve({ logedin: false });
                }
              }
            );
          } else {
            console.log("Login failed");
            resolve({ logedin: false });
          }
        });
    });
  },

  addDoctorData: (doctorDetails) => {
    // if admin add details of doctors to database check if it is admin or not
    // by checking his password
    let Details = {
      name: doctorDetails.name,
      specialised: doctorDetails.specialised,
      field: doctorDetails.field,
    };
    var adminPassword = doctorDetails.password;
    return new Promise((resolve, reject) => {
      dbo
        .get()
        .collection(collectionNames.adminDefaultCredentials)
        .find()
        .toArray()
        .then((credentials) => {
          bcrypt.compare(
            adminPassword,
            credentials[0].password,
            (err, match) => {
              if (match) {
                dbo
                  .get()
                  .collection(collectionNames.doctors)
                  .insertOne(Details, (err, resp) => {
                    if (err) throw err;
                    else {
                      console.log("New doctor added to database");
                      let doctorId = resp.ops[0]._id;
                      resolve({ admin: true, doctorId });
                    }
                  });
              } else {
                resolve({ admin: false });
              }
            }
          );
        });
    });
  },
  getAllDoctors: function () {
    return new Promise(async (reslove, reject) => {
      let count = await dbo.get().collection(collectionNames.doctors).find().count();
      let allDoctors = await dbo.get().collection(collectionNames.doctors).find().toArray();
      reslove({count,allDoctors});
    });
  },
};
