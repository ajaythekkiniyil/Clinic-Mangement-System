var dbo = require("../config/connection");
var bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const collectionName=require('../config/collectionNames');

module.exports = {

    userRegisteration: (userData) => {
        let user = {
            name: userData.name,
            mobile: userData.mobile,
            age: userData.age,
            email: userData.email,
            password: '',
        }
        bcrypt.hash(userData.password, 10, ((err, hash) => {
            user.password = hash;
            dbo.get().collection(collectionName.user).insertOne(user, (err, res) => {
                console.log("user Details stored in data base");
            })
        }))
    },
    verifyLoginCredentials: function (userLoginCredentials, callback) {
        dbo.get().collection(collectionName.user).findOne({ name: userLoginCredentials.name }).then(resp => {
            // console.log(resp);
            if (resp == null) {
                callback(false)
            }
            bcrypt.compare(userLoginCredentials.password, resp.password, (err, match) => {
                if (match) {
                    console.log('Password matched');
                    callback(resp)
                }
                else {
                    console.log('Password not matched');
                    callback(false)
                }
            })

        })
    },
    
    getAllDoctors: async function () {
        let allDoctors = await dbo.get().collection(collectionName.doctors).find().toArray();
        return (allDoctors);

    },
    getOneDoctor: (doctorId) => {
        return new Promise((resolve, reject) => {
            dbo.get().collection(collectionName.doctors).findOne({ _id: ObjectId(doctorId) }).then(resp => {
                resolve(resp);
            })
        })
    },
    getAllAppointments: async function (displayName) {
        let allAppointments = await dbo.get().collection(collectionName.appointments).find({$and:[{ bookingFor: displayName },{status:{$ne:'consulted'}}]}).toArray();
        return (allAppointments);

    },

    getAllConsultedAppointment: async function (displayName) {
        let allConsultedAppointments = await dbo.get().collection(collectionName.appointments).find({$and:[{ bookingFor: displayName },{status:'consulted'}]}).toArray();
        return (allConsultedAppointments);

    },
    storeBooking: (bookingDetails, displayName, callback) => {
        let appointment = {
            doctor: bookingDetails.doctorName,
            department: bookingDetails.department,
            date: bookingDetails.date,
            time: bookingDetails.time,
            bookingFor: displayName,
            status: 'Pending...',
        }

        dbo.get().collection(collectionName.appointments).insertOne(appointment, (err, resp) => {
            if (err) throw err;
            callback(resp.ops[0]);
        })
    },
    cancelAppointment: async function (id) {
        // deleting from appointment collection and inserted to deleted appointment collection
        await dbo.get().collection(collectionName.appointments).findOne({ _id: ObjectId(id) }).then(resp => {
            console.log(resp);
            resp.status='cancelled by user';
             dbo.get().collection(collectionName.deletedAppointment).insertOne(resp, (err, resp) => console.log('inserted'))
        })
        dbo.get().collection(collectionName.appointments).deleteOne({ _id: ObjectId(id) }, (err, resp) => {

        })
    },
    getAllDeteltedAppointments: async function (displayName) {
        let getAllDeteltedAppointments = await dbo.get().collection(collectionName.deletedAppointment).find({ bookingFor: displayName }).toArray();
        return (getAllDeteltedAppointments);
    },

}