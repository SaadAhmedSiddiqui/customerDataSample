'use strict';

import Customer from './customer.model';
import config from '../../config/environment';
import jwt from 'jsonwebtoken';

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function (err) {
    return res.status(statusCode).json(err);
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    return res.status(statusCode).send(err);
  };
}

/**
 * Get list of customer
 */
export function index(req, res) {
  return Customer.find({user_type: 'user_type'}, '-salt -password').exec()
    .then(customers => {
      res.status(200).json(customers);
    })
    .catch(handleError(res));
}

/**
 * Creates a new customer
 */
export function create(req, res) {
  var newCustomer = new Customer(req.body);
  newCustomer.provider = 'local';
  newCustomer.role = 'customer';
  console.log(req.body);
  newCustomer.save()
    .then(function(customer) {
      /*var token = jwt.sign({ _id: customer._id }, config.secrets.session, {
        expiresIn: 60 * 60 * 5
      });*/
      res.json(customer);
    })
    .catch(validationError(res));
}

/**
 * Get a single customer
 */
export function show(req, res, next) {
  var customerId = req.params.id;

  return Customer.findById(customerId).exec()
    .then(customer => {
      if(!customer) {
        return res.status(404).end();
      }
      res.json(customer.profile);
    })
    .catch(err => next(err));
}

/**
 * Deletes a customer
 * restriction: 'admin'
 */
export function destroy(req, res) {
  return Customer.findByIdAndRemove(req.params.id).exec()
    .then(function() {
      res.status(204).end();
    })
    .catch(handleError(res));
}

/**
 * Change a customers password
 */
export function changePassword(req, res) {
  var customerId = req.customer._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  return Customer.findById(customerId).exec()
    .then(customer => {
      if(customer.authenticate(oldPass)) {
        customer.password = newPass;
        return customer.save()
          .then(() => {
            res.status(204).end();
          })
          .catch(validationError(res));
      } else {
        return res.status(403).end();
      }
    });
}

/**
 * Get my info
 */
export function me(req, res, next) {
  var customerId = req.customer._id;

  return Customer.findOne({ _id: customerId }, '-salt -password').exec()
    .then(customer => { // don't ever give out the password or salt
      if(!customer) {
        return res.status(401).end();
      }
      res.json(customer);
    })
    .catch(err => next(err));
}

/**
 * Authentication callback
 */
export function authCallback(req, res) {
  res.redirect('/');
}
