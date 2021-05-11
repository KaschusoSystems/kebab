require('../models/User');

const mongoose = require('mongoose');
var Subject = mongoose.model('Subject');
var User = mongoose.model('User');

const {
    getChangedGrades,
    getChangedSubjects,
    mergeSubjectObject,
    updateSubjects,
    findByGrade,
    findBySubject,
} = require('./grade-notification');

describe('get changed grades', () => {
    test('no grades changed', () => {
        const grades = [
            {
                "date": "29.01.2021",
                "name": "Noise-Cancelling",
                "value": "5.625",
                "weighting": "1"
            },
            {
                "date": "26.03.2021",
                "name": "Schwingungen",
                "value": "5.9",
                "points": "17",
                "weighting": "1"
            }
        ];
        const newGrades = [
            {
                "date": "29.01.2021",
                "name": "Noise-Cancelling",
                "value": "5.625",
                "weighting": "1"
            },
            {
                "date": "26.03.2021",
                "name": "Schwingungen",
                "value": "5.9",
                "points": "17",
                "weighting": "1"
            }
        ];
        expect(getChangedGrades(grades, newGrades))
        .toEqual([[], []]);
    });

    test('grade changed by date', () => {
        const grades = [
            {
                "date": "29.01.2021",
                "name": "Noise-Cancelling",
                "value": "5.625",
                "weighting": "1"
            }
        ];
        const newGrades = [
            {
                "date": "11.02.2021",
                "name": "Noise-Cancelling",
                "value": "5.625",
                "weighting": "1"
            }
        ];
        expect(getChangedGrades(grades, newGrades))
        .toEqual([
            [
                {
                    "date": "11.02.2021",
                    "name": "Noise-Cancelling",
                    "value": "5.625",
                    "weighting": "1"
                }
            ],
            [
                {
                    "date": "11.02.2021",
                    "name": "Noise-Cancelling",
                    "value": "5.625",
                    "weighting": "1"
                }
            ]
        ]);
    });

    test('grade changed by name', () => {
        const grades = [
            {
                "date": "29.01.2021",
                "name": "Noise-Cancelling",
                "value": "5.625",
                "weighting": "1"
            }
        ];
        const newGrades = [
            {
                "date": "29.01.2021",
                "name": "Grüsch-Abbreche",
                "value": "5.625",
                "weighting": "1"
            }
        ];
        expect(getChangedGrades(grades, newGrades))
        .toEqual([
            [
                {
                    "date": "29.01.2021",
                    "name": "Grüsch-Abbreche",
                    "value": "5.625",
                    "weighting": "1"
                }
            ],
            [
                {
                    "date": "29.01.2021",
                    "name": "Grüsch-Abbreche",
                    "value": "5.625",
                    "weighting": "1"
                }
            ]
        ]);
    });

    test('grade changed by value', () => {
        const grades = [
            {
                "date": "29.01.2021",
                "name": "Noise-Cancelling",
                "value": "5.625",
                "weighting": "1"
            }
        ];
        const newGrades = [
            {
                "date": "29.01.2021",
                "name": "Noise-Cancelling",
                "value": "1.234",
                "weighting": "1"
            }
        ];
        expect(getChangedGrades(grades, newGrades))
        .toEqual([
            [
                {
                    "date": "29.01.2021",
                    "name": "Noise-Cancelling",
                    "value": "1.234",
                    "weighting": "1"
                }
            ],
            [
                {
                    "date": "29.01.2021",
                    "name": "Noise-Cancelling",
                    "value": "1.234",
                    "weighting": "1"
                }
            ]
        ]);
    });

    test('two grades, one changed', () => {
        const grades = [
            {
                "date": "29.01.2021",
                "name": "Noise-Cancelling",
                "value": "5.625",
                "weighting": "1"
            },
            {
                "date": "26.03.2021",
                "name": "Schwingungen",
                "value": "4.1",
                "points": "11",
                "weighting": "1"
            }
        ];
        const newGrades = [
            {
                "date": "29.01.2021",
                "name": "Noise-Cancelling",
                "value": "5.625",
                "weighting": "1"
            },
            {
                "date": "26.03.2021",
                "name": "Schwingungen",
                "value": "5.9",
                "points": "17",
                "weighting": "1"
            }
        ];
        expect(getChangedGrades(grades, newGrades))
        .toEqual([
            [
                {
                    "date": "26.03.2021",
                    "name": "Schwingungen",
                    "value": "5.9", // changed
                    "points": "17", // changed
                    "weighting": "1"
                }
            ], 
            [
                {
                    "date": "26.03.2021",
                    "name": "Schwingungen",
                    "value": "5.9", // changed
                    "points": "17", // changed
                    "weighting": "1"
                }
            ]
        ]);
    });

    test('one grade, one new grade', () => {
        const grades = [
            {
                "date": "29.01.2021",
                "name": "Noise-Cancelling",
                "value": "5.625",
                "weighting": "1"
            }
        ];
        const newGrades = [
            {
                "date": "29.01.2021",
                "name": "Noise-Cancelling",
                "value": "5.625",
                "weighting": "1"
            },
            {
                "date": "26.03.2021",
                "name": "Schwingungen",
                "value": "5.9",
                "points": "17",
                "weighting": "1"
            }
        ];
        expect(getChangedGrades(grades, newGrades))
        .toEqual([
            [
                {
                    "date": "26.03.2021",
                    "name": "Schwingungen",
                    "value": "5.9",
                    "points": "17",
                    "weighting": "1"
                }
            ],
            [
                {
                    "date": "26.03.2021",
                    "name": "Schwingungen",
                    "value": "5.9",
                    "points": "17",
                    "weighting": "1"
                }
            ]
        ]);
    });

    test('two grades, one removed -> no changes', () => {
        const grades = [
            {
                "date": "29.01.2021",
                "name": "Noise-Cancelling",
                "value": "5.625",
                "weighting": "1"
            },
            {
                "date": "26.03.2021",
                "name": "Schwingungen",
                "value": "5.9",
                "points": "17",
                "weighting": "1"
            }
        ];
        const newGrades = [
            {
                "date": "29.01.2021",
                "name": "Noise-Cancelling",
                "value": "5.625",
                "weighting": "1"
            }
        ];
        expect(getChangedGrades(grades, newGrades))
        .toEqual([[], []]);
    });

    test('points added', () => {
        const grades = [
            {
                "date": "26.03.2021",
                "name": "Schwingungen",
                "value": "5.9",
                "weighting": "1",
                "average": "4.36"
            }
        ];
        const newGrades = [
            {
                "date": "26.03.2021",
                "name": "Schwingungen",
                "value": "5.9",
                "points": "17",
                "weighting": "1",
                "average": "4.36"
            }
        ];
        expect(getChangedGrades(grades, newGrades))
        .toEqual([
            [
                {
                    "date": "26.03.2021",
                    "name": "Schwingungen",
                    "value": "5.9",
                    "points": "17",
                    "weighting": "1",
                    "average": "4.36"
                }
            ], 
            []
        ]);
    });

    test('points removed', () => {
        const grades = [
            {
                "date": "26.03.2021",
                "name": "Schwingungen",
                "value": "5.9",
                "points": "17",
                "weighting": "1",
                "average": "4.36"
            }
        ];
        const newGrades = [
            {
                "date": "26.03.2021",
                "name": "Schwingungen",
                "value": "5.9",
                "weighting": "1",
                "average": "4.36"
            }
        ];
        expect(getChangedGrades(grades, newGrades))
        .toEqual([
            [
                {
                    "date": "26.03.2021",
                    "name": "Schwingungen",
                    "value": "5.9",
                    "weighting": "1",
                    "average": "4.36"
                }
            ], 
            []
        ]);
    });

    test('points changed', () => {
        const grades = [
            {
                "date": "26.03.2021",
                "name": "Schwingungen",
                "value": "5.9",
                "points": "17",
                "weighting": "1",
                "average": "4.36"
            }
        ];
        const newGrades = [
            {
                "date": "26.03.2021",
                "name": "Schwingungen",
                "value": "5.9",
                "points": "19",
                "weighting": "1",
                "average": "4.36"
            }
        ];
        expect(getChangedGrades(grades, newGrades))
        .toEqual([
            [
                {
                    "date": "26.03.2021",
                    "name": "Schwingungen",
                    "value": "5.9",
                    "points": "19",
                    "weighting": "1",
                    "average": "4.36"
                }
            ], 
            []
        ]);
    });

    test('weighting changed', () => {
        const grades = [
            {
                "date": "26.03.2021",
                "name": "Schwingungen",
                "value": "5.9",
                "points": "17",
                "weighting": "1",
                "average": "4.36"
            }
        ];
        const newGrades = [
            {
                "date": "26.03.2021",
                "name": "Schwingungen",
                "value": "5.9",
                "points": "17",
                "weighting": "3",
                "average": "4.36"
            }
        ];
        expect(getChangedGrades(grades, newGrades))
        .toEqual([
            [
                {
                    "date": "26.03.2021",
                    "name": "Schwingungen",
                    "value": "5.9",
                    "points": "17",
                    "weighting": "3",
                    "average": "4.36"
                }
            ], 
            []
        ]);
    });

    test('average changed', () => {
        const grades = [
            {
                "date": "26.03.2021",
                "name": "Schwingungen",
                "value": "5.9",
                "points": "17",
                "weighting": "1",
                "average": "4.36"
            }
        ];
        const newGrades = [
            {
                "date": "26.03.2021",
                "name": "Schwingungen",
                "value": "5.9",
                "points": "17",
                "weighting": "1",
                "average": "4.77"
            }
        ];
        expect(getChangedGrades(grades, newGrades))
        .toEqual([
            [
                {
                    "date": "26.03.2021",
                    "name": "Schwingungen",
                    "value": "5.9",
                    "points": "17",
                    "weighting": "1",
                    "average": "4.77"
                }
            ], 
            []
        ]);
    });
});

