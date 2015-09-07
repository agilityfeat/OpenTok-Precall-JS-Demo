var crypto = require('crypto');
var querystring = require('querystring');
var timestamp = require('unix-timestamp');
var nonce = require('nonce')();
var _ = require('lodash');

/**
 * @constant {string}
 * @private
 */
var TOKEN_SENTINEL = 'T1==';

/**
 * @typedef {Object} TokenData
 * @property {string} [session_id] An OpenTok Session ID
 * @property {number} [create_time] Creation time of token as unix timestamp (Default: now)
 * @property {number} [expire_time] Expiration time of token as unix timestamp (Default: one day
 * from now)
 * @property {number} [nonce] Arbitrary number used only once in a cryptographic communication
 * (Default: unique random number)
 * @property {string} [role='publisher'] "publisher" or "subscriber" "moderator"
 * @property {string} [connection_data] Arbitrary data to be made available in clients on the OpenTok Connection
 */


/**
 * Encodes data for use as a token that can be used as the X-TB-TOKEN-AUTH header value in OpenTok REST APIs
 *
 * @exports opentok-token
 *
 * @param {TokenData} tokenData
 * @param {string} apiKey An OpenTok API Key
 * @param {string} apiSecret An OpenTok API Secret
 *
 * @returns {string} token
 */
var encodeToken = function(tokenData, apiKey, apiSecret) {

  // Prevent mutating value passed in
  tokenData = _.clone(tokenData);

  _.defaults(tokenData, {
    create_time: Math.round(timestamp.now()),
    expire_time: Math.round(timestamp.now('1d')),
    nonce: nonce(),
    role: 'publisher'
  });

  var dataString = querystring.stringify(tokenData),
      sig = signString(dataString, apiSecret),
      decoded = new Buffer("partner_id="+apiKey+"&sig="+sig+":"+dataString, 'utf8');
  return TOKEN_SENTINEL + decoded.toString('base64');
};


/**
 * Creates an HMAC-SHA1 signature of unsigned data using the key
 *
 * @private
 *
 * @param {string} unsigned Data to be signed
 * @param {string} key Key to sign data with
 *
 * @returns {string} signature
 */
var signString = function(unsigned, key) {
  var hmac = crypto.createHmac('sha1', key);
  hmac.update(unsigned);
  return hmac.digest('hex');
};


module.exports = encodeToken;

