var dbo=require('../config/connection');
var bcrypt=require('bcrypt');
module.exports = {
    verifyAdminLogin: function (adminCredentials) {

      return new Promise((resolve,reject)=>{
          // fetching admin credentials from database
      dbo.get().collection('admin').find().toArray().then((credentials) => {
        // console.log(credentials[0].password);
        if(adminCredentials.username===credentials[0].username){
          console.log('username matched');
           bcrypt.compare(adminCredentials.password,credentials[0].password,(err,match)=>{
             if(match){
               console.log('Login success');
               let adminDetails=credentials[0];
               resolve({logedin:true,adminDetails});
             }
             else{
               console.log('Login failed');
               resolve({logedin:false});
             }
           })
        }
        else{
          console.log('Login failed');
          resolve({logedin:false});
        }

      });
      })

      
    }

};
