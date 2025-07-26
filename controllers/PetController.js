const Pet = require('../models/pet')
const getToken = require('../helpers/getToken')
const getUserByToken = require('../helpers/getUserByToken')
const objectId = require('mongoose').Types.ObjectId

module.exports = class petController {

    static async create(req, res) {
        if (!req.body) {
            return res.status(400).json({ message: "Nenhum dado foi enviado na requisição!" })
        }

        const { name, age, weight, color } = req.body
        const images = req.files

        if (!name) {
            res.status(422).json({ message: "O campo 'name' é um campo obrigatório!" })
        }
        if (!age) {
            res.status(422).json({ message: "O campo 'age' é um campo obrigatório!" })
        }
        if (!weight) {
            res.status(422).json({ message: "O campo 'weight' é um campo obrigatório!" })
        }
        if (!color) {
            res.status(422).json({ message: "O campo 'color' é um campo obrigatório!" })
        }
        if (images.length === 0) {
            res.status(422).json({ message: "O campo 'images' é um campo obrigatório!" })
        }

        const available = true

        const token = getToken(req, res)
        const user = await getUserByToken(token)

        const pet = new Pet({
            name,
            age,
            weight,
            color,
            available,
            images: [],
            user: {
                _id: user._id,
                name: user.name,
                phone: user.phone,
                email: user.email
            }
        })

        images.map((image) => {
            pet.images.push(image.filename)
        })

        try {
            const petCreate = await pet.save()
            res.status(201).json({ message: 'O pet foi cadastrado com sucesso!', petCreate })
        } catch (err) {
            res.status(500).json({ message: err })
        }
    }

    static async getall(req, res) {
        const pets = await Pet.find().sort('createdAt')

        if (pets.length === 0) {
            res.status(404).json({ message: 'Nenhum pet encontrado!' })
            return
        }
        res.status(200).json({ 'total': pets.length, pets: pets })
    }

    static async getmypets(req, res) {
        const token = getToken(req, res)
        const user = await getUserByToken(token)

        const pets = await Pet.find({ 'user._id': user._id }).sort('createdAt')

        if (pets.length === 0) {
            res.status(404).json({ message: 'Nenhum pet encontrado!' })
            return
        }
        res.status(200).json({ 'total': pets.length, pets: pets })
    }

    static async getmyadopter(req, res) {
        const token = getToken(req, res)
        const user = await getUserByToken(token)

        const pets = await Pet.find({ 'adopter._id': user._id }).sort('createdAt')

        if (pets.length === 0) {
            res.status(404).json({ message: 'Nenhum pet foi adotado!' })
            return
        }
        res.status(200).json({ 'total': pets.length, pets: pets })
    }

    static async getbyid(req, res) {
        const id = req.params.id

        if (!objectId.isValid(id)) {
            res.status(422).json({ message: "Id inválido!" })
            return
        }

        const pet = await Pet.findOne({ _id: id })

        if (!pet) {
            res.status(404).json({ message: "Nenhum pet encontrado!" })
            return
        }

        res.status(200).json({ pet })

    }

    static async deletebyid(req, res) {
        const id = req.params.id

        if (!objectId.isValid(id)) {
            res.status(422).json({ message: "Id inválido!" })
            return
        }

        const pet = await Pet.findOne({ _id: id })

        if (!pet) {
            res.status(404).json({ message: "Nenhum pet encontrado!" })
            return
        }

        const token = getToken(req, res)
        const user = await getUserByToken(token)

        if (pet.user._id.toString() !== user._id.toString()) {
            res.status(422).json({ message: "Não é possivel excluir um pet cadastrado por outra pessoa!" })
            return
        }

        const deletePet = await Pet.findByIdAndDelete(id)

        res.status(200).json({ message: 'Pet removido com sucesso!', 'Pet Removido': deletePet })

    }

    static async updatebyid(req, res) {
        if (!req.body) {
            return res.status(400).json({ message: "Nenhum dado foi enviado na requisição!" })
        }

        const id = req.params.id
        const { name, age, weight, color } = req.body
        const images = req.files
        const updatedData = {}

        if (!objectId.isValid(id)) {
            res.status(422).json({ message: "Id inválido!" })
            return
        }

        const pet = await Pet.findOne({ _id: id })

        if (!pet) {
            res.status(404).json({ message: "Nenhum pet encontrado!" })
            return
        }

        const token = getToken(req, res)
        const user = await getUserByToken(token)

        if (pet.user._id.toString() !== user._id.toString()) {
            res.status(422).json({ message: "Não é possivel atualizar um pet cadastrado por outra pessoa!" })
            return
        }

        if (!name) {
            res.status(422).json({ message: "O campo 'name' é um campo obrigatório!" })
        } else {
            updatedData.name = name
        }

        if (!age) {
            res.status(422).json({ message: "O campo 'age' é um campo obrigatório!" })
        } else {
            updatedData.age = age
        }

        if (!weight) {
            res.status(422).json({ message: "O campo 'weight' é um campo obrigatório!" })
        } else {
            updatedData.weight = weight
        }

        if (!color) {
            res.status(422).json({ message: "O campo 'color' é um campo obrigatório!" })
        } else {
            updatedData.color = color
        }

        if (images.length === 0) {
            res.status(422).json({ message: "O campo 'images' é um campo obrigatório!" })
        } else {
            updatedData.images = []
            images.map((image) => { updatedData.images.push(image.filename) })
        }

        await Pet.findByIdAndUpdate(id, updatedData)

        res.status(200).json({ message: "Pet atualizado com sucesso", 'Pet atualizado': updatedData })

    }

    static async schedulepet(req, res) {
        const id = req.params.id

        if (!objectId.isValid(id)) {
            res.status(422).json({ message: "Id inválido!" })
            return
        }

        const pet = await Pet.findOne({ _id: id })

        if (!pet) {
            res.status(404).json({ message: "Nenhum pet encontrado!" })
            return
        }

        const token = getToken(req, res)
        const user = await getUserByToken(token)

        if (pet.user._id.toString() === user._id.toString()) {
            res.status(422).json({ message: "Você não pode agendar uma consulta com seu próprio pet!" })
            return
        }

        if (pet.adopter) {
            if (pet.adopter._id.toString() === user._id.toString()) {
                res.status(422).json({ message: "Você já agendou um visita para este pet!" })
                return
            }
        }

        pet.adopter = {
            _id: user._id,
            name: user.name,
            phone: user.phone,
            image: user.image
        }

        await Pet.findByIdAndUpdate(id, pet)

        res.status(200).json({ message: 'Visita marcada com sucesso!' })
    }

    static async concludepet(req, res) {
        const id = req.params.id

        if (!objectId.isValid(id)) {
            res.status(422).json({ message: "Id inválido!" })
            return
        }

        const pet = await Pet.findOne({ _id: id })

        if (!pet) {
            res.status(422).json({ message: "Pet não encontrado!" })
        }

        const token = getToken(req, res)
        const user = await getUserByToken(token)

        if (pet.user._id.toString() !== user._id.toString()) {
            res.status(422).json({ message: "Houve um problema ao processar sua solicitação, tente novamente mais tarde!" })
            return
        }

        pet.available = false

        await Pet.findByIdAndUpdate(id, pet)

        res.status(200).json({ message: "Parabens o seu pet foi adotado com sucesso!" })
    }
}