// const mongoDb = require('mongodb');
// const { UPSERT } = require('sequelize/lib/query-types');
// const getDb = require('../util/database').getDb;

// class User{

//     constructor(name, email, cart, _id){
//         this.name = name;
//         this.email = email;
//         this.cart = cart;
//         this._id = _id;
//     }
    
//     getCart(){

//         const db = getDb();
//         const productIdArray = this.cart.items.map(i => {
//             return i.productId;
//         });

//         return db.collection('products').find({_id : { $in : productIdArray}}).toArray().then(products => {

//             return products.map(product => {

//                 return {
//                     ...product, 
//                     quantity : this.cart.items.find(i => {
//                         return i.productId.toString() === product._id.toString();
//                     }).quantity
//                 }

//             });
//         });
//     }

//     deleteCartProduct(productId){

//         const updatedCartItems = this.cart.items.filter(item => {
//             return item.productId.toString() !== productId.toString();
//         });

//         const db = getDb();

//         return db.collection('users').updateOne({_id : new mongoDb.ObjectId(this._id)}, {$set : {cart : {items : updatedCartItems}}});
//     }

//     addOrder(){

//         const db = getDb();

//         return this.getCart().then(products => {
//             const order = {
//                 items : products,
//                 user : {
//                     userId : this._id,
//                     name : this.name
//                 }
//             }
//             return db.collection('orders').insertOne(order);
//         }).then(result => {
//             this.cart = { items : [] };
//             return db.collection('users').updateOne({_id : new mongoDb.ObjectId(this._id)}, { $set : {cart : { items : [] }} });
//         }).catch(err => {
//             console.log(err);
//         });

//     }

//     addToCart(product){

//         const cartProductIndex = this.cart.items.findIndex(cp => {
//             return cp.productId.toString() == product._id.toString();
//         });
//         let newQuantity = 1;
//         const updatedCartItems = [...this.cart.items];
        
//         if(cartProductIndex >= 0){
//             newQuantity = updatedCartItems[cartProductIndex].quantity + 1;
//             updatedCartItems[cartProductIndex].quantity = newQuantity;
//         } else{
//             updatedCartItems.push({productId : new mongoDb.ObjectId(product._id), quantity : newQuantity});
//         }

//         const updatedCart = {
//             items : updatedCartItems
//         }

//         const db = getDb();

//         return db.collection('users').updateOne({_id : new mongoDb.ObjectId(this._id)}, {$set : {cart : updatedCart}});
//     }

//     getOrder(){

//         const db = getDb();
//         return db.collection('orders').find({'user.userId' : new mongoDb.ObjectId(this._id)}).toArray();

//     }

//     addUser(){
//         const db = getDb();
//         return db.collection('users').insertOne(this);
//     }

//     static findById(_id){
//         const db = getDb();
//         return db.collection('users').findOne({_id : new mongoDb.ObjectId(_id)});
//     }
// }

// module.exports = User;

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    resetToken : {
        type : String
    },
    resetTokenExpiraton : {
        type : String
    },
    cart : {
        items : [
            {
                productId : {type : Schema.Types.ObjectId, ref : 'Product', required : true}, quantity : {type : Number, required : true}
            }
        ]
    }
});

userSchema.methods.addToCart = function (productId) {

    const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === productId.toString();
    });

    console.log("Index is :" + cartProductIndex);

    if(cartProductIndex >= 0){
        this.cart.items[cartProductIndex].quantity = this.cart.items[cartProductIndex].quantity + 1;
    } else{
        this.cart.items.push({productId : productId, quantity : 1});
    }

    return this.save();
}

userSchema.methods.removeCartItem = function (productId){

    const updatedCartItems = this.cart.items.filter(cartItem => {
        return cartItem.productId.toString() !== productId.toString();
    });

    this.cart.items = updatedCartItems;

    return this.save();
}

userSchema.methods.clearCart = function (){

    this.cart = { items : [] };
    return this.save();
}

module.exports = mongoose.model('User', userSchema);