const mongoose = require('mongoose')
const Schema = mongoose.Schema;

//создаем модель базы данных по данным пользователя
const userSchema = new Schema(
{
    //email пользователя
    email: 
    {
        type: String,
        required: true,
        unique: true
    },
    //login пользователя
    login: 
    {
        type: String,
        required: true
    },
    //password пользователя
    password: 
    {
        type: String
    },
    followers: [],
    following: []
})

//фиксируем модель базы данных по данным пользователя в mongodb сервисе
module.exports = mongoose.model('User', userSchema);