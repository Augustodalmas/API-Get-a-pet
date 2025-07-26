const router = require('express').Router()
const petController = require('../controllers/PetController')
const verifyToken = require('../helpers/verifyToken')

const { imageUpload } = require('../helpers/postImagem')

router.post('/create', verifyToken, imageUpload.array("images"), petController.create)
router.get('/', petController.getall)
router.get('/mypets', verifyToken, petController.getmypets)
router.get('/myadopter', verifyToken, petController.getmyadopter)
router.get('/:id', verifyToken, petController.getbyid)
router.delete('/:id', verifyToken, petController.deletebyid)
router.patch('/:id', verifyToken, imageUpload.array("images"), petController.updatebyid)
router.patch('/schedule/:id', verifyToken, petController.schedulepet)
router.patch('/conclude/:id', verifyToken, petController.concludepet)

module.exports = router