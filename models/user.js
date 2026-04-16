const mongoose = require('mongoose')
const plm = require('passport-local-mongoose')

mongoose.connect("mongodb://0.0.0.0/Note_App").then(()=>{
    console.log("Db Connected ✅😍");
})

const userSchema = new mongoose.Schema({
    username:String,
    email:String,
    DOB:Date,
    gender:String,
    Notes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Note"
        }
    ],
    profileImage:{
        type:String,
        default:"default.png"
    },
token:{
    type:Number,
    default:-1
},
tokenExpiry:Date  // Isse Hum Otp Ka Exppiry check karenge
})
userSchema.plugin(plm, {usernameField: 'email'})
module.exports= mongoose.model('user',userSchema);