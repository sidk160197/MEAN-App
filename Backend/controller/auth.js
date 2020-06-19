const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 12)
        .then(hashedPassword => {
            const user = new User({
                email: req.body.email,
                password: hashedPassword
            });
            return user.save();
        })
        .then(result => {
            res.status(201).json({
                message: 'User created!',
                result: result
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        })
}

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let fetchedUser;

    User.findOne({ email: email })
        .then(user => {
            if(!user) {
                return res.status(401).json({
                    message: 'No user found'
                });
            }
            fetchedUser = user;
            return bcrypt.compare(password, user.password);
        })
        .then(result => {
            if(!result) {
                return res.status(401).json({
                    message: 'Authentication failed'
                });
            }

            const token = jwt.sign({
                email: email,
                userId: fetchedUser._id
            }, process.env.JWT_KEY, {
                expiresIn: '1h'
            });

            res.status(200).json({
                token: token,
                expiresIn: 3600,
                userId: fetchedUser._id
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        })
}