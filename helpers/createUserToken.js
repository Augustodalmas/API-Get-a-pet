const jwt = require('jsonwebtoken')

const createUserToken = async (user, req, res) => {

    const token = jwt.sign({
        name: user.name,
        id: user._id
    }, 'D41D8CD98F00B204E9800998ECF8427E')

    
    res.status(200).json({
        message: 'Você está autenticado',
        token: token,
    })
}

module.exports = createUserToken