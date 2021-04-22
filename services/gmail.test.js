const fs = require('fs'),
    path = require('path'),
    eta = require('eta');

const {
    getEmoji,
    renderGradeNotificationHtml,
} = require('./gmail');

beforeAll(async () => {
    eta.configure({
        views: './views'
    });
});

test('get emoji', () => {
    expect(getEmoji([
        {
            grades: [
                {
                    value: "6",
                },
                {
                    value: 3,
                }
            ]
        },
        {
            grades: [
                {
                    value: "5",
                }
            ]
        }
    ])).toBe('😉'); // 4.67
    
    expect(getEmoji([{ grades: [{ value: 6 }] }]))
    .toBe('😎');
    
    expect(getEmoji([{ grades: [{ value: 5 }] }]))
    .toBe('😊');
    
    expect(getEmoji([{ grades: [{ value: 4.3 }] }]))
    .toBe('😉');
    
    expect(getEmoji([{ grades: [{ value: 3 }] }]))
    .toBe('🧐');
    
    expect(getEmoji([{ grades: [{ value: 2 }] }]))
    .toBe('😳');

    expect(getEmoji([{ grades: [{ value: 1.2 }] }]))
    .toBe('😨');
});

test('render grade notification html', async () => {
    const html = await renderGradeNotificationHtml(
        {
            kaschuso: 'https://kaschuso.so.ch/',
            gyros: 'http://localhost/',
            colors: {
                insufficient: '#EF476F',
                sufficient: '#FFD166',
                good: '#06D6A0'
            }
        },
        {
            mandator: 'school'
        },
        [
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
        ]
    );

    expect(html).toEqual(fs.readFileSync('./views/__test__/grades-mail.html', 'utf8'));
});
