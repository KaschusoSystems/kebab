const {
    encrypt,
    decrypt,
    createIv,
} = require('./crypter');

test('create iv', () => {
    expect(createIv().toString('hex'))
    .toMatch(/^[0-9a-f]{32}$/);
});

test('encrypt', () => {
    process.env.SECRET = 'huntpatternstayfearsegmentsuccessletterread';
    const result = encrypt('The quick brown fox jumps over the lazy dog');

    expect(result.iv).toMatch(/^[0-9a-f]{32}$/);

    expect(result.encrypted).toMatch(/^[0-9a-f]+$/);
});


test('decrypt', () => {
    process.env.SECRET = 'huntpatternstayfearsegmentsuccessletterread';

    const iv = '9ce64809e65982f41659de882f2ee53d';
    const encrypted = '71b74d12e8b6113d3a125e6404824a5df2d12296c4c94209f06cb0adfc1d0bed63e17d21f2837001708f1c';

    expect(decrypt(encrypted, iv)).toBe('The quick brown fox jumps over the lazy dog');
});


test('encrypt and decrypt', () => {
    process.env.SECRET = 'huntpatternstayfearsegmentsuccessletterread';
    
    const text = 'The quick brown fox jumps over the lazy dog';
    const result = encrypt(text);

    expect(decrypt(result.encrypted, result.iv))
    .toBe(text);
});