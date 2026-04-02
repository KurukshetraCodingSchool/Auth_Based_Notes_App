const mongoose = require('mongoose')

const noteschema = new mongoose.Schema({
    title:String,
    content:String,
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
})
module.exports=mongoose.model('Note',noteschema);