const fs = require('fs'),
    path = require('path'), 
    eta = require('eta');

beforeAll(async () => {
    eta.configure({
        views: './views'
    });
});

test('render footer', async () => {
    expect(await eta.renderFile('footer', {
        env: {
            gyros: 'http://localhost/'
        }
    })).toEqual(fs.readFileSync(path.join(__dirname, './__test__/footer.html'), 'utf8'));
});
