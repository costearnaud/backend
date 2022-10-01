const { express, db } = require ('../../database/mongoDB');
const router = express.Router()
const collectionMeta = 'meta_collections';

// Create Collection
router.post('/:name', (req,res) => {
    console.log('createCollection');
    db.createCollection(req.params.name, (err, coll) => {
        (err && err.codeName === "NamespaceExists")? res.send("AE") : res.send(coll.data);
    });
    
})

// Get Collection list
router.get('/', (req,res) => {
    console.log('get Collection list');
    db.listCollections().toArray((err, collInfos) => {
        res.send(collInfos);
    });
})

// Search Collections
router.get('/:name', (req,res) => {
    console.log('get Collection search');
    try {
        var string = req.params.name;
        db.listCollections({"name": {$regex: ".*" + string + ".*"}}).toArray((err, collections) => {
            //console.log(collections);
            res.send(collections);
        });
    } catch(err) {
        console.log(err);
    }
})

// Get one Collection infos
router.get('/infos/:name', (req,res) => {
    console.log('get Collection infos');
    try {
        var customersMeta = db.collection(collectionMeta);
        customersMeta.find({"collectionName":req.params.name}).toArray((err, docs) => {
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
        });
/*
        var string = req.params.name;
        console.log('name : ', string);
        db.listCollections({"name": string}).toArray((err, collection) => {
            console.log('collection : ',collection);
            res.send(collection);
        });
*/

/* TIPS a retenir
var name = req.params.name;
var value = req.params.value;
var query = {};
query[name] = value;
collection.findOne(query, function (err, item) { ... });
*/

    } catch(err) {
        console.log(err);
    }
})

// Rename one field in Collection Meta
router.post('/meta/rename', (req, res) => {
    console.log('post meta rename');
    var entity = "fields."+req.body.field+".label"
    var query = {[entity]:req.body.label};
    console.log('query : ', query);
    var collection = req.body.collection
    
    db.collection(collectionMeta).updateOne({collectionName: collection}, { $set: query }, function(error, result) {
      (error)? console.log(error) : res.status(200).send(result)
    })
})

// Delete one field in Collection Meta
router.post('/meta/delete', (req, res) => {
    console.log('post meta delete');
    var entity = "fields."+req.body.field
    var query = {[entity]: ""};
    console.log('query : ', query);
    var collection = req.body.collection
    
    db.collection(collectionMeta).updateOne({collectionName: collection}, { $unset: query }, function(error, result) {
      (error)? console.log(error) : res.status(200).send(result)
    })
})

// Add one field in Collection Meta
router.post('/meta/add', (req, res) => {
    console.log('post meta add');
    var fieldName = "fields."+req.body.field
    var label = req.body.label
    var type = req.body.type
    var group = req.body.group
    var required = req.body.required
    var query = {
        [fieldName]: {
            "label": label,
            "type": type,
            "levelup": group,
            "required": required
        }
    };
    console.log('query : ', query);
    var collection = req.body.collection
    
    db.collection(collectionMeta).updateOne({collectionName: collection}, { $set: query }, function(error, result) {
      (error)? console.log(error) : res.status(200).send(result)
    })
  })

// Delete a Collection
router.delete('/:name', (req,res) => {
    console.log('deleteCollection : '+req.params.name);
    var collToDelete = db.collection(req.params.name);
    collToDelete.drop((err,result) => {
        //console.log('result : '+result);
        if (err) {
            console.log('Collection deletion error : '+err);
        }
        else {
            console.log('Collection '+ req.params.name +' has been removed successfully');
            res.send(result);
        }
    });
})

module.exports = router