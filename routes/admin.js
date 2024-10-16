const path = require('path');

const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/isAuth');

const router = express.Router();

router.get('/add-product', isAuth,adminController.getAddProduct);

// router.post('/add-product', [
//     body('title').isString().isLength({ min : 3}).trim(),
//     body('price').isFloat(),
//     body('description').isLength({ min : 5, max : 400}).trim()
// ],isAuth,adminController.addProduct);

router.post('/add-product', isAuth, adminController.addProduct);

router.get('/products', isAuth, adminController.getProducts);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product', isAuth, adminController.postEditProduct);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
