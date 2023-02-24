const router = require('express').Router()
const passport = require('passport')

//вытаскиваем модель поста
const Post = require('../models/Post')

//маршрутизатор формирования нового поста 
router.route('/add').post(passport.authenticate('jwt', {session: false}), (req, res) => 
{
    //текст нового поста авторизированноого пользователя
    const text = req.body.text.trim()
       
    //конфигурируем новый пост авторизированного пользователя (текст поста, идентификатор и логин авторизированного пользователя)
    const newPost = new Post(
    {
        user: 
        {
            id: req.user.id,
            login: req.user.login
        },
        text
    })

    //заносим новый пост авторизированного пользователя в модель базы данных постов на сервере mobgoDb
    newPost.save().then(post => res.json(post)).catch(err => console.log(err));
})

//маршрутизатор получения всех постов от всех пользователей 
router.route('/').get((req,res) => 
{
    //список постов формируем так самый недавний - первый и так далее 
    Post.find().sort(
    {
        createdAt: -1
    })
    //отправляем список полученных постов на фронтенд
    .then(posts => res.json(posts))
    //возникла ошибка при загрузке указанных постов
    .catch(err => console.log(err));
})  
    
//маршрутизатор получения всех постов по идентификаторам пользователей из массива req.user.following
//а req.user - все данные авторизованного пользователя
router.route('/following').get(passport.authenticate('jwt', {session: false}), (req, res) => 
{
    //сначала из passport получаем req.user - все данные авторизованного пользователя

    //находим все указанные посты
    Post.find(
    {
        'user.id': {$in: req.user.following}
    })   
    //найденный список постов формируем так самый недавний самый первый и так далее
    .sort({createdAt: -1})
    //отправляем сформированный список постов на фронтенд
    .then(posts => res.json(posts)).catch(err => console.log(err))
})

//маршрутизатор получения постов от пользователя с идентификатором req.params.userId
router.route('/:userId').get((req,res) => 
{
    //находим в моделе базы данных по постам на сервере MongoDb список постов с идентификатором пользователя req.params.userId
    Post.find(
    {
        'user.id': req.params.userId
    })
    //список постов пользователя с идентификатором userId  формируем так самый недавний - первый и так далее 
    .sort({createdAt: -1})
    //отправляем список полученных постов на фронтенд
    .then(posts => res.json(posts))
    //возникла ошибка при загрузке указанных постов
    .catch(err => console.log(err))
})

module.exports = router;