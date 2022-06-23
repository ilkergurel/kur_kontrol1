const mongodb = require('mongodb')
const mongodbClient = mongodb.MongoClient


const mongoURL = process.env.MONGO_URL || 'mongodb://db:27017/kurlar'
//const mongoURL = process.env.MONGO_URL || 'mongodb://localhost:27017/kurlar'


let _db

const mongoConnect = (callback) => {
    mongodbClient.connect(mongoURL)
    .then(client => {
        console.log('MongoDB connected')
        _db = client.db()
        callback()
    })
    .catch(err => {
        console.log(err)
        throw err
    })
}

const getDb = () => {
    if (_db) {
        return _db
    }
    throw 'No database found'
}

/*
const initMongo = async () => {
    console.log('Initialising MongoDB...')
    console.log("Connection url => ", mongoURL);
    let success = false
    while (!success) {
      try {
        client = await MongodbClient.connect(mongoURL, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        })
        success = true
      } catch {
        console.log('Error connecting to MongoDB, retrying in 1 second')
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    console.log('MongoDB initialised')
    return client.db(client.s.options.dbName).collection('kurlar')
}

exports.retrieveNotes = async (db) => {
    const db_content = (await db.find().toArray()).reverse()
    return db_content
}

exports.saveNote = async (db, content) => {
    await db.insertOne(content)
}
*/


exports.mongoConnect = mongoConnect
exports.getDb = getDb
//exports.initMongo = initMongo

