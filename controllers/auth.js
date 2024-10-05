
const User = require('../models/userModel');
const bcryptJs = require('bcrypt');
const crypto = require('crypto');
const sendGrid = require('@sendgrid/mail');
const { validationResult } = require('express-validator');

sendGrid.setApiKey(
    process.env.SENDGRID_API_KEY
);

exports.getLogin = (req, res, next) => {

    let errorMessage = req.flash('error');

    console.log(errorMessage);
    
    if(errorMessage.length > 0){
        errorMessage = errorMessage[0];
    } else{
        errorMessage = null;
    }

    res.render('auth/login', {
        path : '/login',
        pageTitle : 'Login Page',
        errorMessage : errorMessage,
        oldInput : {
            email : '',
            password : ''
        }
    });
}

exports.postLogin = (req, res, next) => {

    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);

    if(!errors.isEmpty()){

        return res.status(422).render('auth/login', {
            pageTitle : 'Login',
            path : '/login',
            errorMessage : errors.array()[0].msg,
            oldInput : {
                email : email,
                password : password
            }
        });
    }

    User.findOne({email : email}).then(user => {
        if(!user){
            res.render('auth/login', {
                path : '/login',
                pageTitle : "Login",
                errorMessage : 'Invalid Email or password',
                oldInput : {
                    email : email,
                    password : password
                }
            })
        }

        bcryptJs.compare(password, user.password).then(doesMatch => {

            if(doesMatch){
                req.session.isLoggedIn = true;
                req.session.user = user;
                return req.session.save(err => {
                    console.log(err);
                    res.redirect('/');
                })
            }

            req.flash('error', 'Incorrect password');
            res.redirect('/login');
        }).catch(err => {
        console.log(err);
    });
    })
}

exports.postSignUp = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).render('auth/signup', {
            path : '/signup',
            pageTitle : 'SignUp',
            errorMessage : errors.array()[0].msg,
            oldInput : {
                email : email,
                password : password,
                confirmPassword : confirmPassword,
            }
        })
    }

    return bcryptJs.hash(password, 12).then(hashedPassword => {

        const user = User({
            name : 'Rohit',
            email : email,
            password : hashedPassword,
            cart : {items : []},
        });

        return user.save();
    }).then(result => {
        res.redirect('/login');

        const msg = {
            to : email,
            from : 'obsessedquill@gmail.com',
            Subject : 'Signup succeeded',
            html : '<h2> You have signed up successfully </h2>'
        }

        sendGrid.send(msg, (err, info) => {
            if(err) {
                console.log(err);
            } else{
                console.log('Email sent');
            }
        });
    }).catch(err => {
        console.log(err);
    });
};

exports.getSignUp = (req, res, next) => {

    let errorMessage = req.flash('error');

    if(errorMessage.length > 0){
        errorMessage = errorMessage[0];
    } else{
        errorMessage = null;
    }

    res.render('auth/signup', {
        pageTitle : 'SignUp',
        path : '/signup',
        errorMessage : errorMessage,
        oldInput : {
            email : "",
            password : "",
            confirmPassword : "",
        }
    });
}

exports.postLogout = (req, res, next) => {

    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    })
}

exports.getResetPassword = (req, res, next) => {

    let errorMessage = req.flash('error');

    if(errorMessage.length > 0){
        errorMessage = errorMessage[0];
    } else{
        errorMessage = null;
    }

    res.render('auth/reset', {
        pageTitle : 'Reset Password',
        path : '/reset',
        errorMessage : errorMessage
    });
}

exports.postResetPassword = (req, res, next) => {

    const email = req.body.email;

    crypto.randomBytes(32, (err, buffer) => {
        if(err){
            console.log(err);
            return res.redirect('/reset');
        }

        const token = buffer.toString('hex');

        User.findOne({email : email}).then(user => {
            
            if(!user){

                req.flash('error', 'No user found with this email address');
                return res.redirect('/reset');
            }

            console.log(token);
            user.resetToken = token;
            user.resetTokenExpiraton = Date.now() + 3600000;
            return user.save();
        }).then(result => {
            res.redirect('/');
            const msg = {
                to : email,
                from : 'obsessedquill@gmail.com',
                subject : 'Reset password link',
                html : 
                ` <p> Below is your reset password link </p>
                <p> Click the link <a href = "http://localhost:3000/reset/${token}"> link </a> to reset password </p>`  
            }

            sendGrid.send(msg, (err, info) => {
                if(err){
                    console.log(err);
                } else{
                    console.log("Email sent");
                }
            });
        });
    })
}

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;

    User.findOne(({resetToken : token, resetTokenExpiraton : {$gt : Date.now()}})).then(user => {
        let message = req.flash('error');
        if(message.length > 0){
            message = message[0];
        } else{
            message = null;
        }

        console.log(user);

        res.render('auth/new-password', {
            path : '/new-password',
            pageTitle : "Set new password",
            errorMessage : message,
            userId : user._id.toString(),
            passwordToken : token,
        })
    }).catch(err => {
        console.log(err);
    });
}

exports.postNewPassword = (req, res, next) => {
    const userId = req.body.userId;
    const password = req.body.password;
    const passwordToken = req.body.passwordToken;
    let resetUser;

    User.findOne({_id : userId}).then(user => {

        resetUser = user;

        return bcryptJs.hash(password, 12);
        
    }).then(hashedPassword => {

        resetUser.password = hashedPassword;
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpiraton = undefined;
        return resetUser.save();
    }).then(result => {
        res.redirect('/login');
    }).catch(err => {
        console.log(err);
    })
}