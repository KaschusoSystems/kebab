require('../models/User');

const mongoose = require('mongoose');
var Absence = mongoose.model('Absence');
var User = mongoose.model('User');

const {
    updateAbsences,
    getChangedAbsences,
    findByAbsence
} = require('./absence-notification');

test('get changed absences (no absences changed)', () => {
    const absences = [
        {
            date: '30.03.2021',
            time: '13:00 - 13:45',
            class: 'M403-INF17A,INF17B-FURR',
            status: 'offen',
            comment: 'Krank'
        },
        {
            date: '30.03.2021',
            time: '13:50 - 14:35',
            class: 'M403-INF17A,INF17B-FURR',
            status: 'Entschuldigt',
            comment: 'Zahnarztbesuch'
        }
    ];
    const newAbsences = [
        {
            date: '30.03.2021',
            time: '13:00 - 13:45',
            class: 'M403-INF17A,INF17B-FURR',
            status: 'offen',
            comment: 'Krank'
        },
        {
            date: '30.03.2021',
            time: '13:50 - 14:35',
            class: 'M403-INF17A,INF17B-FURR',
            status: 'Entschuldigt',
            comment: 'Zahnarztbesuch'
        }
    ];
    expect(getChangedAbsences(absences, newAbsences))
    .toEqual([]);
});

test('get changed absences (status changed)', () => {
    const absences = [
        {
            date: '30.03.2021',
            time: '13:00 - 13:45',
            class: 'M403-INF17A,INF17B-FURR',
            status: 'offen',
            comment: 'Krank'
        },
        {
            date: '30.03.2021',
            time: '13:50 - 14:35',
            class: 'M403-INF17A,INF17B-FURR',
            status: 'offen',
            comment: 'Zahnarztbesuch',
        }
    ];
    const newAbsences = [
        {
            date: '30.03.2021',
            time: '13:00 - 13:45',
            class: 'M403-INF17A,INF17B-FURR',
            status: 'offen',
            comment: 'Krank'
        },
        {
            date: '30.03.2021',
            time: '13:50 - 14:35',
            class: 'M403-INF17A,INF17B-FURR',
            status: 'Entschuldigt',
            comment: 'Zahnarztbesuch'
        }
    ];
    expect(getChangedAbsences(absences, newAbsences))
    .toEqual([
        {
            date: '30.03.2021',
            time: '13:50 - 14:35',
            class: 'M403-INF17A,INF17B-FURR',
            status: 'Entschuldigt',
            comment: 'Zahnarztbesuch'
        }
    ]);
});

test('get changed absences (comment changed)', () => {
    const absences = [
        {
            date: '30.03.2021',
            time: '13:00 - 13:45',
            class: 'M403-INF17A,INF17B-FURR',
            status: 'offen',
            comment: 'Krank'
        },
        {
            date: '30.03.2021',
            time: '13:50 - 14:35',
            class: 'M403-INF17A,INF17B-FURR',
            status: 'Entschuldigt',
        }
    ];
    const newAbsences = [
        {
            date: '30.03.2021',
            time: '13:00 - 13:45',
            class: 'M403-INF17A,INF17B-FURR',
            status: 'offen',
            comment: 'Krank'
        },
        {
            date: '30.03.2021',
            time: '13:50 - 14:35',
            class: 'M403-INF17A,INF17B-FURR',
            status: 'Entschuldigt',
            comment: 'Zahnarztbesuch'
        }
    ];
    expect(getChangedAbsences(absences, newAbsences))
    .toEqual([
        {
            date: '30.03.2021',
            time: '13:50 - 14:35',
            class: 'M403-INF17A,INF17B-FURR',
            status: 'Entschuldigt',
            comment: 'Zahnarztbesuch'
        }
    ]);
});

