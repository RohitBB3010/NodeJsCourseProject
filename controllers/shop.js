const Product = require("../models/productsModel");
const Order = require("../models/orderModel");

exports.getProducts = (req, res, next) => {

  Product.find().then(products => {
    res.render('shop/product_list', {
      prods : products,
      pageTitle : 'All Products',
      path : '/products',
    });
  }).catch(err => {
    console.log(err);
  });

}

exports.getIndex = (req, res, next ) => {

  Product.find().then(products => {
    res.render('shop/index', {
      prods : products,
      pageTitle : 'Shop',
      path : '/',
    });
  }).catch(err => {
    console.log(err);
  });

}

exports.getCart = (req, res, next) => {
  res.render('shop/cart', {
    path : '/cart',
    pageTitle : 'Your cart'
  });
}

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path : '/checkout',
    pageTitle : 'Checkout',
  });
}

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  Product.findById(prodId).then(product => {
    res.render('shop/product_detail',{
      product : product,
      pageTitle : product.title,
      path : '/products',
  })
  }) 
}

exports.postCart = (req, res, next) => {

  const prodId = req.body.productId;

  req.user.addToCart(prodId).then(result => {
    res.redirect('/cart');
  }).catch(err => {
    console.log(err);
  });
  
};

exports.getCartProducts = (req, res, next) => {

  if(!req.user){
    res.redirect('/login');
  } else{
    req.user.populate('cart.items.productId').then(user => {

      const products = user.cart.items;
  
      res.render('shop/cart', {
        pageTitle : "Your Cart",
        path : '/cart',
        products : products,
      })
    }).catch(err => {
      console.log(err);
    })
  }

}

exports.deleteCartProduct = (req, res, next) => {

  const prodId = req.body.productId;

  console.log("Here");

  req.user.removeCartItem(prodId).then(result => {
    res.redirect('/cart');
  }).catch(err => {
    console.log(err);
  });

}

exports.postOrder = (req, res, next) => {

  req.user.populate('cart.items.productId').then(user => {

    const products = user.cart.items.map(item => {
      
      return { quantity : item.quantity, product : { ...item.productId._doc}}
    });

    console.log(products);

    const order = new Order({
      user : {
        name : req.user.name,
        userId : req.user._id
      },
      products : products
    });

    return order.save();
  }).then(result => {
    return req.user.clearCart();
  }).then(result => {
    res.redirect('/orders');
  }).catch(err => {
    console.log(err);
  });
  
}

exports.getOrders = (req, res, next) => {

  Order.find({'user.userId' : req.session.user._id}).then(orders => {
    res.render('shop/orders', {
      path : '/orders',
      pageTitle : 'Your Orders',
      orders : orders,
    });
  }).catch(err => {
    console.log(err);
  });

}