test('get changed subjects', () => {
    const subjects = [
        {
            "class": "D-BM1_TE17A-GEIM",
            "name": "Deutsch",
            "average": "4.875",
            "grades": [
                {
                    "date": "08.04.2021",
                    "name": "Literaturgeschichte",
                    "value": "4.5",
                    "points": "18",
                    "weighting": "1"
                }
            ]
        },
        {
            "class": "M326-INF17A,INF17B-MOSD",
            "name": "M326 Objektorientiert entwerfen und implementieren",
            "average": "6.000",
            "grades": [
                {
                    "date": "30.03.2021",
                    "name": "Anwendung Projekt M306",
                    "value": "6",
                    "points": "21",
                    "weighting": "1"
                }
            ]
        },
        {
            "class": "MS-BM1_TE17A-HARS",
            "name": "Mathematik Schwerpunkt",
            "average": "4.700",
            "grades": [
                {
                    "date": "18.03.2021",
                    "name": "Skalarprodukt",
                    "value": "4.7",
                    "points": "8",
                    "weighting": "1"
                }
            ]
        },
        {
            "class": "PH-BM1_TE17A-HARS",
            "name": "Physik",
            "average": "5.763",
            "grades": [
                {
                    "date": "29.01.2021",
                    "name": "Noise-Cancelling",
                    "value": "5.625",
                    "weighting": "1"
                },
                {
                    "date": "26.03.2021",
                    "name": "Schwingungen",
                    "value": "5.9",
                    "points": "17",
                    "weighting": "1"
                }
            ]
        }
    ];
    const newSubjects = [
        {
            "class": "D-BM1_TE17A-GEIM",
            "name": "Deutsch",
            "average": "4.875",
            "grades": [
                {
                    "date": "22.03.2021",
                    "name": "Schachnovelle",
                    "value": "5.25",
                    "points": "12",
                    "weighting": "1"
                },
                {
                    "date": "08.04.2021",
                    "name": "Literaturgeschichte",
                    "value": "4.5",
                    "points": "18",
                    "weighting": "1"
                }
            ]
        },
        {
            "class": "EB-BM1_TE17A-BAYF",
            "name": "Englisch",
            "average": "--",
            "grades": [
                {
                    "date": "01.03.2021",
                    "name": "Interview - Tiger mother",
                    "weighting": "1"
                }
            ]
        },
        {
            "class": "M326-INF17A,INF17B-MOSD",
            "name": "M326 Objektorientiert entwerfen und implementieren",
            "average": "6.000",
            "grades": [
                {
                    "date": "30.03.2021",
                    "name": "Anwendung Projekt M306",
                    "value": "6",
                    "points": "21",
                    "weighting": "1"
                }
            ]
        },
        {
            "class": "PH-BM1_TE17A-HARS",
            "name": "Physik",
            "average": "5.763",
            "grades": [
                {
                    "date": "29.01.2021",
                    "name": "Noise-Cancelling",
                    "value": "5.625",
                    "weighting": "1"
                },
            ]
        }
    ];
    expect(getChangedSubjects(subjects, newSubjects))
    .toEqual([
        [
            {
                "class": "D-BM1_TE17A-GEIM",
                "name": "Deutsch",
                "average": "4.875",
                "grades": [
                    {
                        "date": "22.03.2021",
                        "name": "Schachnovelle",
                        "value": "5.25",
                        "points": "12",
                        "weighting": "1"
                    },
                ]
            },
            {
                "class": "EB-BM1_TE17A-BAYF",
                "name": "Englisch",
                "average": "--",
                "grades": [
                    {
                        "date": "01.03.2021",
                        "name": "Interview - Tiger mother",
                        "weighting": "1"
                    }
                ]
            }
        ],
        [
            {
                "class": "D-BM1_TE17A-GEIM",
                "name": "Deutsch",
                "average": "4.875",
                "grades": [
                    {
                        "date": "22.03.2021",
                        "name": "Schachnovelle",
                        "value": "5.25",
                        "points": "12",
                        "weighting": "1"
                    },
                ]
            },
            {
                "class": "EB-BM1_TE17A-BAYF",
                "name": "Englisch",
                "average": "--",
                "grades": [
                    {
                        "date": "01.03.2021",
                        "name": "Interview - Tiger mother",
                        "weighting": "1"
                    }
                ]
            }
        ]
    ]);
});

