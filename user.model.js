const mongoose = require('mongoose')
//mongoose.connect(`mongodb://${process.env.USER}:${process.env.PASS}@${process.env.HOST}:${process.env.PORT}/${process.env.DBNAME}`)
mongoose.connect(`mongodb://Admin:Welkom01@ds255970.mlab.com:55970/thecircle`);
const Schema = mongoose.Schema

const userSchema = new Schema({
  bsn: String,
  naam: String,
  private: String,
  public: String,
  cert: String
})

module.exports = mongoose.model('User', userSchema)
