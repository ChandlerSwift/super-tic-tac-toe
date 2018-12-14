const express = require('express')
const app = express()
const port = 3000
const path = require('path')

app.use('/static', express.static(path.join(__dirname, 'static')))
app.get('/', (req, res) => res.sendFile('index.html', {root: __dirname}))

app.listen(port, () => console.log(`Listening on port ${port}!`))
