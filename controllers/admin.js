const Product = require("../models/productsModel");
const mongoDb = require('mongodb');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit_product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing : false,
    });
}

exports.addProduct = (req, res, next) => {

  const title = req.body.title;
  const description = req.body.description;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const creatorId = req.session.user._id;

  const product = new Product({
    title : title, price : price, imageUrl : imageUrl, description : description, creatorId : creatorId
  });

  product.save().then(result => {
    res.redirect('/admin/products');
  }).catch(err => {
    console.log(err);
  })
}

exports.getProducts = (req, res, next) => {
    Product.find({creatorId : req.user._id}).then(products => {

      res.render('admin/products', {
        prods : products,
        pageTitle : 'Admin Products',
        path : '/admin/products',
      });
    }).catch((err) => {
      console.log(err);
    });
}

exports.getEditProduct = (req, res, next) => {
  console.log("Here");
  const editMode = req.query.edit; 
  if(!editMode){
    res.redirect('/');
  }

  const productId = req.params.productId;

  Product.findById(productId).then(product => {
    if(!product){
      return res.redirect('404');
    }
    res.render('admin/edit_product', {
      pageTitle : 'Edit Product',
      path : '/admin/edit_product',
      editing : editMode,
      product : product,
    });
  }).then(result => {
    console.log('Product updated');
  }).catch(err => {
    console.log(err);
  });
}

exports.postEditProduct = (req, res, next) => {

  const prodId = req.body._id;

  Product.findById(prodId).then(product => {

    if(product.creatorId !== req.user._id){
      console.log("Not correct user");
      return res.redirect('/');
    }

    product.title = req.body.title;
    product.price = req.body.price;
    product.description = req.body.description;
    product.imageUrl = req.body.imageUrl;

    product.save().then(result => {
      res.redirect('/admin/products');
    }).catch(err => {
      console.log(err);
    });;
  })
}

exports.postDeleteProduct = (req, res, next) => {
  
  const id = req.body.productId;

  Product.deleteOne({_id : id, creatorId : req.user._id})
  .then(result => {
    console.log("Product deleted from database");
    res.redirect('/admin/products');
  }).catch(err => {
    console.log(err);
  });
}