test('merge subject object', () => {
    const subject = new Subject({
        "class": "D-BM1_TE17A-GEIM",
        "name": "Deutsch",
        "average": "5.25",
        "grades": [
            {
                "date": "22.03.2021",
                "name": "Schachnovelle",
                "value": "5.25",
                "points": "12",
                "weighting": "1"
            }
        ]
    });
    const newSubject = {
        "class": "D-BM1_TE17A-GEIM",
        "name": "Deutsch",
        "average": "4.875",
        "grades": [
            {
                "date": "22.03.2021",
                "name": "Schachnovelle",
                "value": "5.25",
                "points": "12",
                "weighting": "1"
            },
            {
                "date": "08.04.2021",
                "name": "Literaturgeschichte",
                "value": "4.5",
                "points": "18",
                "weighting": "1"
            }
        ]
    };
    return mergeSubjectObject(subject, newSubject).then(mergedSubject => {
        expect(mergedSubject.toJSONFor())
        .toEqual({
            "class": "D-BM1_TE17A-GEIM",
            "name": "Deutsch",
            "average": "4.875",
            "grades": [
                {
                    "date": "08.04.2021",
                    "name": "Literaturgeschichte",
                    "value": 4.5,
                    "points": 18,
                    "weighting": 1
                },
                {
                    "date": "22.03.2021",
                    "name": "Schachnovelle",
                    "value": 5.25,
                    "points": 12,
                    "weighting": 1
                }
            ]
        });
    });
});

