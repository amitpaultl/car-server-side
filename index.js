const express = require('express');
const cors = require('cors');
const prot = process.env.PROT || 5000;
require('dotenv').config();
const app = express();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors());
app.use(express.json());

const key_stripe = process.env.Stripe_Secret_key

const stripe = require("stripe")(key_stripe)
//middleware


const uri = `mongodb+srv://${process.env.User}:${process.env.Password}@cluster0.acij04d.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// mongodb connect  
const dbConnent = async () => {
    try {
        await client.connect();


    }
    catch (error) {
        console.log(error);

    }

}
dbConnent()

// data collection

const user = client.db('carSelling').collection('user');
const products = client.db('carSelling').collection('product');
const booking = client.db('carSelling').collection('booking');
const paymentColletion = client.db('carSelling').collection('payment');

// jwt 
function veriFJwt(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send('unauthorized')
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.Jwt_Token, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })
}

// jwt 
app.get('/jwt', async (req, res) => {
    const email = req.query.email;
    const query = { email: email };
    const usere = await user.findOne(query);
    if (usere) {
        const token = jwt.sign({ email }, process.env.Jwt_Token);
        return res.send({ accessToken: token });
    }
    res.status(403).send({ accessToken: ' ' })
})

// jwtAdmin
const verifyseller = async (req, res, next) => {
    const decodedEmail = req.decoded.email;
    const query = { email: decodedEmail };
    const usersSeller = await user.findOne(query)
    if (usersSeller?.role !== true) {
        return res.status(403).send({ message: 'Forbidden access' })
    }

    next()
}

// payment

app.post("/create-payment-intent", async (req, res) => {
    const payment = req.body;
    const price = payment.price;
    const amount = price * 100;

    console.log(amount);
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
        currency: "usd",
        amount: amount,
        "payment_method_types": [
            "card"
        ]

    });

    res.send({
        clientSecret: paymentIntent.client_secret,
    });
});

// pament 

app.post('/payments', async (req, res) => {
    const payment = req.body;
    const productIdMain = payment.productId
    const result = await paymentColletion.insertOne(payment);
    const id = payment.bookingId;
    const filter = { _id: ObjectId(id) }
    const updateDoc = {
        $set: {
            paid: true,
            transactionId: payment.transactionId
        }
    }
    const updateResult = await booking.updateOne(filter, updateDoc)
    const  mainProduct = { _id: ObjectId(productIdMain) }
    const updateProduct = {
        $set: {
            paid: true,
        }
    }
    const productUpdate = await products.updateOne(mainProduct, updateProduct)

    res.send(result)
})

// post user collection
app.put('/user', async (req, res) => {
    try {
        const car = req.body;
        const result = await user.insertOne(car);
        res.send({
            success: true,
            data: result,
            message: 'Successfully get data'
        })
    } catch (error) {
        res.send({
            success: false,
            error: error.message,
        })
    }
})

// Get user collection
app.get('/user', async (req, res) => {
    try {
        const query = {}

        const result = await user.find(query).toArray()

        res.send({
            success: true,
            data: result,
            message: 'Successfully get data'
        })
    } catch (error) {
        res.send({
            success: false,
            error: error.message,
        })
    }
})

// delete user id
app.delete('/user/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const filter = { _id: ObjectId(id) }
        const query = await user.deleteOne(filter);
        res.send({
            success: true,
            data: query,
            message: 'Successfully get data'
        })

    } catch (error) {
        res.send({
            success: false,
            error: error.message,
        })
    }
})

// put user
app.put('/user/:email', async (req, res) => {
    try {
        // const decodedEmail =req.decoded.email;
        // const query ={email:decodedEmail};
        // const usersAdmin = await user.findOne(query)
        // if(usersAdmin?.role !== 'admin'){
        //     return res.status(403).send({message:'Forbidden access'})
        // }


        const email = req.params.email;
        const filter = { email: email };

        const option = { upsert: true };
        const updateId = {
            $set: {
                verify: true
            }
        }
        const result = await user.updateOne(filter, updateId, option)

        const varifyProduct = {
            $set: {
                varifyUser: true
            }
        }

        const varifyUserProduct = await products.updateMany(filter, varifyProduct, option)

        console.log('varifyUserProduct', varifyUserProduct);

        res.send({
            success: true,
            data: result,
            message: 'Successfully get data'

        })
    } catch (error) {
        res.send({
            success: false,
            error: error.message,
        })

    }
})

// post user collection
app.post('/addProduct', veriFJwt, async (req, res) => {
    try {

        const decodedEmail =req.decoded.email;
        console.log("lohiugfde", decodedEmail);

        // const query ={email:decodedEmail};
        // const usersAdmin = await user.findOne(query)
        // if(usersAdmin?.role !== 'admin'){
        //     return res.status(403).send({message:'Forbidden access'})
        // }

        const car = req.body;
        const result = await products.insertOne(car);
        res.send({
            success: true,
            data: result,
            message: 'Successfully get data'
        })
    } catch (error) {
        res.send({
            success: false,
            error: error.message,
        })
    }
})

// Get user collection
app.get('/addProduct', async (req, res) => {
    try {
        const query = {}

        const result = await products.find(query).toArray()

        res.send({
            success: true,
            data: result,
            message: 'Successfully get data'
        })
    } catch (error) {
        res.send({
            success: false,
            error: error.message,
        })
    }
})

// Get user collection
app.get('/myProduct', async (req, res) => {
    try {
        const email = req.query.email;
        const filter = { email: email };
        const result = await products.find(filter).toArray()
        res.send({
            success: true,
            data: result,
            message: 'Successfully get data'
        })
    } catch (error) {
        res.send({
            success: false,
            error: error.message,
        })
    }
})

// get seller admin user 
app.get('/seller/admin/:email', async (req,res)=>{
    try {
        const email = req.params.email;
        const query = {email};
        const users = await user.findOne(query)
        res.send({isSeller: users?.role === 'seller'});
        
    } catch (error) {
        res.send({
            success: false,
            error: error.message,
        })
    }
})

// get admin admin user 
app.get('/admin/admin/:email', async (req,res)=>{
    try {
        const email = req.params.email;
        const query = {email};
        const users = await user.findOne(query)
        res.send({isAdmin: users?.role === "admin"});
        
    } catch (error) {
        res.send({
            success: false,
            error: error.message,
        })
    }
})

// get admin admin user 
app.get('/user/admin/:email', async (req,res)=>{
    try {
        const email = req.params.email;
        const query = {email};
        const users = await user.findOne(query)
        res.send({isUser: users?.role === "user"});
        
    } catch (error) {
        res.send({
            success: false,
            error: error.message,
        })
    }
})

// single product item
app.get('/addProduct/:id', async (req, res) => {
    try {
        const id = req.params.id
        const query = { _id: ObjectId(id) }

        const resust = await products.findOne(query)
        console.log(resust);
        res.send(resust)

    } catch (error) {
        res.send({
            success: false,
            error: error.message,
        })
    }
})

// put advidser
app.put('/addProduct/:id', async (req, res) => {
    try {
        // const decodedEmail =req.decoded.email;
        // const query ={email:decodedEmail};
        // const usersAdmin = await user.findOne(query)
        // if(usersAdmin?.role !== 'admin'){
        //     return res.status(403).send({message:'Forbidden access'})
        // }


        const id = req.params.id;
        const filter = { _id: ObjectId(id) };
        const option = { upsert: true };
        const updateId = {
            $set: {
                publish: true
            }
        }
        const result = await products.updateOne(filter, updateId, option)
        res.send({
            success: true,
            data: result,
            message: 'Successfully get data'

        })
    } catch (error) {
        res.send({
            success: false,
            error: error.message,
        })

    }
})

// put report
app.put('/report', async (req, res) => {
    try {
        // const decodedEmail =req.decoded.email;
        // const query ={email:decodedEmail};
        // const usersAdmin = await user.findOne(query)
        // if(usersAdmin?.role !== 'admin'){
        //     return res.status(403).send({message:'Forbidden access'})
        // }


        const product = req.body;
        const id = product.report

        const filter = { _id: ObjectId(id) };

        const option = { upsert: true };
        const updateId = {
            $set: {
                report: true
            }
        }
        const result = await products.updateOne(filter, updateId, option)
        console.log(result);
        res.send({
            success: true,
            data: result,
            message: 'Successfully get data'

        })
    } catch (error) {
        res.send({
            success: false,
            error: error.message,
        })

    }
})

// delete addProduct id
app.delete('/addProduct/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const filter = { _id: ObjectId(id) }
        const query = await products.deleteOne(filter);
        res.send({
            success: true,
            data: query,
            message: 'Successfully get data'
        })

    } catch (error) {
        res.send({
            success: false,
            error: error.message,
        })
    }
})


// category item
app.get('/category/:cat', async (req, res) => {
    try {
        const id = req.params.cat;
        const query = { category: id }

        const bookings = await products.find(query).toArray()

        res.send({
            success: true,
            data: bookings,
            message: 'Successfully get data'
        })

    } catch (error) {
        res.send({
            success: false,
            error: error.message,
        })
    }
})

// // get booking
app.get('/sellerProduct', async (req, res) => {
    try {
        // const decodeeEmail = req.decoded.email;
        const email = req.query.email;

        // if (email !== decodeeEmail) {
        //     return res.status(403).send({ message: 'Forbidden access' })
        // }
        const query = { email: email }

        const bookings = await products.find(query).toArray()

        res.send({
            success: true,
            data: bookings,
            message: 'Successfully get data'
        })

    } catch (error) {
        res.send({
            success: false,
            error: error.message,
        })
    }
})

// booking post
app.put('/booking', async (req, res) => {
    try {
        const car = req.body;
        const result = await booking.insertOne(car);
        res.send({
            success: true,
            data: result,
            message: 'Successfully get data'
        })
    } catch (error) {
        res.send({
            success: false,
            error: error.message,
        })
    }
})

// booking get
app.get('/booking', async (req, res) => {
    try {
        const query = {}

        const result = await booking.find(query).toArray()

        res.send({
            success: true,
            data: result,
            message: 'Successfully get data'
        })
    } catch (error) {
        res.send({
            success: false,
            error: error.message,
        })
    }
})

// delete booking
app.delete('/booking/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const filter = { _id: ObjectId(id) }
        const query = await booking.deleteOne(filter);
        res.send({
            success: true,
            data: query,
            message: 'Successfully get data'
        })

    } catch (error) {
        res.send({
            success: false,
            error: error.message,
        })
    }
})

// single booking id
app.get('/booking/:id', async (req, res) => {
    try {
        const id = req.params.id
        const query = { _id: ObjectId(id) }

        const resust = await booking.findOne(query)

        res.send(resust)

    } catch (error) {
        res.send({
            success: false,
            error: error.message,
        })
    }
})




app.get('/', (req, res) => {
    res.send('car  server running')
})

app.listen(prot, () => {
    console.log('Car selling log');
})