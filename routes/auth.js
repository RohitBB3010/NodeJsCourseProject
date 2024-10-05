const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth');
const User = require('../models/userModel');

router.get('/login', authController.getLogin);

router.post('/login', [
    body('email').isEmail().withMessage('The Email is not valid'),
    body('password', 'Please enter a password with only letters and numbers and atleast 5 characters long').isAlphanumeric().isLength({ min : 5}).custom((value, {req}) => {

        return User.findOne({email : value}).then(userDoc => {
            if(!userDoc){
                return Promise.reject('Account with this email does not exist');
            }

            return true;
        })
    }),
],authController.postLogin);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignUp);

router.post('/signup', [
    body('email').isEmail().withMessage('The email is not valid').custom((value, {req}) => {
        return User.findOne({email : value}).then(userDoc => {
            if(userDoc) {
                return Promise.reject('Email exists already');
            }
        })
    }),
    body('password', 'Please enter a password with only letters and numbers and atleast 5 characters long').isAlphanumeric().isLength({ min : 5}),
    body('confirmPassword').custom((value, {req}) => {
        if(value !== req.body.password){
            throw new Error('Passwords do not match');
        }
        return true;
    })
],authController.postSignUp);

router.get('/reset', authController.getResetPassword);

router.post('/reset', authController.postResetPassword);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;