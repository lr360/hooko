var express = require('express');
var expressErr = require('express-err');
var Bundle = require('../../../models/bundle');
var Promise = require('bluebird');

/**
 * Create and expose router.
 */

var router = module.exports = express.Router();

// Attach req.bundle to every request.
router.param('bundle', function (req, res, next, bundle) {
  Bundle.findOne({name: bundle}).select('hooks').exec()
  .then(function (bundle) {
    if (!bundle) next(expressErr.httpError(400, 'Bundle not found'));
    req.bundle = bundle;
    next();
  }, next);
});

// list
router.get('/:bundle/hooks', function (req, res) {
  res.send(req.bundle.hooks);
});

// create
router.post('/:bundle/hooks', function (req, res, next) {
  req.bundle.hooks.push(req.body);
  Promise.promisify(req.bundle.save.bind(req.bundle))()
  .then(function (bundles) {
    res.status(201).send(bundles[0].hooks);
  }, next);
});

// update
router.patch('/:bundle/hooks/:id', function (req, res, next) {
  var hook = req.bundle.hooks.id(req.params.id);
  if (!hook) return next(expressErr.httpError(400, 'Hook not found'));
  hook.set(req.body);
  Promise.promisify(req.bundle.save.bind(req.bundle))()
  .then(function () {
    res.send(hook);
  }, next);
});

// destroy
router.delete('/:bundle/hooks/:id', function(req, res, next) {
  var hook = req.bundle.hooks.id(req.params.id);
  if (!hook) return res.send();
  hook.remove();
  Promise.promisify(req.bundle.save.bind(req.bundle))()
  .then(function () {
    res.send();
  }, next);
});