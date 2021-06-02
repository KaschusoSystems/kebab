const fs = require('fs'),
    path = require('path'), 
    eta = require('eta');

beforeAll(async () => {
    eta.configure({
        views: './views'
    });
});

test('render absence', async () => {
    expect(await eta.renderFile('absence', {
        colors: {
            'Unentschuldigt': '#EF476F',
            'Entschuldigt': '#06D6A0',
            'Nicht zählend': '#06D6A0',
            'offen': '#FFD166'
        },
        absence: {
            date: '30.03.2021',
            time: '13:50 - 14:35',
            class: 'M403-INF17A,INF17B-FURR	',
            status: 'offen',
            comment: 'Zahnarztbesuch'
        }
    })).toEqual(fs.readFileSync(path.join(__dirname, './__test__/absence.html'), 'utf8'));
});
