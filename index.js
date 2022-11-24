const express = require('express');
const cors = require('cors');
const prot = process.env.PROT || 5000;
require('dotenv').config();
const app = express();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');

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

// post user collection
app.post('/user',  async(req,res)=>{
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




app.get('/', (req, res) => {
    res.send('car  server running')
})

app.listen(prot, () => {
    console.log('Car selling log');
})