test('get changed absences (reason changed)', () => {
    const absences = [
        {
            date: '30.03.2021',
            time: '13:00 - 13:45',
            class: 'M403-INF17A,INF17B-FURR',
            status: 'offen',
            comment: 'Krank'
        },
        {
            date: '30.03.2021',
            time: '13:50 - 14:35',
            class: 'M403-INF17A,INF17B-FURR',
            status: 'Entschuldigt',
            comment: 'Zahnarztbesuch'
        }
    ];
    const newAbsences = [
        {
            date: '30.03.2021',
            time: '13:00 - 13:45',
            class: 'M403-INF17A,INF17B-FURR',
            status: 'offen',
            comment: 'Krank'
        },
        {
            date: '30.03.2021',
            time: '13:50 - 14:35',
            class: 'M403-INF17A,INF17B-FURR',
            status: 'Entschuldigt',
            comment: 'Zahnarztbesuch',
            reason: 'Krank'
        }
    ];
    expect(getChangedAbsences(absences, newAbsences))
    .toEqual([
        {
            date: '30.03.2021',
            time: '13:50 - 14:35',
            class: 'M403-INF17A,INF17B-FURR',
            status: 'Entschuldigt',
            comment: 'Zahnarztbesuch',
            reason: 'Krank'
        }
    ]);
});

test('get changed absences (one new absence)', () => {
    const absences = [
        {
            date: '30.03.2021',
            time: '13:00 - 13:45',
            class: 'M403-INF17A,INF17B-FURR',
            status: 'offen',
            comment: 'Krank'
        }
    ];
    const newAbsences = [
        {
            date: '30.03.2021',
            time: '13:00 - 13:45',
            class: 'M403-INF17A,INF17B-FURR',
            status: 'offen',
            comment: 'Krank'
        },
        {
            date: '30.03.2021',
            time: '13:50 - 14:35',
            class: 'M403-INF17A,INF17B-FURR',
            status: 'Entschuldigt',
            comment: 'Zahnarztbesuch'
        }
    ];
    expect(getChangedAbsences(absences, newAbsences))
    .toEqual([
        {
            date: '30.03.2021',
            time: '13:50 - 14:35',
            class: 'M403-INF17A,INF17B-FURR',
            status: 'Entschuldigt',
            comment: 'Zahnarztbesuch'
        }
    ]);
});

test('get changed absences (two absences, one removed -> no changes)', () => {
    const absences = [
        {
            date: '30.03.2021',
            time: '13:00 - 13:45',
            class: 'M403-INF17A,INF17B-FURR',
            status: 'offen',
            comment: 'Krank'
        },
        {
            date: '30.03.2021',
            time: '13:50 - 14:35',
            class: 'M403-INF17A,INF17B-FURR',
            status: 'Entschuldigt',
            comment: 'Zahnarztbesuch'
        }
    ];
    const newAbsences = [
        {
            date: '30.03.2021',
            time: '13:50 - 14:35',
            class: 'M403-INF17A,INF17B-FURR',
            status: 'Entschuldigt',
            comment: 'Zahnarztbesuch'
        }
    ];
    expect(getChangedAbsences(absences, newAbsences))
    .toEqual([]);
});

test('find by absence', () => {
    const absences = [
        {
            date: '30.03.2021',
            time: '13:00 - 13:45',
            class: 'M403-INF17A,INF17B-FURR',
            status: 'offen',
            comment: 'Krank'
        },
        {
            date: '30.03.2021',
            time: '13:50 - 14:35',
            class: 'M403-INF17A,INF17B-FURR',
            status: 'Entschuldigt',
            comment: 'Zahnarztbesuch'
        }
    ];
    const absence = {
        date: '30.03.2021',
        time: '13:00 - 13:45',
        class: 'M403-INF17A,INF17B-FURR',
        status: 'offen',
        comment: 'Krank'
    };
    expect(findByAbsence(absences, absence))
    .toEqual({
        date: '30.03.2021',
        time: '13:00 - 13:45',
        class: 'M403-INF17A,INF17B-FURR',
        status: 'offen',
        comment: 'Krank'
    });
});

