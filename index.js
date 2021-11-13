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
        const ordersCollection = database.collection('ordersCollection')
        const reviewsCollection = database.collection('reviewsCollection')
        const userCollection = database.collection('users')

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

        // Place Order Post API
        app.post('/placeOrder', async (req, res) => {
            const order = req.body
            const results = await ordersCollection.insertOne(order)
            res.json(order)
        })

        // Get User Orders
        app.post('/myOrders', async (req, res) => {
            const userEmail = req.body.email
            const query = { email: { $in: [userEmail] } }
            const orders = await ordersCollection.find(query).toArray()
            res.send(orders)
        })

        // Order Delete API
        app.delete('/placeOrder/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await ordersCollection.deleteOne(query)
            res.json(result)
        })

        // Reviews Post API
        app.post('/review', async (req, res) => {
            const review = req.body
            const results = await reviewsCollection.insertOne(review)
            res.json(review)
        })

        // Reviews Get API
        app.get('/review', async (req, res) => {
            const cursor = reviewsCollection.find({})
            const reviews = await cursor.toArray()
            res.send(reviews)
        })

        // Users Post API
        app.post('/users', async (req, res) => {
            const user = req.body
            const result = await userCollection.insertOne(user)
            res.json(result)
        })

        // Get User Role
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const user = await userCollection.findOne(query)
            let isAdmin = false
            if (user?.role === 'admin') {
                isAdmin = true
            }

            res.json({ admin: isAdmin })
        })

        // Admin API
        app.put('/makeAdmin', async (req, res) => {
            const user = req.body
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'admin' } }
            const result = await userCollection.updateOne(filter, updateDoc)
            res.json(result)

        })

        // Get All Orders API 
        app.get('/allOrders', async (req, res) => {
            const cursor = ordersCollection.find({})
            const orders = await cursor.toArray()
            res.send(orders)
        })

        // Approve Order
        app.put('/order/:id', async (req, res) => {
            const orderId = req.params.id
            const query = { _id: ObjectId(orderId) }

            const updateDoc = {
                $set: {
                    status: "Shipped"
                },
            };
            const result = await ordersCollection.updateOne(query, updateDoc);
            res.send(result)
        })

        // Add Product API
        app.post('/addProduct', async (req, res) => {
            const product = req.body
            const result = await ringCollection.insertOne(product)
            res.json(result)
        })

        // Get All Products API 
        app.get('/allProducts', async (req, res) => {
            const cursor = ringCollection.find({})
            const products = await cursor.toArray()
            res.send(products)
        })

        // Delete Product API
        app.delete('/deleteProduct/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await ringCollection.deleteOne(query)
            res.json(result)
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