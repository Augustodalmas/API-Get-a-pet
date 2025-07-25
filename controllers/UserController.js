const User = require('../models/users')
const jwt = require('jsonwebtoken')
const createUserToken = require('../helpers/createUserToken')
const getToken = require('../helpers/getToken')
const getUserByToken = require('../helpers/getUserByToken')
const bcrypt = require('bcrypt')

module.exports = class UserController {
    static async register(req, res) {
        const { name, email, phone, password, confirmpassword} = req.body

        if (!name) {
            res.status(422).json({message: "O campo 'name' é um campo obrigatório!"})
        }
        if (!email) {
            res.status(422).json({message: "O campo 'email' é um campo obrigatório!"})
        }
        if (!phone) {
            res.status(422).json({message: "O campo 'phone' é um campo obrigatório!"})
        }
        if (!password) {
            res.status(422).json({message: "O campo 'password' é um campo obrigatório!"})
        }
        if (!confirmpassword) {
            res.status(422).json({message: "O campo 'confirmpassword' é um campo obrigatório!"})
        }

        if (password !== confirmpassword){
            res.status(422).json({message: "Os campos de 'password' e 'confirmpassword' devem ser iguais!"})
        }

        const userExist = await User.findOne({email: email})

        const regex_email = /^[a-z0-9.]+@[a-z0-9]+\.[a-z]+\.([a-z]+)?$/i
        if (!email.match(regex_email)){
            res.status(422).json({message: "Por favor, insira um E-mail válido!"})
        }

        if (userExist){
            res.status(422).json({message: "Por favor, verifique seu Email informado para confirmar o registro!"})
        }

        const salt = await bcrypt.genSalt(12)
        const passwordHash = await bcrypt.hash(password, salt)

        const user = new User({
            name,
            email,
            phone,
            password: passwordHash
        })

        try {
        
            const newUser = await user.save()
            await createUserToken(newUser, req, res)

        } catch (err) {
            res.json({message: err})}
    }

    static async login( req, res){
        const {email, password} = req.body
        if (!email) {
            res.status(422).json({message: "O campo 'email' é um campo obrigatório!"})
        }
        if (!password) {
            res.status(422).json({message: "O campo 'password' é um campo obrigatório!"})
        }

        const user = await User.findOne({email: email})
        
        if (!user){
            res.status(422).json({message: "Usuário não encontrado"})
        }

        const checkpassword = await bcrypt.compare(password, user.password)
        if (!checkpassword){
            res.status(422).json({message: "Senha inválida"})
        }

        await createUserToken(user, req, res)
    }

    static async checkUser(req, res){
        let currentUser
        
        if(req.headers.authorization){ 
            const token = getToken(req, res)
            const decoded = jwt.verify(token, 'D41D8CD98F00B204E9800998ECF8427E')
            currentUser = await User.findById(decoded.id).select('-password')
        }else{
            currentUser = null
        }

        res.status(200).send(currentUser)
    }

    static async getUserById(req, res){
        const id = req.params.id

        const user = await User.findById(id)

        if (!user){
            res.status(404).json({message: "Nenhum usuário foi encontrado."})
        }

        res.status(200).json({message: user})

    }

    static async editUser(req, res){

        const token = await getToken(req, res)
        const user = await getUserByToken(token)
        
        if(req.file){
            user.image = req.file.filename
        }

        const { name, email, phone, password, confirmpassword} = req.body

        if (!name) {
            res.status(422).json({message: "O campo 'name' é um campo obrigatório!"})
        }
        user.name = name

        if (!email) {
            res.status(422).json({message: "O campo 'email' é um campo obrigatório!"})
        }
        user.email = email

        if (!phone) {
            res.status(422).json({message: "O campo 'phone' é um campo obrigatório!"})
        }
        user.phone = phone

        if (!password) {
            res.status(422).json({message: "O campo 'password' é um campo obrigatório!"})
        }
        user.password = password

        const regex_email = /^[a-z0-9.]+@[a-z0-9]+\.[a-z]+\.([a-z]+)?$/i
        if (!email.match(regex_email)){
            res.status(422).json({message: "Por favor, insira um E-mail válido!"})
        }

        if (password !== confirmpassword){
            res.status(422).json({message: "Os campos de 'password' e 'confirmpassword' devem ser iguais!"})
        } else if (password === confirmpassword && password != null) {
            const salt = await bcrypt.genSalt(12)
            const passwordHash = await bcrypt.hash(password, salt)
            user.password = passwordHash
        }

        try {
            const updateUser = await User.findOneAndUpdate(
                { _id: user._id },
                { $set: user },
                { new: true },
            )
            res.status(200).json({message: 'Dados atualizados com sucesso!', updateUser})
        } catch (err) {
            res.status(500).json({message: err})
        }
    }

}