const jwt = require('jsonwebtoken')
const getToken = require('../helpers/getToken')

const verifyToken = async (req, res, next) => {

    if (!req.headers.authorization){
        res.status(401).json({message: "Acesso negado!"})
    }

    const token = getToken(req, res)

    if (!token){
        res.status(401).json({message: "Acesso negado!"})
    }
    try {
        const verified = jwt.verify(token, 'D41D8CD98F00B204E9800998ECF8427E')
        req.user = verified
        next()
    } catch (err) {
        res.status(400).json({message: "Token inválido!"})
    }
    
}

module.exports = verifyToken