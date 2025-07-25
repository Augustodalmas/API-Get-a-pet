const jwt = require('jsonwebtoken')
const User = require('../models/users')

const getUserByToken = async (token) => {
    if (!token){
        res.status(401).json({message: "Acesso negado!"})
    }

    const decoded = jwt.verify(token, 'D41D8CD98F00B204E9800998ECF8427E')

    const userID = decoded.id

    const user = await User.findOne({_id: userID})

    return user
}

module.exports = getUserByToken