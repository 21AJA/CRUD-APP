const mongoose= require('mongoose');
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    phone:{
        type: String,
        required:true,
    },
    Image:{
        type:String,
        required:false,
    },
});
module.exports=mongoose.model('User',userSchema);