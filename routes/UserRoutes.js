const router = require('express').Router()
const UserController = require('../controllers/UserController')

const verifyToken = require('../helpers/verifyToken')
const {imageUpload} = require('../helpers/postImagem')

router.post('/register', UserController.register)
router.post('/login', UserController.login)
router.get('/check', UserController.checkUser)
router.get('/:id', UserController.getUserById)
router.patch('/edit/:id', verifyToken, imageUpload.single('image') ,UserController.editUser)

module.exports = router