var MongoClient=require('mongodb').MongoClient;
var url='mongodb://localhost:27017';
// data base name 
var dbName='clinic_management_system';
// admin collection name
var admin='admin';
// admin credentials
var adminCredentials={
    username:'admin',
    password:'admin',
}
const bcrypt=require('bcrypt');

var state={
    dbo:null
}
module.exports.connect=()=>{
    MongoClient.connect(url,{ useUnifiedTopology: true },(err,db)=>{
        if(err)throw err;
        state.dbo=db.db(dbName);
        console.log('connected to database');
        // bcrypt.hash(adminCredentials.password,10,((err,hash)=>{
        //     // store username and hashed password in data base 
        //     adminCredentials.password=hash;
        //     state.dbo.collection(admin).insertOne(adminCredentials,(err,res)=>{
        //         console.log("Admin Credentials stored in data base");
        //     })
        // }))
        
    })
}
module.exports.get=function(){
    return state.dbo;
}