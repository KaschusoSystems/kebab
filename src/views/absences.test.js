const fs = require('fs'),
    path = require('path'), 
    eta = require('eta');

beforeAll(async () => {
    eta.configure({
        views: './views'
    });
});

test('render absences', async () => {
    expect(await eta.renderFile('absences', {
        title: 'Neue Absenzen🔔',
        env: {
            kaschuso: 'https://kaschuso.so.ch/',
            gyros: 'http://localhost/',
            colors: {
                'Unentschuldigt': '#EF476F',
                'Entschuldigt': '#06D6A0',
                'Nicht zählend': '#06D6A0',
                'offen': '#FFD166'
            }
        },
        absences: [
            {
                date: '30.03.2021',
                time: '13:00 - 13:45',
                class: 'M403-INF17A,INF17B-FURR	',
                status: 'offen',
                comment: 'Krank'
            },
            {
                date: '30.03.2021',
                time: '13:50 - 14:35',
                class: 'M403-INF17A,INF17B-FURR	',
                status: 'Entschuldigt',
                comment: 'Zahnarztbesuch'
            }
        ],
        user: {
            mandator: 'school'
        }
    })).toEqual(fs.readFileSync(path.join(__dirname, './__test__/absences.html'), 'utf8'));
});
