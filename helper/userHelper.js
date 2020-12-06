var dbo = require("../config/connection");
var bcrypt = require("bcrypt");
var collectionName = {
    user: 'user',
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

    }
}