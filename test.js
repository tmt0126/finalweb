const mongoose = require('mongoose')

const User = require('./models/User')

mongoose.connect('mongodb://localhost/user_database',{useNewUrlParser: true})

User.create({
    username : '11',
    password:'dat11a'
}, (error, user) => {
    console.log(error,user)
})