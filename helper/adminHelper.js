var dbo = require("../config/connection");
var bcrypt = require("bcrypt");
const { response } = require("express");
const { ObjectId } = require("mongodb");
var collectionNames = {
  adminDefaultCredentials: "admin",
  doctors: "doctors",
  patients:'patients',
  trashDoctors: 'trash-doctors',
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

  getAllDoctors:async function () {
      let count = await dbo.get().collection(collectionNames.doctors).find().count();
      let allDoctors = await dbo.get().collection(collectionNames.doctors).find().toArray();
      return({ count, allDoctors });
    
  },

  deleteDoctor: (doctorId) => {
    return new Promise(async (resolve, reject) => {
      var trashDoctors = await dbo.get().collection(collectionNames.doctors).find({ _id: ObjectId(doctorId) }).toArray();
      await dbo.get().collection(collectionNames.trashDoctors).insertOne(trashDoctors[0]);
      await dbo.get().collection(collectionNames.doctors).deleteOne({ _id: ObjectId(doctorId) }, (err, obj) => {
        if (err) console.log(err);
        else {
          console.log('deleted');
          resolve()
        }
      });
    })
  },

  getOneDoctorDetails: (doctorId) => {
    return new Promise((resolve, reject) => {
      dbo.get().collection(collectionNames.doctors).findOne({ _id: ObjectId(doctorId) }, (err, match) => {
        resolve(match);
      })
    })
  },

  checkAdminPassword: (password) => {
    var adminPassword = password;
    return new Promise((resolve, reject) => {
      dbo
        .get().collection(collectionNames.adminDefaultCredentials).find().toArray().then((credentials) => {
          bcrypt.compare(adminPassword, credentials[0].password, (err, match) => {
            if (match) {
              console.log("password match");
              resolve(true)
            }
            else
              console.log('not match');
            resolve(false)
          })
        })
    })
  },

  updateDoctor: (doctorDetails, callback) => {

    dbo.get().collection(collectionNames.doctors).updateOne({ _id: ObjectId(doctorDetails.doctorId) }, {
      $set: {
        name: doctorDetails.name,
        specialised: doctorDetails.specialised,
        field: doctorDetails.field,
      }
    }, (err, resp) => {
      console.log('updated');
    }

    )
    callback()
  },

  getAllPatients:async()=>{
      let patientscount = await dbo.get().collection(collectionNames.patients).find().count();
      let allPatients = await dbo.get().collection(collectionNames.patients).find().toArray();
      return({ patientscount, allPatients });
    
  },

  addPatientData: (patientDetails) => {
    let Details = {
      name: patientDetails.name,
      age: patientDetails.age,
      mobile: patientDetails.mobile,
    };
    return new Promise((resolve,reject)=>{
      dbo
      .get()
      .collection(collectionNames.patients)
      .insertOne(Details, (err, resp) => {
        if (err) throw err;
        else {
          console.log("New patient added to database");
          let patientId = resp.ops[0]._id;
          resolve( patientId );
        }
      });
    })
    

  },


};
