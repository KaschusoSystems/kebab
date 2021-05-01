const fs = require('fs'),
    path = require('path'), 
    eta = require('eta');

beforeAll(async () => {
    eta.configure({
        views: './views'
    });
});

test('render webhook error', async () => {
    expect(await eta.renderFile('webhook-error', {
        title: 'IFTTT Webhook schlägt fehl❌',
        env: {
            kaschuso: 'https://kaschuso.so.ch/',
            gyros: 'http://localhost/',
            colors: {
                red: '#EF476F'
            }
        },
        user: {
            mandator: 'school'
        }
    })).toEqual(fs.readFileSync(path.join(__dirname, './__test__/webhook-error.html'), 'utf8'));
});
