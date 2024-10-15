const Product = require("../models/productsModel");
const Order = require("../models/orderModel");
const pdfDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const ITEMS_PER_PAGE = 1;

exports.getProducts = (req, res, next) => {

  const page = +req.query.page || 1;

  Product.find().countDocuments().then(numProducts => {
    const totalItems = numProducts;
    return Product.find().skip((page-1)*ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE).then(products => {
      res.render('shop/product-list', {
        prods : products,
        pageTitle : 'All Products',
        path :'/products',
        currentPage : page,
        hasNextPage : ITEMS_PER_PAGE*page < totalItems,
        hasPreviousPage : page > 1,
        nextPage : page+1,
        previousPage : page-1,
        lastPage : Math.ceil(totalItems/ITEMS_PER_PAGE)
      });
    }).catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
  })
}

exports.getIndex = (req, res, next ) => {

  // Product.find().then(products => {
  //   res.render('shop/index', {
  //     prods : products,
  //     pageTitle : 'Shop',
  //     path : '/',
  //   });
  // }).catch(err => {
  //   const error = new Error(err);
  //   error.httpStatusCode = 500;
  //   return next(error);
  // });

  const page = +req.query.page || 1;

  Product.find().countDocuments().then(numProducts => {
    const totalItems = numProducts;
    return Product.find().skip((page-1)*ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE).then(products => {
      res.render('shop/index', {
        prods : products,
        pageTitle : 'Shop',
        path :'/',
        currentPage : page,
        hasNextPage : ITEMS_PER_PAGE*page < totalItems,
        hasPreviousPage : page > 1,
        nextPage : page+1,
        previousPage : page-1,
        lastPage : Math.ceil(totalItems/ITEMS_PER_PAGE)
      });
    }).catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
  })
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
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
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
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
  }

}

exports.deleteCartProduct = (req, res, next) => {

  const prodId = req.body.productId;

  console.log("Here");

  req.user.removeCartItem(prodId).then(result => {
    res.redirect('/cart');
  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
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
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
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
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
}

exports.getInvoice = (req, res, next) => {

  const orderId = req.params.orderId;

  Order.findById(orderId).then(order => {

    if(!order){
      return next(new Error('No order found'));
    }

    if(order.user.userId.toString() !== req.user._id.toString()){
      return next(new Error('Unauthorized access'));
    }

    const invoiceName = 'invoice' + orderId + '.pdf';
    const invoicePath = path.join('data','invoices', invoiceName);

    const pdfDoc = new pdfDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename = "' + invoiceName + '"');
    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);

    pdfDoc.fontSize(24).text('Invoice', {
      underline:true
    });
    pdfDoc.text('---------');
    let totalPrice = 0;
    order.products.forEach(prod => {
      totalPrice += prod.quantity * prod.product.price;
      pdfDoc
          .fontSize(14)
          .text(
            prod.product.title +
              ' - ' +
              prod.quantity +
              ' x ' +
              '$' +
              prod.product.price
          );
    });
    pdfDoc.text('---');
    pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);
    pdfDoc.end();
  }).catch(err => {
    console.log(err);
  });
}