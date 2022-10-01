const { express, db, mongodb } = require ('../../database/mongoDB');
const router = express.Router()
const collection = 'Customers';
const collectionMeta = 'meta_collections';
const DEFAULTSIZE = 20;

// Get Customers Data
router.get('/', function(req,res){
  console.log('customersController - get Customers Data');
  var size = DEFAULTSIZE;

  var attribute = req.query.meta;
  var operator = req.query.operator;
  var value = req.query.val;

  var pageNumber = req.query.pageNumber // Pagination
  if (req.query.size > 0) size = parseInt(req.query.size) // Max number of results
/*
  var filters = req.query.filters
  if (filters) {
    attribute = filters.meta
    console.log('attribute :', attribute);
    operator = filters.operator
    console.log('operator :', operator);
    value = filters.val
    console.log('value :', value);
  }
*/
  var filter = {}

  if (operator == 'equals') {
    filter = {[attribute]: value}
  };
  if (operator == 'contains') {
    var regExpression = new RegExp(value, 'i');
    filter = {[attribute]: regExpression}
  };

  console.log('size :', size);
  console.log('filter :', filter);
  console.log('attribute :', attribute);
  console.log('operator :', operator);
  console.log('value :', value);
  console.log('req.query :', req.query);

  var customers = db.collection(collection)
  customers.countDocuments(filter).then( (count) => {
    nb = count
    console.log('nb :', nb);
    if (pageNumber >= 1 && nb > size) { // Page number correct and #rows > #todisplay
      var skip = size * (pageNumber - 1)
      customers.find(filter).limit(size).skip(skip).toArray(function(err, data) {
        if(err) {
          res.status(500).send('Error during Customer Find : '+err)
        } else {
          result = {data, nb};
          //console.log('1/result : ', result);
          res.send(result);
        }
      })
    } else {
      customers.find(filter).limit(size).toArray(function(err, data) {
        //console.log('1/data : ', data);
        if(err) {
          res.status(500).send('Error during Customer Find : '+err)
        } else {
          result = {data, nb};
          //console.log('2/result : ', result);
          res.send(result);
        }
      })
    }
  });

})

// Get Customers Meta
router.get('/meta', (req, res) => {
  //var customersMeta = db.collection(collectionMeta)
  db.collection(collectionMeta).find({collectionName:collection}).toArray((err, docs) => {
    if(err) {
      res.status(500).json({
        success:false,
        message: err.message
      })
    }
    if (docs[0] != undefined) {
        res.send(docs[0].fields)
    } else {
      res.status(204).json({
        success:true,
        message: "No Content"
      })
    }
  })
})

// Modify customers Meta
router.put('/meta', (req, res) => {
  db.collection(collectionMeta).updateOne({collectionName: 'Customers'}, { $set: req.body }, function(error, result) {
    (error)? console.log(error) : res.status(200).send(result)
  })
})

// Insert one customers Meta
router.post('/meta', (req, res) => {
  // console.log('customersController.js : router.post meta')
  MongoClient.connect(uri, function(err, client)
  {
    if (err) console.log(err)
    var field = ''
    var object = {}
    for (const item in req.body) {
      field = "fields." + item
      object = req.body[item]
    }
    db.collection(collectionMeta).updateOne({collectionName: 'Customers'}, { $set: {[field]:object} }, function(error, result) {
      if (error) console.log(error)
      client.close() // Db close
      res.status(200).send(result)
    })
  })
})

// Create a Customer
router.post('/', (req,res) => {
  db.collection(collection).insertOne(req.body, (err, result) => {
    if (err) console.log('Error Create a Customer : '+err);
    res.status(201).send(result.insertedId)
  })
})

// Modify a customer
router.put('/', function(req,res){
  var idCustomer = req.body._id
  if (!idCustomer) res.status(400).send('Customer ID Unknown')
  delete(req.body._id)
  db.collection(collection).updateOne({_id: new mongodb.ObjectId(idCustomer)}, { $set: req.body }, function(err, result) {
    if(err) {
      res.status(500).send('Error during Customer Update')
    } else {
      res.status(200).send(result)
    }
  })
})

// Delete a customer
router.delete('/:id', (req, res) => {
  if (!req.params.id) res.status(400).send('Customer ID Unknown')
  db.collection(collection).deleteOne({_id: new mongodb.ObjectId(req.params.id)}, (error, result) => {
    (error)? console.log(error) : console.log('Successfully deleted :' + JSON.stringify(result))
    res.status(200).send('Customer deleted')
  })
})

// Get Customer by Id
router.get('/:id', (req, res) => {
  if (!req.params.id) res.status(400).send('Customer ID Unknown')
  MongoClient.connect(uri, function(err, client)
  {
    if (err) console.log('Error1 : ' + JSON.stringify(err))
    var customers = db.collection(collection)
      customers.findOne({_id: new mongodb.ObjectId(req.params.id)}).then( (feedback) => 
      {
        client.close() // Db close
        res.send(feedback)
      })
  })
})

module.exports = router