test('update subjects', () => {
    const subjects = [
        new Subject({
            "class": "D-BM1_TE17A-GEIM",
            "name": "Deutsch",
            "average": "4.875",
            "grades": [
                {
                    "date": "08.04.2021",
                    "name": "Literaturgeschichte",
                    "value": "4.5",
                    "points": "18",
                    "weighting": "1"
                }
            ]
        }),
        new Subject({
            "class": "M326-INF17A,INF17B-MOSD",
            "name": "M326 Objektorientiert entwerfen und implementieren",
            "average": "6.000",
            "grades": [
                {
                    "date": "30.03.2021",
                    "name": "Anwendung Projekt M306",
                    "value": "6",
                    "points": "21",
                    "weighting": "1"
                }
            ]
        }),
        new Subject({
            "class": "MS-BM1_TE17A-HARS",
            "name": "Mathematik Schwerpunkt",
            "average": "4.700",
            "grades": [
                {
                    "date": "18.03.2021",
                    "name": "Skalarprodukt",
                    "value": "4.7",
                    "points": "8",
                    "weighting": "1"
                }
            ]
        }),
        new Subject({
            "class": "PH-BM1_TE17A-HARS",
            "name": "Physik",
            "average": "5.763",
            "grades": [
                {
                    "date": "29.01.2021",
                    "name": "Noise-Cancelling",
                    "value": "5.625",
                    "weighting": "1"
                },
                {
                    "date": "26.03.2021",
                    "name": "Schwingungen",
                    "value": "5.9",
                    "points": "17",
                    "weighting": "1"
                }
            ]
        })
    ];
    const changedSubjects = [
        {
            "class": "D-BM1_TE17A-GEIM",
            "name": "Deutsch",
            "average": "4.875",
            "grades": [
                {
                    "date": "22.03.2021",
                    "name": "Schachnovelle",
                    "value": "5.25",
                    "points": "12",
                    "weighting": "1"
                },
            ]
        },
        {
            "class": "EB-BM1_TE17A-BAYF",
            "name": "Englisch",
            "average": "--",
            "grades": [
                {
                    "date": "01.03.2021",
                    "name": "Interview - Tiger mother",
                    "weighting": "1"
                }
            ]
        }
    ];
    return updateSubjects(subjects, changedSubjects, new User()).then(updatedSubjects => {
        expect(updatedSubjects.map(x => x.toJSONFor()))
        .toEqual([
            {
                "class": "D-BM1_TE17A-GEIM",
                "name": "Deutsch",
                "average": "4.875",
                "grades": [
                    {
                        "date": "22.03.2021",
                        "name": "Schachnovelle",
                        "value": 5.25,
                        "points": 12,
                        "weighting": 1
                    },
                    {
                        "date": "08.04.2021",
                        "name": "Literaturgeschichte",
                        "value": 4.5,
                        "points": 18,
                        "weighting": 1
                    }
                ]
            },
            {
                "class": "EB-BM1_TE17A-BAYF",
                "name": "Englisch",
                "average": "--",
                "grades": [
                    {
                        "date": "01.03.2021",
                        "name": "Interview - Tiger mother",
                        "weighting": 1
                    }
                ]
            }
        ]);
    })
});


