const bcrypt = require('bcrypt')
const User = require('../models/User')
// const bodyParser = require("body-parser");
// app.use(bodyParser.urlencoded({extended: true}));

module.exports = (req, res) =>{
    const { username, password } = req.body;

    User.findOne({username:username}, (error,user) => {      
      if (user){ 
          //note: use bcrypt.compare func. (not === for security)          
        bcrypt.compare(password, user.password, (error, same) =>{
          if(same){ 
            req.session.userId=user._id
            res.redirect('/calandar')
          }
          else{
            res.redirect('/auth/login')  
          }
        })
      }
      else{
        res.redirect('/auth/login')
        
      }
    })
}
