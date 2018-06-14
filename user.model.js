const mongoose = require('mongoose');
mongoose.connect(`mongodb://${process.env.USER}:${process.env.PASS}@${process.env.HOST}:${process.env.PORT}/${process.env.DBNAME}`);
const Schema = mongoose.Schema;

const userSchema = new Schema({
  bsn: String,
  naam: String,
  private: String,
  public: String,
  cert: String
});

module.exports = mongoose.model('User', userSchema);
