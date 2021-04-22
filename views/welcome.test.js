const fs = require('fs'),
    path = require('path'), 
    eta = require('eta');

beforeAll(async () => {
    eta.configure({
        views: './views'
    });
});

test('render welcome', async () => {
    expect(await eta.renderFile('welcome', {
        env: {
            gyros: 'http://localhost/',
        },
        user: {
            mandator: 'school',
            name: 'Max Mustermann'
        },
    })).toEqual(fs.readFileSync(path.join(__dirname, './__test__/welcome.html'), 'utf8'));
});
