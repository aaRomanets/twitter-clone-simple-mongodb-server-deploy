const Validator = require('validator');

//функция проверки данных зарегистрированного пользователя, необходимых для его авторизации
module.exports = function(data) 
{
    let errors = {};

    //проверяем почту зарегистрированного пользователя
    if (Validator.isEmpty(data.email)) 
    {
        //почты зарегистированного пользователя нет
        errors.email = 'Email field is required';
    }

    if (!Validator.isEmail(data.email)) 
    {
        //почта зарегистированного пользователя неправильная
        errors.email = 'Email is invalid';
    }

    //проверяем пароль зарегистрированного пользователя
    if (Validator.isEmpty(data.password)) 
    {
        //пароля зарегистированного пользователя нет
        errors.password = 'Password field is required';
    }

    if (!Validator.isLength(data.password, {min: 6, max: 30})) 
    {
        //пароль зарегистированного пользователя неправильный
        errors.password = 'Password must between 6 and 30 characters';
    }    

    return {
        errors,
        //условие когда данные зарегистрированного пользователя, необходимые для его авторизации правильные
        isValid: Object.keys(errors).length == 0
    }
}