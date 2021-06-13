const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const TableSetSchema = new Schema({
    title : String,
    body : String
});

const TableSet = mongoose.model('TableSet',TableSetSchema);

module.exports = TableSet