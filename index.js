const express = require('express')
const cors = require('cors')

const app = express()
//Json
app.use(express.json())
//Cors
app.use(cors({ credentials:true, origin: 'http://localhost:3000'}))
//Publics
app.use(express.static('public'))
//Routes
const UserRoutes = require('./routes/UserRoutes')
const PetsRoutes = require('./routes/PetRoutes')

app.use('/user', UserRoutes)
app.use('/pets', PetsRoutes)

app.listen(5000, () => {
    console.log('Backend conectado em 5000');
})