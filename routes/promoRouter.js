const express = require('express');
const bodyParser = require('body-parser');

const promoRouter = express.Router();
promoRouter.use(bodyParser.json())
promoRouter.route('/')
.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain')
    next()
})
.get((req,res,next) => {
    res.end('Will send all promotions to you!')
})
.post((req,res,next) => {
    res.end(`Will add the promotion: ${req.body.name} with details: ${req.body.description}`);
})
.put((req,res,next) => {
    res.statusCode = 403
    res.end('PUT operation is not supported on /promotions')
})
.delete((req,res,next) => {
    res.end('Deleting all the promotions!')
})
promoRouter.route('/:promotionId')
.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain')
    next()
})
.get((req,res,next) => {
    res.end(`Will send details of promotion: ${req.params.promotionId} to you!`)
})
.put((req,res,next) => {
    res.write(`Updating the promotion: ${req.params.promotionId}\n`)
    res.end(`Will update the promotion: ${req.body.name} with details: ${req.body.description}`)
})
.post((req,res,next) => {
    res.statusCode = 403
    res.end(`POST operation not on /promotions/${req.params.promotionId}`)
})
.delete((req,res,next) => {
    res.end(`Deleting promotion: ${req.params.promotionId}`)
})


module.exports = promoRouter