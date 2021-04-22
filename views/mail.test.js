const fs = require('fs'),
    path = require('path'), 
    eta = require('eta');

beforeAll(async () => {
    eta.configure({
        views: './views'
    });
});

test('render mail', async () => {
    expect(await eta.renderFile('mail', {
        preheader: `Short description of mail`,
        pages: {
            main: './__test__/main-test.eta'
        },
        env: {
            kaschuso: 'https://kaschuso.so.ch/',
            gyros: 'http://localhost/'
        },
        test: 'very cool variable',
        user: {
            mandator: 'school',
        },
    })).toEqual(fs.readFileSync(path.join(__dirname, './__test__/mail.html'), 'utf8'));
});

test('render mail (no main page defined)', async () => {
    await expect(eta.renderFile('mail', {
        preheader: `Short description of mail`,
        pages: {},
        env: {
            kaschuso: 'https://kaschuso.so.ch/',
            gyros: 'http://localhost/'
        },
        test: 'very cool variable',
        user: {
            mandator: 'school',
        },
    })).rejects.toThrow(TypeError);
});

test('render mail (custom header, main and footer)', async () => {
    expect(await eta.renderFile('mail', {
        preheader: `Short description of mail`,
        pages: {
            header: './__test__/header-test.eta',
            main: './__test__/main-test.eta',
            footer: './__test__/footer-test.eta'
        },
        header: 'custom header text goes here',
        test: 'very cool variable',
        footer: 'custom footer text goes here',
    })).toEqual(fs.readFileSync(path.join(__dirname, './__test__/custom-mail.html'), 'utf8'));
});
