const service = require('../services/userService')

const register = async (req, res, next) => {
    const { fullname, email, password } = req.body
    
    try {
        const registerData = await service.register(fullname, email, password)
        res.status(200).json({message: 'Register success', data: registerData})
    } catch (error) {
        next(error)
    }
}

const login = async (req, res, next) => {
    const {email, password} = req.body
    try {
        const {token} = await service.login(email, password)
        res.cookie('token', token, { httpOnly: true }, { maxAge: 60 * 60 * 1000 } )
        res.status(200).json({message: 'Login success'})
    } catch (error) {
        next(error)
    }
}

module.exports = {
    register,
    login
}