var mongoose = require('mongoose');

const addresSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    street:{
        type:String,
        required : [true , "street is required"],
    } 
    ,
    city:{
        type:String,
        required : [true , "city is required"],
        unique: true
    },
    state : {
        type:String,
        required : [true , "state is required"],

    }    
    ,
    zipCode :{
        type:String,
        required :[true, 'zipcode is required']
    }
    ,
    country: {
        type: String,
        required :[true, 'country is required']
      }
    ,
})

const address = mongoose.model('User',addresSchema)

module.exports = address