const express = require('express');
const bodyParser = require('body-parser');
var authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json())

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => {
        Favorites.findOne({user: req.user._id})
            .populate('user')
            .populate('dishes')
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err))
            .catch((err) => { next(err) })
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({user: req.user._id})
        .then((favorite) => {
            if(favorite == null) {
                Favorites.create({ user: req.user._id})
                .then((favorite) => {
                    for(var dish = 0; dish < req.body.length; dish++)
                        favorite.dishes.push(req.body[dish]);
                    favorite.save()
                    .then((favorite) => {
                        console.log('favorite added ', favorite);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                    .catch((err) => next(err));
                }) 
                .catch((err) => next(err));
            }
            else {
                for(var dish = 0; dish < req.body.length; dish++) {
                    if(favorite.dishes.indexOf(req.body[dish]._id) < 0) {
                        favorite.dishes.push(req.body[dish]);
                    }
                } 
                favorite.save()
                .then((favorite) => {
                    console.log('favorite added ', favorite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch((err) => next(err));
            }
        })
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403
        res.end('PUT operation is not supported on /favorites')
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser,(req, res, next) => {
        Favorites.findOneAndRemove({user: req.user._id})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    })


favoriteRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({user: req.user._id})
        .then((favorite) => {
            if (favorite != null) {
                if(favorite.dishes.indexOf(req.params.dishId) < 0) {
                    favorite.dishes.push(req.params.dishId);
                }
                favorite.save()
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch((err) => next(err));
            } else {
                Favorites.create({ user: req.user._id})
                .then((favorite) => {
                    favorite.dishes.push(req.params.dishId);
                    favorite.save()
                    .then((favorite) => {
                        console.log('favorite added ', favorite);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    },
                    (err) => next(err))
                })
                .catch((err) => next(err));
            }
        })
    })

    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({user: req.user._id})
            .then((favorite) => {
                const index = favorite.dishes.findIndex( dish => dish._id == req.params.dishId.toString())
                if(index != -1) {
                    favorite.dishes.splice(index,1)
                    favorite.save()
                    .then((favorite) => {
                        console.log('favorite removed ', favorite);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                } else {
                    err = new Error('Dish ' + req.params.dishId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })

module.exports = favoriteRouter