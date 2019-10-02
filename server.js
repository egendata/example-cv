require('dotenv').config()
require('./api/adapters/apm')

console.log(`NODE_ENV: ${process.env.NODE_ENV}`)

const next = require('next')
const express = require('express')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev, quiet: true })
const handle = app.getRequestHandler()
const server = require('./api/app')

const operator = require('./api/adapters/operator')

app.prepare().then(() => {
  server.use(express.static('static'))
  server.get('*', (req, res) => {
    handle(req, res)
  })
  server.listen(process.env.PORT || 4000, async () => {
    try {
      operator.events.on('CONNECTING', (attempt) =>
        console.log(`Connecting to Operator, attempt ${attempt + 1}`))
      await operator.connect()
      console.log('Connected to operator')
    } catch (err) {
      console.error(err)
    }
  })
})
