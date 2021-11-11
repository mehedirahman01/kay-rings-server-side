const express = require('express')
const { MongoClient } = require('mongodb');
const cors = require('cors')
require('dotenv').config()
const ObjectId = require('mongodb').ObjectId


// initialization
const app = express()
const port = process.env.PORT || 5000

//middlewares
app.use(cors())
app.use(express.json())

//connect MongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dtoly.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect()
        const database = client.db('kayRings')
        const ringCollection = database.collection('ringCollection')

        // Get Ring Collection API 
        app.get('/ringCollection', async (req, res) => {
            const cursor = ringCollection.find({})
            const rings = await cursor.toArray()
            res.send(rings)
        })

        // Get Single Ring Details
        app.get('/placeOrder/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const singeRing = await ringCollection.findOne(query)
            res.json(singeRing)
        })


    }
    finally {
        // await client.close()
    }
}

run().catch(console.dir)


app.get('/', (req, res) => {
    res.send("Running Kay Rings Server")
})

app.listen(port, () => {
    console.log("Running on port", port)
})