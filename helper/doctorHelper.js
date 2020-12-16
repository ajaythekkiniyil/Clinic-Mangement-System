var dbo = require("../config/connection");
var bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const collectionName = require('../config/collectionNames');

module.exports = {
    verifyDoctorLoginCredentials: function (doctorLoginCredentials) {
        return new Promise((resolve, reject) => {
            // bcrypt.hash(doctorLoginCredentials.password,10,(err,hash)=>{
            //     dbo.get().collection(collectionName.doctorCredentials).insertOne({username:doctorLoginCredentials.name,password:hash}).then((resp)=>console.log(resp))
            // })
            dbo.get().collection(collectionName.doctorCredentials).findOne({ username: doctorLoginCredentials.name }).then(resp => {
                if (resp == null) {
                    resolve(false)
                }
                bcrypt.compare(doctorLoginCredentials.password, resp.password, (err, match) => {
                    if (match) {
                        console.log('Password matched');
                        resolve(resp)
                    }
                    else {
                        console.log('Password not matched');
                        resolve(false)
                    }
                })

            })
        })
    },

    getOneDoctor: (doctorName) => {
        return new Promise((resolve, reject) => {
            dbo.get().collection(collectionName.doctors).findOne({ name: doctorName }).then(resp => {
                resolve(resp);
            })
        })
    },

    // get all appointments where doctorname match and status is pending
    getAllAppointments: async (doctorName, callback) => {
        let allAppointments = await dbo.get().collection(collectionName.appointments).find({ $and: [{ doctor: doctorName }, { status: 'Pending...' }] }).toArray();
        callback(allAppointments)
    },
    // when doctor accept the request update appointment status to confirmed
    doctorAccepted: (appointmentId) => {
        return new Promise((resolve, reject) => {
            dbo.get().collection(collectionName.appointments)
                .updateOne({ _id: ObjectId(appointmentId) }, { $set: { status: 'confirmed' } });
            resolve()
        })
    },
    doctorRejected: (appointmentId) => {
        return new Promise((resolve, reject) => {

            // deleting from appointment collection and inserted to deleted appointment collection
            dbo.get().collection(collectionName.appointments).findOne({ _id: ObjectId(appointmentId) }).then(resp => {
                resp.status = 'cancelled by doctor';
                dbo.get().collection(collectionName.deletedAppointment).insertOne(resp, (err, resp) => console.log('inserted'))
            })
            dbo.get().collection(collectionName.appointments).deleteOne({ _id: ObjectId(appointmentId) }, (err, resp) => {
            })

            resolve()
        })
    },
    getTodayAppointments: async (doctorName) => {
        var dateObj = new Date();
        var month = dateObj.getUTCMonth() + 1; //months from 1-12
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();
        newdate = year + "-" + month + "-" + day;
        let todayAppointments = await dbo.get().collection(collectionName.appointments).find({ $and: [{ date: newdate }, { status: 'confirmed' }, { doctor: doctorName }] }).toArray();
        return (todayAppointments);
    },
    consultingAppointment: (id, perscription) => {
        dbo.get().collection(collectionName.appointments)
            .updateOne({ _id: ObjectId(id) }, { $set: { status: 'consulted', perscription: perscription } });
    },
    getAllConsultedAppointments:  (doctorName) => {
        return new Promise(async(reslove, reject) => {
            let allConsultedAppointments = await dbo.get().collection(collectionName.appointments)
                .aggregate([
                    {
                        $match: {
                            $and: [{ doctor: doctorName }, { status: 'consulted' }]
                        }
                    },
                    {
                        $lookup: {
                            from: 'user',
                            localField: 'bookingFor',
                            foreignField: 'name',
                            as: 'result'
                        }
                    }
                ]).toArray()
            let patientMobile = allConsultedAppointments[0].result[0].mobile;
            reslove({ allConsultedAppointments, patientMobile });
        })

    },
    getUpcomingAppointments:async(doctorName)=>{
        var dateObj = new Date();
        var month = dateObj.getUTCMonth() + 1; //months from 1-12
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();
        newdate = year + "-" + month + "-" + day;
        let upcomingAppointments = await dbo.get().collection(collectionName.appointments).find({ $and: [{ date: {$ne:newdate} }, { doctor: doctorName },{status:'confirmed'}] }).toArray();
        return(upcomingAppointments);
    },
    getAllPatients:async(doctorName)=>{
        let allPatients = await dbo.get().collection(collectionName.appointments).find({}).toArray();
        return(allPatients);
    }
}
