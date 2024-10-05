

// const Sequelize = require('sequelize');

// const seq = new Sequelize('nodejsproduct', 'root', 'Rohit123@', {
//     dialect : 'mysql',
//     host : 'localhost',
//     logging : false
// });

// seq.authenticate()
//   .then(() => {
//     console.log('Connection has been established successfully.');
//   })
//   .catch(err => {
//     console.error('Unable to connect to the database:', err);
//   });

// module.exports = seq;

const mongoDb = require('mongodb');
const mongoClient = mongoDb.MongoClient;

let _db;

const mongoConnect = (callback) => {
  mongoClient.connect('mongodb+srv://rohit:Rohit123%40@cluster0.ha5sq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0').then(client => {
    _db = client.db('shop');
    callback();
  }).catch(err => {
    console.log(err);
  }); 
}

const getDb = () => {
  if(_db){
    return _db;
  } else{
    throw 'No database found';
  }
} 

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;