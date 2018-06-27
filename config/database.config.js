require('dotenv').config();
let db_name = process.env.DB || 'production';
console.log(process.env.DB_USER);
module.exports = {
    url: 'mongodb+srv://' + process.env.DB_USER + ':' +  process.env.DB_PASSWORD + '@cluster0-dowur.mongodb.net/' + db_name + '?retryWrites=true'
}