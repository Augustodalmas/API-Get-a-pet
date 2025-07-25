const getToken = (req, res) =>{
    const authHeader = req.headers.authorization
    const token =  authHeader.split(' ')[1]
    return token
}

module.exports = getToken