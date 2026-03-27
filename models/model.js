const mongoose = require('mongoose')
const plm = require('passport-local-mongoose')

mongoose.connect("mongodb://0.0.0.0/Note_App").then(()=>{
    console.log("Db Connected ✅😍");
})

const appschema = new mongoose.Schema({
    username:String,
    email:String,
    DOB:Date,
    gender:String,
    profileImage:{
        type:String,
        default:"default.png"
    }
})
appschema.plugin(plm)
module.exports=mongoose.model('appschema',appschema);