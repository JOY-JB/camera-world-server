const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const cors = require('cors')

const port = process.env.PORT || 5000

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nzciw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();

        const database = client.db("camera_world");
        const productCollection = database.collection("products");
        const PurchasedProductCollection = database.collection("purchased_product");
        const reviewCollection = database.collection("review");


        // Product add to db
        app.post("/addproduct", async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.json(result);
        });

        // Purchased Product add to db
        app.post("/purchase", async (req, res) => {
            const purchasedProduct = req.body;
            const result = await PurchasedProductCollection.insertOne(purchasedProduct);
            res.json(result);
        });

        // find all Product
        app.get("/allproduct", async (req, res) => {
            const limit = parseInt(req.query.limit);
            let products;
            if (limit) {
                products = productCollection.find({}).limit(limit);
            }
            else {
                products = productCollection.find({});
            }
            const result = await products.toArray();
            res.json(result);
        });

        // find a product
        app.get("/product/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.json(product);
        });

        // find order by email
        app.get("/orders", async (req, res) => {
            const email = req.query.email;
            const orders = PurchasedProductCollection.find({ email });
            const result = await orders.toArray();
            res.json(result)
        });

        // delete a order by id
        app.delete("/deleteorder/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await PurchasedProductCollection.deleteOne(query);
            res.json(result);
        });

        // add a review to db
        app.post("/addreview", async (req, res) => {
            const data = req.body;
            const result = await reviewCollection.insertOne(data);
            res.json(result);
        });

        //get all user review
        app.get("/reviews", async (req, res) => {
            const reviews = reviewCollection.find({});
            const result = await reviews.toArray();
            res.json(result);
        })

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Hello Camera World!')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})