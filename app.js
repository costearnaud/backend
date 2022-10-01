// Requiring module
const express = require('express');

// Creating express object
const app = express();

// CORS Security
const cors = require('cors')

// .env automatic
require('dotenv').config()

app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: true}))

//const { db, mongodb } = require ('./database/mongoDB');
/*
const collection = 'Customers';
var nb = 0;
var customers = db.collection(collection)
customers.countDocuments().then( (count) => {
	nb = count;
});
*/
const DATABASE = 'DreamDb'
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
const uri = process.env.MONGODB_URI
const client = new MongoClient(uri)
const db = client.db(DATABASE)
var statut = 'N/A'

// Handling GET request
app.get('/', async (req, res) => {
	try {
		// Establish and verify connection
		await client.connect();
		await db.command({ ping: 1 });
		statut = 'OK';
		console.log("mongoDB - Connected successfully to server");
	  } catch(err) {
		statut = 'KO => Error : '+err;
		console.log("Connection KO : ", err);
		setTimeout(() => { run(); }, 2000); // relance 2s après
	  }
	res.send('NodeJS OK, Database MongoDB '+statut)
	res.end()
})

// Port Number
const PORT = process.env.PORT ||5000;

// Server Setup
app.listen(PORT,console.log(`Server started on port ${PORT}`));
