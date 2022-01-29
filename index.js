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
        const usersCollection = database.collection("users");
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

        // find order by email
        app.get("/allorders", async (req, res) => {
            const orders = PurchasedProductCollection.find({});
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

        // delete a product by id
        app.delete("/deleteproduct/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await productCollection.deleteOne(query);
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

        //add an admin
        app.post("/adduser", async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        })

        //add an admin
        app.put("/addadmin", async (req, res) => {
            const email = req.body.email;
            const filter = { email };
            const update = { $set: { role: "admin" } }
            const result = await usersCollection.updateOne(filter, update)
            res.json(result);
        })

        //change order status
        app.put("/changeorderstatus", async (req, res) => {
            const orderid = req.body.id;
            const orderStatus = req.body.status;
            const filter = { _id: ObjectId(orderid) };
            const update = { $set: { status: orderStatus } }
            const result = await PurchasedProductCollection.updateOne(filter, update);
            res.json(result);
        })

        //check for admin
        app.get("/user/:email", async (req, res) => {
            const email = req.params.email;
            const user = await usersCollection.findOne({ email });
            let isAdmin;
            if (user?.role === "admin") {
                isAdmin = true;
            } else {
                isAdmin = false;
            }
            res.json(isAdmin);
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