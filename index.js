const express = require('express');
const cors = require('cors');
const prot = process.env.PROT || 5000;
require('dotenv').config();
const app = express();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//middleware
app.use(cors());
app.use(express.json());



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

// post user collection
app.put('/user',  async(req,res)=>{
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
app.get('/user',  async(req,res)=>{
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

// post user collection
app.post('/addProduct',  async(req,res)=>{
    try {
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
app.get('/addProduct',  async(req,res)=>{
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

// single product item
app.get('/addProduct/:id', async (req, res) => {
    try {
        const id = req.params.id
        const query = {_id:ObjectId(id)}

        const resust = await products.findOne(query)

        res.send(resust)

    } catch (error) {
        res.send({
            success: false,
            error: error.message,
        })
    }
})

// put advidser
app.put('/addProduct/:id', async (req,res)=>{
    try {
        // const decodedEmail =req.decoded.email;
        // const query ={email:decodedEmail};
        // const usersAdmin = await user.findOne(query)
        // if(usersAdmin?.role !== 'admin'){
        //     return res.status(403).send({message:'Forbidden access'})
        // }


        const id = req.params.id;
        const filter = {_id:ObjectId(id)};
     
        const option = {upsert : true};
        const updateId = {
            $set:{
                publish: true
            }
        }
        const result = await products.updateOne(filter,updateId,option)
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

// delete doctor
app.delete('/addProduct/:id',  async(req,res)=>{
    try {
        const id =req.params.id;
        const filter = {_id:ObjectId(id)}
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
app.get('/addProduct/:email', async (req, res) => {
    try {
        const id = req.params.email
        const query = {category:(id)}

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
app.get('/addProduct',  async (req, res) => {
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
app.put('/booking',  async(req,res)=>{
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
// 

app.get('/', (req, res) => {
    res.send('car  server running')
})

app.listen(prot, () => {
    console.log('Car selling log');
})