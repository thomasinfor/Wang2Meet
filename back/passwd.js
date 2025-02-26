const crypto = require('crypto');

function getHash(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}.${hash}`;
}

function checkHash(hash, password) {
  const parts = hash.split('.');
  if (parts.length !== 2) {
    return false; // Invalid hash format
  }

  const salt = parts[0];
  const storedHash = parts[1];
  const derivedHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

  return derivedHash === storedHash;
}

module.exports = {
  getHash,
  checkHash,
};