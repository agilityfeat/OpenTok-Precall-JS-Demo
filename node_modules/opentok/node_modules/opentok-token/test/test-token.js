var test = require('tap').test;
var encodeToken = require('..');
var helpers = require('../helpers');

// fixtures
// the API Key and Secret are fake
var apiKey = '123456';
var apiSecret = '1234567890abcdef1234567890abcdef1234567890';

test('exports a single function', function(t) {
  t.type(encodeToken, 'function');
  t.end();
});

test('encodes a known token', function(t) {
  // fixtures
  var tokenData = {
    // this is a fake session ID made specifically to work with the fake API Key and Secret
    session_id: '1_MX4xMjM0NTZ-flNhdCBNYXIgMTUgMTQ6NDI6MjMgUERUIDIwMTR-MC40OTAxMzAyNX4',
    create_time: 1424221013,
    nonce: 0.3942609881050885,
    role: 'moderator',
    expire_time: 1424307413,
    connection_data: '{"name":"value"}'
  };
  var expectedToken = 'T1==cGFydG5lcl9pZD0xMjM0NTYmc2lnPWRmOTRhNjQ1NTlhY2MwNjFkN2EzNzUyYTZmYzY5NDkzZTkzOGMxOTE6c2Vzc2lvbl9pZD0xX01YNHhNak0wTlRaLWZsTmhkQ0JOWVhJZ01UVWdNVFE2TkRJNk1qTWdVRVJVSURJd01UUi1NQzQwT1RBeE16QXlOWDQmY3JlYXRlX3RpbWU9MTQyNDIyMTAxMyZub25jZT0wLjM5NDI2MDk4ODEwNTA4ODUmcm9sZT1tb2RlcmF0b3ImZXhwaXJlX3RpbWU9MTQyNDMwNzQxMyZjb25uZWN0aW9uX2RhdGE9JTdCJTIybmFtZSUyMiUzQSUyMnZhbHVlJTIyJTdE';

  var actualToken = encodeToken(tokenData, apiKey, apiSecret);

  t.equal(actualToken, expectedToken);
  t.end();
});

test('provides defaults', function(t) {
  // Fixtures
  var tokenData = {
    // this is a fake session ID made specifically to work with the fake API Key and Secret
    session_id: 'SESSIONID'
  };

  var token = encodeToken(tokenData, apiKey, apiSecret);
  decoded = helpers.decodeToken(token);
  t.ok('create_time' in decoded, 'create_time has default');
  t.ok('expire_time' in decoded, 'expire_time has default');
  t.ok('role' in decoded, 'role has default');
  t.ok('nonce' in decoded, 'nonce has default');

  t.test('create_time default is now', function(t) {
    var createTime = parseInt(decoded.create_time, 10);
    var now = Math.round(Date.now() / 1000);
    t.ok(createTime >= (now - 1));
    t.ok(createTime <= (now + 1));
    t.end();
  });

  t.test('expire_time default is in one day', function(t) {
    var expireTime = parseInt(decoded.expire_time, 10);
    var inOneDay = Math.round(Date.now() / 1000) + (60*60*24);
    t.ok(expireTime >= (inOneDay - 1));
    t.ok(expireTime <= (inOneDay + 1));
    t.end();
  });

  t.test('times are whole numbers', function(t) {
    t.ok(decoded.create_time.indexOf('.') === -1);
    t.ok(decoded.expire_time.indexOf('.') === -1);
    t.end();
  });

  t.equal(decoded.role, 'publisher', 'role default is \'publisher\'');

  t.test('nonce default is a unique number', function(t) {
    var nonce2 = helpers.decodeToken(encodeToken(tokenData, apiKey, apiSecret)).nonce;
    t.ok(decoded.nonce !== nonce2);
    t.end();
  });

  t.end();
});

test('contains a verified signature', function(t) {
  var tokenData = {
    session_id: 'SESSIONID',
    role: 'moderator'
  };
  var token = encodeToken(tokenData, apiKey, apiSecret);
  t.ok(helpers.verifyTokenSignature(token, apiSecret));
  t.end();
});

test('does not verify bad values', function(t) {
  var noSessionTokenData = {};
  var token = encodeToken(noSessionTokenData, apiKey, apiSecret);
  t.type(token, 'string');
  t.ok(helpers.verifyTokenSignature(token, apiSecret));
  t.end();
});
