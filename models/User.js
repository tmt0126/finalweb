/*jslint devel: true */
/* eslint-disable no-console */
/*eslint no-undef: "error"*/
/*eslint-env node*/

const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const UserSchema = new mongoose.Schema({  
    username: { // pass in config object. and put in validation rules 
      type: String,
      required: true,
      unique: true //아이디가 중복되지 않게 unique
    },
    password: {
      type: String,
      required: true
    }
  });

UserSchema.pre('save', function(next){
    const user = this      
    bcrypt.hash(user.password, 10,  (error, hash) => {       //암호화임 
      user.password = hash 
      next() 
    }); 
});

//export model
const User = mongoose.model('User',UserSchema);

module.exports = User