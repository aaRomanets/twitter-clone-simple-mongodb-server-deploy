const Validator = require('validator');

//функция проверки данных, необходимых для регистрации нового пользователя
module.exports = function(data) 
{
    let errors = {};

    //проверяем почту регистрируемого пользователя
    if (Validator.isEmpty(data.email)) 
    {
        //почты регистрируемого пользователя нет
        errors.email = 'Email field is required';
    }

    if (!Validator.isEmail(data.email)) 
    {
        //почта регистрируемого пользователя неправильная
        errors.email = 'Email is invalid';
    }

    //проверяем логин регистрируемого пользователя
    if (Validator.isEmpty(data.login)) 
    {
        //логина регистрируемого пользователя нет
        errors.login = 'Login field is required';
    }

    if (!Validator.isLength(data.login, {min: 4, max: 30})) 
    {
        //логин регистрируемого пользователя неправильный
        errors.login = 'Login must between 4 and 30 characters';
    }

    //проверяем пароль регистрируемого пользователя
    if (Validator.isEmpty(data.password)) 
    {
        //пароля регистрируемого пользователя нет
        errors.password = 'Password field is required';
    }

    if (!Validator.isLength(data.password, {min: 6, max: 30})) 
    {
        //пароль регистрируемого пользователя неправильный
        errors.password = 'Password must between 6 and 30 characters';
    }

    //проверяем подтверждение пароля регистрируемого пользователя
    if (Validator.isEmpty(data.password2)) 
    {
        //подтвержденного пароля регистрируемого пользователя нет
        errors.password2 = 'Confirm password is required'
    }    

    if (!Validator.equals(data.password, data.password2))
    {
        //подтвержденый пароль регистрируемого пользователя неправильный
        errors.password2 = 'Password must match'
    }    

    return {
        errors,
        //условие при котором данные, необходимые для регистрации нового пользователя правильные
        isValid: Object.keys(errors).length == 0
    }
}