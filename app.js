const express = require('express')
const { ObjectId } = require('mongodb')
const { connectToDb, getDb } = require('./db')
var bodyParser = require('body-parser');

//init app and middleware
const app = express()
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
//db connection
let db
connectToDb((err) => {
    if (!err) {
        app.listen(3000, () => {
            console.log('App is listening on port 3000')
        })
        db = getDb()
    }
})


//routes
app.get('/books', (req,res) => {
    let books = []
    db.collection('books')
        .find()
        .sort( {author: 1})
        .forEach(book => books.push(book))
        .then(()=> {
            res.status(200).json(books)
        })
        .catch(()=> {
            res.status(500).json({error: 'could not fetch the documents'})
        })
})

app.get('/books/:id', (req,res) => {
    const objectId = new ObjectId(req.params.id)
    db.collection('books')
        .findOne({_id: objectId})
        .then(doc => {
            res.status(200).json(doc)
        })
        .catch(err => {
            res.status(500).json({error: 'Could not fetch the document'})
        })
})

app.post('/books', (req,res) => {
    const book = req.body
    console.log('book',book)
    db.collection('books')
        .insertOne(book)
        .then(result => {
            res.status(201).json(result)
        })
        .catch(err => {
            res.status(500).json({err: 'Could not create a new document'})
        })
})

app.delete('/books/:id', (req,res) => {
    if (ObjectId.isValid(req.params.id)) {
         const objectId = new ObjectId(req.params.id)
         db.collection('books')
            .deleteOne({_id : objectId})
            .then(result => {
                res.status(200).json(result)
            })
            .catch(err => {
                res.status(500).json({error: "Not a valid doc id"})
            })
    }
})

app.patch('/books/:id', (req,res) => {
    const updates = req.body
    if (ObjectId.isValid(req.params.id)) {
        const objectId = new ObjectId(req.params.id)
        db.collection('books')
           .updateOne({_id : objectId}, {$set: updates})
           .then(result => {
               res.status(200).json(result)
           })
           .catch(err => {
               res.status(500).json({error: "Could not delete"})
           })
   }
})