
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const config = require('./config')
const {sequelize} = require('./models')

const app = express()
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())
app.use('/content', express.static('content'))

require('./passport')
require('./routes')(app)

sequelize.sync({force: true})
    .then(() => {
        app.listen(config.port)
        console.log(`Server started, port ${config.port}`)
    })