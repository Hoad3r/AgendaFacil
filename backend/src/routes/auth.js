const { toNodeHandler } = require('better-auth/node');
const { auth } = require('../lib/auth');

module.exports = toNodeHandler(auth);
