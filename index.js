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

const { db, client } = require ('./database/mongoDB');
/*
const collection = 'Customers';
var nb = 0;
var customers = db.collection(collection)
customers.countDocuments().then( (count) => {
	nb = count;
});
*/
var statut = 'N/A'

const collectionsRoutes = require('./routes/api/collectionsController')
app.use('/api/collections', collectionsRoutes)

const customersRoutes = require('./routes/api/customersController')
app.use('/api/customers', customersRoutes)

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
	res.send('NodeJS OK et Database MongoDB '+statut)
	res.end()
})

// Handling GET request
app.get('/home', async (req, res) => {
	res.send('HOME');
	res.end();
});

// Handle production
if (process.env.NODE_ENV === 'production') {
	// Static folder
	app.use(express.static(__dirname + '/public/'));

	// Handle SPA
	app.get(/.*/, (req, res) => res.sendFile(__dirname + '/public/index.html'));
}

// Port Number
const PORT = process.env.PORT ||5000;

// Server Setup
app.listen(PORT,console.log(`Server started on port ${PORT}`));
