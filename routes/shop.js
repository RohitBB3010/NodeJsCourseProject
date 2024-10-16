const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/isAuth');
const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/cart', isAuth, shopController.getCartProducts);

// // router.get('/checkout', shopController.getCheckout);

router.get('/orders', isAuth, shopController.getOrders);

router.get('/products/:productId', shopController.getProduct);

router.post('/cart', isAuth, shopController.postCart);

router.post('/cart-delete-item', isAuth, shopController.deleteCartProduct);

router.post('/create-order', isAuth, shopController.postOrder);

router.get('/orders/:orderId', isAuth, shopController.getInvoice);

module.exports = router;
