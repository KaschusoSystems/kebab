var crypto = require('crypto');

const algorithm = 'aes-256-ctr';
const secretKey = crypto.createHash('sha256').update(String(require('../config').secret)).digest('base64').substr(0, 32);

function encrypt(text) {
    const iv = createIv();
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return {
        iv: iv.toString('hex'),
        encrypted: encrypted.toString('hex')
    };
}

function decrypt(encrypted, iv) {
    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(iv, 'hex'));
    const decrpyted = Buffer.concat([decipher.update(Buffer.from(encrypted, 'hex')), decipher.final()]);
    return decrpyted.toString();
}

function createIv() {
    return crypto.randomBytes(16);
}

module.exports = {
    encrypt,
    decrypt,
    // tests
    createIv
}