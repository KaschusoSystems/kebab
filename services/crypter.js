var crypto = require('crypto');

const algorithm = 'aes-256-ctr';
const secretKey = crypto.createHash('sha256').update(String(require('../config').secret)).digest('base64').substr(0, 32);

function encrypt(text) {
    const iv = createIv();
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return {
        iv: iv.toString('hex'),
        hash: encrypted.toString('hex')
    };
}

function decrypt(hash, iv) {
    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(iv, 'hex'));
    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash, 'hex')), decipher.final()]);
    return decrpyted.toString();
}

function createIv() {
    return crypto.randomBytes(16);
}

module.exports = {
    encrypt,
    decrypt
}