const fs = require('fs'),
    path = require('path'), 
    eta = require('eta');

beforeAll(async () => {
    eta.configure({
        views: './views'
    });
});

test('render grade', async () => {
    expect(await eta.renderFile('grade', {
        colors: {
            insufficient: '#EF476F',
            sufficient: '#FFD166',
            good: '#06D6A0'
        },
        subject: {
            name: 'Deutsch',
            average: 3.5,
        },
        grade: {
            name: 'Schachnovelle',
            value: 4,
            average: 4.5
        },
    })).toEqual(fs.readFileSync(path.join(__dirname, './__test__/grade.html'), 'utf8'));
});
