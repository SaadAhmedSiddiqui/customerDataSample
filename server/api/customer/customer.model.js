'use strict';
/*eslint no-invalid-this:0*/
import crypto from 'crypto';
mongoose.Promise = require('bluebird');
import mongoose, {Schema} from 'mongoose';

var discOptions = {discriminatorKey: 'user_type'};
var customerSchema = new Schema({
  CCID                : String,
  expiry_date         : Date
}, discOptions);

mongoose.model('User').discriminator('Customer', customerSchema);           // defines like mongoose.model('Customer')

export default mongoose.model('Customer');
