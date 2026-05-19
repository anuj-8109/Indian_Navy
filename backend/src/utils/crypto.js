const crypto = require('crypto');

const algorithm = 'aes-256-cbc';

// Generate 32-byte key and 16-byte IV from environment strings
const rawKey = process.env.ENCRYPTION_KEY || 'navy_visitor_encryption_key_32_bytes_long_123';
const rawIv = process.env.ENCRYPTION_IV || 'navy_iv_16_bytes_';

const key = crypto.createHash('sha256').update(rawKey).digest(); // Always 32 bytes
const iv = crypto.createHash('md5').update(rawIv).digest(); // Always 16 bytes

function encrypt(text) {
  if (!text) return '';
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decrypt(text) {
  if (!text) return '';
  try {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(text, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return 'Decryption Error';
  }
}

module.exports = { encrypt, decrypt };
