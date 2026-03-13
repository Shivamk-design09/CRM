const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    confPassword:String,
    contact:String,
    gender:{
        type:String,
        enum:["male","female"]
    },
})

module.exports = mongoose.model("User",UserSchema)