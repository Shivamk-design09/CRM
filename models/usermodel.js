const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    confPassword: String,
    contact: String,
    gender: {
        type: String,
        enum: ["male", "female"]
    }, address: String,
    alternateEmail: String,
    company: String,
    service: {
        type: [String],
        enum: []
    },company: String,
    webDevlopment: String,
    query: String,
    subject: String,
    tasktype: {
        type: String,
        enum: [""]
    },priority: {
        type: String,
        enum: []
    },
    description: String,
})

module.exports = mongoose.model("User", UserSchema)