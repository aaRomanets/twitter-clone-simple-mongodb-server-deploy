const router = require('express').Router()

//вытаскиваем модель базы данных пользователя User
const User = require('../models/User') 

const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const passport = require("passport")

//вытаскиваем функцию проверки данных по регистрации пользователя
const validateRegisterInput = require("../validation/register")

//вытаскиваем функцию проверки данных по авторизации пользователя
const validateLoginInput = require("../validation/login")

//маршрутизатор регистрации пользователя
router.route('/register').post((req,res) => 
{
    //проверяем данные по регистрации пользователя
    const {isValid, errors} = validateRegisterInput(req.body);

    //данные по регистрации пользователя неправильные возвращаем ошибку
    if (!isValid) 
    {
        return res.status(404).json(errors);
    }

    //проверяем есть ли пользователь с введенным email
    User.findOne(
    {
        email: req.body.email
    })
    .then(user => 
    {
        //если есть то возвращаем ошибку
        if (user) 
        {
            errors.email = 'Email was used!'
            return res.status(404).json(errors);
        }

        //если нет то регистрируем нового пользователя в модели User на сервере mongodb
        //при этом шифруем пароль нового зарегистрированного пользователя 
        bcrypt.genSalt(10, function(err, salt)
        {
            bcrypt.hash(req.body.password, salt, function(err, hash) 
            {
                const newUser = new User(
                {
                    email: req.body.email,
                    login: req.body.login,
                    password: hash
                })
                newUser.save().then(newUser => res.json(newUser)).catch(err => console.log(err))
            })
        })
    })
})

//маршрутизатор авторизации зарегистрированного пользователя
router.route('/login').post((req,res) => 
{
    //проверяем данные по авторизации зарегистрированного  пользователя
    const {errors, isValid} = validateLoginInput(req.body);
        
    //данные по авторизации зарегистрированного пользователя неправильные
    if (!isValid) 
    {
        return res.status(404).json(errors);
    }

    //проверяем есть ли пользователем с введенным email
    User.findOne(
    {
        email: req.body.email
    })
    .then(user => 
    {
        //если есть то авторизируем такого пользователя, он по любому уже зарегистрирован
        if (user) 
        {
            //проверяем совпадение паролей
            bcrypt.compare(req.body.password, user.password).then(isMatch => 
            {
                if (isMatch) 
                {
                    //в случае совпадения записываем в токен идентификатор авторизируемого пользователя
                    const token = jwt.sign({id: user._id}, process.env.SECRET, {expiresIn: "1d"}, function(err,token)
                    {
                        //сформированный токен авторизируемого пользователя отправляем на фронтенд

                        //авторизация соответствующего зарегистрированного пользователя успешно завершена
                        return res.json(
                        {
                            success: true,
                            token: token
                        })
                    })
                } 
                else 
                {
                    //в противном случае выдаем ошибку пароли не совпадают
                    errors.password = "Password is incorrect"
                    return res.status(404).json(errors);
                } 
            })
        } 
        else 
        {
            //в противном случае выдаем ошибку, такого пользователя в моделе базы User нет 
            errors.email = 'User not found';
            return res.status(404).json(errors);
        }
    })
})

//маршрутизатор получения данных авторизованного пользователя через passport
router.route('/').get( passport.authenticate('jwt', {session: false}), (req,res) => 
{
    //собираем все полученные данные по авторизованному пользователю
    res.json(
    {
        _id: req.user._id,
        email: req.user.email,
        login: req.user.login,
        followers: req.user.followers,
        following: req.user.following,
    })
})

//маршрутизатор заполнения массивов following[] и followers[] модели базы данных User на сервере MongoDb
router.route('/follow').post(passport.authenticate('jwt', {session: false}),(req, res) => 
{
    //req.user._id - полученный идентификатор авторизованного пользователя из passport
    User.findOneAndUpdate(
    {
        _id: req.user._id        
    }
    , 
    {
        //в массив following из модели базы данных пользователя с идентификатором req.user._id добавили идентификатор req.body.userId
        $push: 
        {
            following: req.body.userId
        } 
    }
    ,        
    {
        new: true
    })
    .then(user => 
    {
        User.findOneAndUpdate(
        {
            _id: req.body.userId        
        }
        , 
        {
            //в массив followers из модели базы данных пользователя с идентификатором req.body.userId добавили идентификатор req.user._id
            $push: 
            {
                followers: req.user._id
            }
        }
        , 
        {
            new: true
        })
        .then(user =>
        {
            res.json(
            {
                userId: req.body.userId
            })
        }
        )
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
})

//маршрутизатор опустошения массивов following[] и followers[] модели базы данных пользователя на сервере MongoDb
router.route('/unfollow').post(passport.authenticate('jwt', {session: false}),(req, res) => 
{
    User.findOneAndUpdate(
    {
        _id: req.user.id
    }
    , 
    {
        //из массива following модели базы данных пользователя с идентификатором req.user._id удалили идентификатор req.body.userId
        $pull : 
        {
            following: req.body.userId
        }
    }, 
    {
        new: true
    })
    .then(user => 
    {
        User.findOneAndUpdate(
        {
            _id: req.body.userId
        }
        , 
        {
            //из массива followers модели базы данных пользователя с идентификатором req.body.userId удалили идентификатор req.user._id
            $pull: 
            {
                followers: req.user._id
            }
        }
        , 
        {
            new: true
        })
        .then(user => res.json(
        {
            userId: req.body.userId
        }))
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))      
})

//маршрутизатор поиска данных пользователя (включая его возможные посты) по введенному логину или email
router.route('/search').post((req,res) => 
{
    //ищем пользователя (включая его возможные посты) в моделе базы данных пользователей на сервере MongoDb по указанному
    //req.body.text, который относится либо к его email либо к его login
    User.findOne(
    {
        $or: 
        [
            {email: req.body.text},
            {login: req.body.text}
        ]
    })
    //требуемый пользователь найден с его данными (включая все его возможные посты) отправляем на фронтенд его идентификатор
    .then(user =>res.json(
    {
        userId: user._id
    }))
    //требуемый пользователь не найден
    .catch(err => res.status(404).json(
    {
        msg: 'User not found'
    }))
})

//маршрутизатор получения профиля данных пользователя по его указанному идентификатору req.params.id 
router.route('/:id').get((req,res) => 
{
    //проверяем есть ли в модели базы данных пользователей на сервере MongoDb пользователь  с указанным идентификатором
    User.findById(req.params.id).then(user => 
    {
        //если есть
        if (user) 
        {
            //то формируем профиль указанного пользователя и отправляем его на фронтенд
            return res.json(
            {
                _id: user._id,
                email: user.email,
                login: user.login,
                followers: user.followers,
                following: user.following 
            })
        } 
        else 
        {
            //в противном случае требуемого пользователя нет в соответствующей моделе базы данных
            return res.status(404).json({msg: "User not found"})
        }
    })
    .catch(err => console.log(err))
})

module.exports = router;