test('find by absence (absence matches not by date)', () => {
    const absences = [
        {
            date: '30.03.2021',
            time: '13:00 - 13:45',
            class: 'M403-INF17A,INF17B-FURR',
            status: 'offen',
            comment: 'Krank'
        },
        {
            date: '30.03.2021',
            time: '13:50 - 14:35',
            class: 'M403-INF17A,INF17B-FURR',
            status: 'Entschuldigt',
            comment: 'Zahnarztbesuch'
        }
    ];
    const absence = {
        date: '01.03.2017',
        time: '13:00 - 13:45',
        class: 'M403-INF17A,INF17B-FURR',
        status: 'offen',
        comment: 'Krank'
    };
    expect(findByAbsence(absences, absence))
    .toBeUndefined();
});

test('find by absence (absence matches not by time)', () => {
    const absences = [
        {
            date: '30.03.2021',
            time: '13:00 - 13:45',
            class: 'M403-INF17A,INF17B-FURR',
            status: 'offen',
            comment: 'Krank'
        },
        {
            date: '30.03.2021',
            time: '13:50 - 14:35',
            class: 'M403-INF17A,INF17B-FURR',
            status: 'Entschuldigt',
            comment: 'Zahnarztbesuch'
        }
    ];
    const absence = {
        date: '30.03.2021',
        time: '14:40 - 15:25',
        class: 'M403-INF17A,INF17B-FURR',
        status: 'offen',
        comment: 'Krank'
    };
    expect(findByAbsence(absences, absence))
    .toBeUndefined();
});

test('find by absence (absence matches not by class)', () => {
    const absences = [
        {
            date: '30.03.2021',
            time: '13:00 - 13:45',
            class: 'M403-INF17A,INF17B-FURR',
            status: 'offen',
            comment: 'Krank'
        },
        {
            date: '30.03.2021',
            time: '13:50 - 14:35',
            class: 'M403-INF17A,INF17B-FURR',
            status: 'Entschuldigt',
            comment: 'Zahnarztbesuch'
        }
    ];
    const absence = {
        date: '30.03.2021',
        time: '13:00 - 13:45',
        class: 'M200-INF17A,INF17B-MOSD',
        status: 'offen',
        comment: 'Krank'
    };
    expect(findByAbsence(absences, absence))
    .toBeUndefined();
});


// updateAbsences


test('update absences', () => {
    const absences = [
        new Absence({
            "date": "05.12.2017",
            "time": "07:35 - 08:20",
            "class": "GP-BM1_TE17A-GEIM",
            "status": "Entschuldigt",
            "reason": "Zahnarzt"
        }),
        new Absence({
            "date": "30.03.2021",
            "time": "13:00 - 13:45",
            "class": "M326-INF17A,INF17B-MOSD",
            "status": "offen",
            "reason": "Schnupfen"
        }),
        new Absence({
            "date": "30.03.2021",
            "time": "13:50 - 14:35",
            "class": "M326-INF17A,INF17B-MOSD",
            "status": "offen",
            "reason": "Schnupfen"
        })
    ];
    const changedAbsences = [
        {
            "date": "30.03.2021",
            "time": "13:50 - 14:35",
            "class": "M326-INF17A,INF17B-MOSD",
            "status": "Entschuldigt",
            "reason": "Schnupfen"
        },
        {
            "date": "30.03.2021",
            "time": "14:40 - 15:25",
            "class": "M326-INF17A,INF17B-MOSD",
            "status": "offen"
        }
    ];
    return updateAbsences(absences, changedAbsences, new User()).then(updatedAbsences => {
        expect(updatedAbsences.map(x => x.toJSONFor()))
        .toEqual([
            {
                "date": "30.03.2021",
                "time": "13:50 - 14:35",
                "class": "M326-INF17A,INF17B-MOSD",
                "status": "Entschuldigt",
                "reason": "Schnupfen"
            },
            {
                "date": "30.03.2021",
                "time": "14:40 - 15:25",
                "class": "M326-INF17A,INF17B-MOSD",
                "status": "offen"
            }
        ]);
    })
});
