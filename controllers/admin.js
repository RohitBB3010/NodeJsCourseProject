const Product = require("../models/productsModel");
const mongoDb = require('mongodb');
const { validationResult } = require('express-validator');

exports.getAddProduct = (req, res, next) => {

    res.render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing : false,
      errorMessage : null,
      validationErrors : []
    });
}

exports.addProduct = (req, res, next) => {

  console.log('Request received to add product');

  console.log(req.file);
  
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description; // Fixed typo here

  // Check if image exists
  if (!image) {
      return res.status(422).render('admin/edit-product', {
          pageTitle: 'Add Product',
          path: '/admin/add-product',
          editing: false,
          hasError: true,
          product: {
              title: title,
              price: price,
              description: description
          },
          errorMessage: 'Attached file is not an image.',
          validationErrors: []
      });
  }

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(422).render('admin/edit-product', {
          pageTitle: 'Add Product',
          path: '/admin/add-product',
          editing: false,
          hasError: true,
          product: {
              title: title,
              price: price,
              description: description
          },
          errorMessage: errors.array()[0].msg,
          validationErrors: errors.array()
      });
  }

  const imageUrl = image.path.replace(/\\/g, '/');

  const product = new Product({
      title: title,
      price: price,
      description: description,
      imageUrl: imageUrl,
      creatorId: req.user._id // Ensure userId is set correctly
  });

  product.save()
      .then(result => {
          console.log('Created Product');
          res.redirect('/admin/products');
      })
      .catch(err => {
          console.log(err); // Log the error
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
      });
}

// exports.addProduct = (req, res, next) => {

//   console.log("Adding product");

//   const title = req.body.title;
//   const imageUrl = req.body.imageUrl;
//   const price = req.body.price;
//   const description = req.body.description;

//   console.log(req.body.imageUrl);

//   const product = Product({
//     title : title,
//     price : price,
//     imageUrl : imageUrl,
//     description : description,
//     creatorId : req.user._id,
//   });

//   product.save().then(result => {
//     console.log("Added product");
//     res.redirect('/admin/add-product');
//   }).catch(err => {
//     console.log(err);
//   })
// }

exports.getProducts = (req, res, next) => {
    Product.find({creatorId : req.user._id}).then(products => {

      res.render('admin/products', {
        prods : products,
        pageTitle : 'Admin Products',
        path : '/admin/products',
      });
    }).catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}

exports.getEditProduct = (req, res, next) => {

  const editMode = req.query.edit; 
  if(!editMode){
    res.redirect('/');
  }

  const productId = req.params.productId;

  Product.findById(productId).then(product => {
    if(!product){
      return res.redirect('404');
    }
    res.render('admin/edit-product', {
      pageTitle : 'Edit Product',
      path : '/admin/edit_product',
      editing : editMode,
      product : product,
      errorMessage : null,
      validationErrors : [],
    });
  }).then(result => {
    console.log('Product updated');
  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
}

exports.postEditProduct = (req, res, next) => {

  const prodId = req.body._id;

  Product.findById(prodId).then(product => {

    if(product.creatorId.toString() !== req.user._id.toString()){
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
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
  })
}

exports.postDeleteProduct = (req, res, next) => {
  
  const id = req.body.productId;

  Product.deleteOne({_id : id, creatorId : req.user._id})
  .then(result => {
    console.log("Product deleted from database");
    res.redirect('/admin/products');
  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
}