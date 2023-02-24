const mongoose = require('mongoose')
const Schema = mongoose.Schema

//создаем модель базы данных по постам
const postSchema = new Schema(
{
    //идентификатор пользователя и его логин, который создал пост
    user: 
    {
        type: Schema.Types.Object,
        required: true
    },
    //текст поста
    text: 
    {
        type: String,
        required: true
    },
    //время создания поста
    createdAt: 
    {
        type: Date,
        default: Date.now
    }
})

//фиксируем модель базы данных по постам в mongodb сервисе
module.exports = mongoose.model('Post', postSchema);