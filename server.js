const express = require('express')
const app = express()
const mongoClient = require('mongodb').MongoClient
require('dotenv').config()
const PORT =2121

let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'todo'

mongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    .then(client=>{
        console.log(`connected to ${dbName} Database`)
        db = client.db(dbName)
    })

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.get('/', async (request,response)=>{
    const todoItems = await db.collection('list').find().toArray()
    const itemsLeft = await db.collection('list').countDocuments({completed: false})
    response.render('index.ejs', {items: todoItems, left: itemsLeft})
})

app.post('/addTodo', (request,response)=>{
    db.collection('list').insertOne({ task: request.body.todoItem, completed: false})
    .then(result=>{
        console.log('task added')
        response.redirect('/')
    })
    .catch(error => console.log(error))
})

app.put('/markComplete', (request,response)=>{
    db.collection('list').updateOne({task: request.body.itemFromJS},{
        $set: {
            completed: true
        }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result =>{
        console.log('task completed')
        response.json('task completed')
    })
    .catch(error => console.log(error))

})

app.put('/markUncomplete' ,(request,response)=>{
    db.collection('list').updateOne({task: request.body.itemFromJS},{
        $set: {
            completed: false
        }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result=>{
        console.log('marked uncomplete')
        response.json('marked uncomplete')
    })
    .catch(error=> console.log(error))
    })





app.delete('/deleteItem', (request,response)=>{
    db.collection('list').deleteOne({task: request.body.itemFromJS})
    .then(result=>{
        console.log('task deleted')
        response.json('task deleted')
    })
    .catch(error => console.log(error))
})


app.listen(process.env.PORT || PORT ,()=>{
    console.log(`connected to ${PORT} server`)
})