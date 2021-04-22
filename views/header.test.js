const fs = require('fs'),
    path = require('path'), 
    eta = require('eta');

beforeAll(async () => {
    eta.configure({
        views: './views'
    });
});

test('render header', async () => {
    expect(await eta.renderFile('header', {
        env: {
            kaschuso: 'https://kaschuso.so.ch/',
            gyros: 'http://localhost/'
        },
        user: {
            mandator: 'school',
        },
    })).toEqual(fs.readFileSync(path.join(__dirname, './__test__/header.html'), 'utf8'));
});
