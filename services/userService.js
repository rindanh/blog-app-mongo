const { createError } = require('../middlewares/errors')
const userModel = require('../models/users')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const register = async (fullname, email, password) => {
    const existingUser = await userModel.findOne({
        email: email
    })

    if (existingUser) {
        const error = createError(409, null, "A user with that email already exists")
        throw error
    }

    const user = await userModel.create({
        fullname: fullname,
        email: email,
        password: password
    })

    return {
        email: email,
        id: user._id
    }
}

const login = async (email, password) => {
    const user = await userModel.findOne({
        email: email
    })

    if (!user) {
        throw createError(404, null, "User not found")
    }

    const isValidPassword = await user.isValidPassword(password)
    if (!isValidPassword) {
        throw createError(400, null, "Password invalid")
    }

    const secret = process.env.JWT_SECRET || 'secret'
    const token = await jwt
    .sign({ 
        user: {
            fullname: user.fullname,
            _id: user._id,
            email: user.email
        } 
    }, secret, {
        expiresIn: '1h'
    })

    return {
        token,
        id: user._id
    }
}

module.exports = {
    register,
    login
}