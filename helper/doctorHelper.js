var dbo = require("../config/connection");
var bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
var collectionName = {
    user: 'user',
    doctors: 'doctors',
    appointments: 'appointments',
    doctorCredentials: 'doctorCredentials',
}
module.exports={
    verifyDoctorLoginCredentials: function (doctorLoginCredentials) {
        return new Promise( (resolve, reject) => {
            // bcrypt.hash(doctorLoginCredentials.password,10,(err,hash)=>{
            //     dbo.get().collection(collectionName.doctorCredentials).insertOne({username:doctorLoginCredentials.name,password:hash}).then((resp)=>console.log(resp))
            // })
            dbo.get().collection(collectionName.doctorCredentials).findOne({ username: doctorLoginCredentials.name }).then(resp =>{
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
}