describe('find by grade', () => {
    test('one grade matches', () => {
        const grades = [
            {
                "date": "22.03.2021",
                "name": "Schachnovelle",
                "value": "5.25",
                "points": "12",
                "weighting": "1"
            },
            {
                "date": "08.04.2021",
                "name": "Literaturgeschichte",
                "value": "4.5",
                "points": "18",
                "weighting": "1"
            }
        ];
        const grade = {
            "date": "08.04.2021",
            "name": "Literaturgeschichte",
            "value": "5.5",
            "points": "22",
            "weighting": "0.3"
        };
        expect(findByGrade(grades, grade))
        .toEqual({
            "date": "08.04.2021",
            "name": "Literaturgeschichte",
            "value": "4.5",
            "points": "18",
            "weighting": "1"
        });
    });

    test('grade matches not by name', () => {
        const grades = [
            {
                "date": "22.03.2021",
                "name": "Schachnovelle",
                "value": "5.25",
                "points": "12",
                "weighting": "1"
            },
            {
                "date": "08.04.2021",
                "name": "Literaturgeschichte",
                "value": "4.5",
                "points": "18",
                "weighting": "1"
            }
        ];
        const grade = {
            "date": "08.04.2021",
            "name": "Mein Kampf",
            "value": "5.5",
            "points": "22",
            "weighting": "0.3"
        };
        expect(findByGrade(grades, grade))
        .toBeUndefined();
    });

    test('grade matches not by date', () => {
        const grades = [
            {
                "date": "22.03.2021",
                "name": "Schachnovelle",
                "value": "5.25",
                "points": "12",
                "weighting": "1"
            },
            {
                "date": "08.04.2021",
                "name": "Literaturgeschichte",
                "value": "4.5",
                "points": "18",
                "weighting": "1"
            }
        ];
        const grade = {
            "date": "01.01.2019",
            "name": "Literaturgeschichte",
            "value": "5.5",
            "points": "22",
            "weighting": "0.3"
        };
        expect(findByGrade(grades, grade))
        .toBeUndefined();
    });
});

describe('find by subject', () => {
    test('one subject matches', () => {
        const subjects = [
            {
                "class": "PH-BM1_TE17A-HARS",
                "name": "Physik",
                "average": "5.763",
            },
            {
                "class": "M326-INF17A,INF17B-MOSD",
                "name": "M326 Objektorientiert entwerfen und implementieren",
                "average": "6.000"
            }
        ];
        const subject = {
            "class": "M326-INF17A,INF17B-MOSD",
            "name": "M326 Objektorientiert entwerfen und implementieren",
            "average": "4.000"
        };
        expect(findBySubject(subjects, subject))
        .toEqual({
            "class": "M326-INF17A,INF17B-MOSD",
            "name": "M326 Objektorientiert entwerfen und implementieren",
            "average": "6.000"
        });
    });

    test('subject matches not by class', () => {
        const subjects = [
            {
                "class": "PH-BM1_TE17A-HARS",
                "name": "Physik",
                "average": "5.763",
            },
            {
                "class": "M326-INF17A,INF17B-MOSD",
                "name": "M326 Objektorientiert entwerfen und implementieren",
                "average": "6.000"
            }
        ];
        const subject = {
            "class": "M420-INF20A,INF20B-OFFLINE",
            "name": "M326 Objektorientiert entwerfen und implementieren",
            "average": "4.000"
        };
        expect(findBySubject(subjects, subject))
        .toBeUndefined();
    });

    test('subject matches not by name', () => {
        const subjects = [
            {
                "class": "PH-BM1_TE17A-HARS",
                "name": "Physik",
                "average": "5.763",
            },
            {
                "class": "M326-INF17A,INF17B-MOSD",
                "name": "M326 Objektorientiert entwerfen und implementieren",
                "average": "6.000"
            }
        ];
        const subject = {
            "class": "M326-INF17A,INF17B-MOSD",
            "name": "M420 MLM/Schneeballsysteme",
            "average": "4.000"
        };
        expect(findBySubject(subjects, subject))
        .toBeUndefined();
    });
});