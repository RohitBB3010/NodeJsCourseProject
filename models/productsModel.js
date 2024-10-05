// const getDb = require('../util/database').getDb;
// const mongoDb = require('mongodb');

// class Product{
//     constructor(title, price, imageUrl, description, _id, creatorId){
//         this.title = title;
//         this.price = price;
//         this.imageUrl = imageUrl;
//         this.description = description;
//         this._id = _id;
//         this.creatorId = creatorId;
//     }

//     save(){
//         const db = getDb();
//         let dbOp;
//         console.log(this._id);
//         if(this._id){
//             dbOp = db.collection('products').updateOne({_id : new mongoDb.ObjectId(this._id)}, {$set : this});
//         } else{
//             dbOp = db.collection('products').insertOne(this);
//         }
//         return dbOp.then(result => {
//             console.log(result);
//         }).catch(err => {
//             console.log(err);
//         })
//     }

//     static fetchAll(){

//         const db = getDb();
//         return db.collection('products').find().toArray().then(products => {
            
//             return products;
//         }).catch(err => {
//             console.log(err);
//         });
//     }

//     static fetchById(prodId) {

//         const sid = new mongoDb.ObjectId(prodId);
//         console.log(sid);

//         const db = getDb();
//         return db.collection('products').find({_id : new mongoDb.ObjectId(prodId)}).next().then(product => {
//             console.log(product);
//             return product;
//         }).catch(err => {
//             console.log(err);
//         });
//     }

//     static delete(prodId){

//         return getDb().collection('products').deleteOne({_id : new mongoDb.ObjectId(prodId)}).then(result => {
//             console.log(result);
//         }).catch(err => {
//             console.log(err);
//         });
//     }
// }

// module.exports = Product;
// // const Sequelize = require('sequelize');

// // const seq = require('../util/database');

// // const Product = seq.define('product', {
// //     id : {
// //         type : Sequelize.INTEGER,
// //         autoIncrement : true,
// //         allowNull : false,
// //         primaryKey : true,
// //     },
// //     title : Sequelize.STRING,
// //     price : {
// //         type : Sequelize.DOUBLE,
// //         allowNull : false,
// //     },
// //     description : {
// //         type : Sequelize.STRING,
// //         allowNull : false,
// //     },
// //     imageUrl : {
// //         type : Sequelize.STRING,
// //         allowNull : false
// //     }
// // });

// // module.exports = Product;

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    title : {
        type : String,
        required : true,
    },
    price : {
        type : Number,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    imageUrl : {
        type : String,
        required : true
    },
    creatorId : {
        type : Schema.Types.ObjectId,
        ref : 'User',
        required : true
    }
});

module.exports = mongoose.model('Product', productSchema);