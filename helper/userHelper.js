var dbo = require("../config/connection");
var bcrypt = require("bcrypt");
var collectionName = {
    user: 'user',
    doctors:'doctors'
}

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
    verifyLoginCredentials:function(userLoginCredentials,callback){
        dbo.get().collection(collectionName.user).findOne({name:userLoginCredentials.name}).then(resp=>{
            // console.log(resp);
            if(resp==null){
                callback(false)
            }
            bcrypt.compare(userLoginCredentials.password,resp.password,(err,match)=>{
                if(match){
                    console.log('Password matched');
                    callback(resp)
                }
                else{
                    console.log('Password not matched');
                    callback(false)
                }
            })
            
        })        
    },
    getAllDoctors:async function () {
        let allDoctors = await dbo.get().collection(collectionName.doctors).find().toArray();
        return(allDoctors);
      
    },
}