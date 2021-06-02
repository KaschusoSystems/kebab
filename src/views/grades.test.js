const fs = require('fs'),
    path = require('path'), 
    eta = require('eta');

beforeAll(async () => {
    eta.configure({
        views: './views'
    });
});

test('render grades', async () => {
    expect(await eta.renderFile('grades', {
        env: {
            kaschuso: 'https://kaschuso.so.ch/',
            gyros: 'http://localhost/',
            colors: {
                insufficient: '#EF476F',
                sufficient: '#FFD166',
                good: '#06D6A0'
            }
        },
        emoji: '😎',
        subjects: [
            {
                name: 'Deutsch',
                average: 3.5,
                grades: [
                    {
                        name: 'Schachnovelle',
                        value: 4,
                        average: 4.5
                    },
                    {
                        name: 'Mein Kampf',
                        value: 3,
                        average: 4.6
                    }
                ]
            },
            
            {
                name: 'Mathematik',
                average: 5.5,
                grades: [
                    {
                        name: 'Lineare Gleichungssysteme',
                        value: 6,
                        average: 4.3
                    }
                ]
            }
        ],
        user: {
            mandator: 'school',
        },
    })).toEqual(fs.readFileSync(path.join(__dirname, './__test__/grades.html'), 'utf8'));
});
