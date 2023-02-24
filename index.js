const express = require('express');
const dotenv = require('dotenv');

const bodyParser = require('body-parser');

//вытаскиваем cors аналог proxy
const cors = require('cors');

//вытаскиваем passport - модуль доступа
const passport = require('passport');

//вытаскиваем маршрутизатор по пользователям
const users = require('./routes/users');

//вытаскиваем маршрутизатор по поcтам
const posts = require('./routes/posts');

//среда установки
dotenv.config();

//вытаскиваем  mongoose модуль подключения к базе данных mongodb
const mongoose = require('mongoose');

//подключаем базу данных Mongo DB
mongoose.connect(
    process.env.MONGODB_URL,
    {
        //these are options to ensure that the connection is done properly
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    }
)
.then(() => 
{
     console.log("Successfully connected to MongoDB!")        
})
.catch((error) => 
{
    console.log("Unable to connect to MongoDB!");
    console.error(error);
})  

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

//подключаем cors он позволяет осуществлять доступ из frontend к backend и обратно
app.use(cors())

//passport инициализируем
app.use(passport.initialize())
require('./config/passport')(passport)

//подключаем маршрутизатор по пользователям
app.use('/api/users',users);

//подключаем роутер по постам
app.use('/api/posts',posts);

//запускаем сервер по порту 3001
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));