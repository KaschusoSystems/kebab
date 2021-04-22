const fs = require('fs'),
    path = require('path'),
    eta = require('eta');

const {
    getEmoji,
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
    const subjects = [
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
    ];
    const emoji = getEmoji(subjects);
    
    expect(await eta.renderFile('mail', {
        preheader: `Auf Kaschuso sind für ${subjects.map(x => x.name).join(', ')} neue Noten verfügbar${emoji}`,
        pages: {
            main: 'grades'
        },
        env: {
            kaschuso: 'https://kaschuso.so.ch/',
            gyros: 'http://localhost/',
            colors: {
                insufficient: '#EF476F',
                sufficient: '#FFD166',
                good: '#06D6A0'
            }
        },
        user: {
            mandator: 'school'
        }, 
        subjects: subjects,
        emoji: emoji
    })).toEqual(fs.readFileSync('./views/__test__/grades-mail.html', 'utf8'));
});

test('render welcome notification html', async () => {
    expect(await eta.renderFile('mail', {
        preheader: 'Kaschuso Benachrichtigungen sind aktiviert🎉',
        pages: {
            main: 'welcome'
        },
        env: {
            kaschuso: 'https://kaschuso.so.ch/',
            gyros: 'http://localhost/',
        },
        user: {
            mandator: 'school',
            name: 'Erika Mustermann'
        },
    })).toEqual(fs.readFileSync('./views/__test__/welcome-mail.html', 'utf8'));
});
