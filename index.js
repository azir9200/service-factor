const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
  ],
  credentials:true
}));
app.use(express.json());
app.use(cookieParser())

console.log(process.env.DB_USER);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xq1u8gq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const menuCollection = client.db("serviceFact").collection("menu");
    const reviewsCollection = client.db("serviceFact").collection("reviews");
    const cartCollection = client.db("serviceFact").collection("cart");    
    const userCollection = client.db("serviceFact").collection("user");
    


//  menu related
    app.get('/menu', async (req, res) => {
      const result = await menuCollection.find().toArray();
      res.send(result);
    })

    app.get('/reviews', async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    })

    app.get('/menu/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await menuCollection.findOne(query);
      res.send(result);
    })

//auth related api...
app.post('/jwt', async(req, res)=>{
  const user = req.body;
  console.log(user);
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})

  res.cookie('token', token,{
    httpOnly: true,
    secure: false,
    sameSite: 'none'
  })
  res.send({success: true});
})

// users related api...
app.post('/user', async (req, res) => {
  const user = req.body;
  const result = await userCollection.insertOne(user);
  res.send(result);
})

    // cart related api
    app.get('/cart', async (req, res) => {
      const result = await cartCollection.find().toArray();
      res.send(result);
    })

    app.post('/cart', async (req, res) => {
      const carts = req.body;
      console.log(carts);
      const result = await cartCollection.insertOne(carts);
      res.send(result);
    })

    app.put('/cart/:id', async(req, res)=>{
      const updateMenu = req.body;
      console.log(updateMenu);
    })

    app.delete('/cart/:id',  async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    })


    // Send a ping to confirm a successful connection;
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('factor is sitting')
})

app.listen(port, () => {
  console.log(`assignment files is sitting on port ${port}`);
})