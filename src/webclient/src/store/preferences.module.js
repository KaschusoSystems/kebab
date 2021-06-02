import {CLEAR, SET_ERROR, SET_PREFERENCES} from "./mutations.type";
import {UPDATE_PREFERENCES, FETCH_PREFERENCES} from "./actions.type";
import {PreferencesService} from "../common/api.service";

//define states (variables)
const state = {
    preferences: {
        gradeNotifications: false,
        absenceNotifications: false,
        absenceReminders: false,
        monthlySummary: false,
        iftttWebhookKey: undefined
    },
    error: null,
};

//normal getter methods
const getters = {
    preferences(state) {
        return state.preferences;
    },
};

//setter or updater methods
const mutations = {
    //synchronous (state changes)
    [SET_PREFERENCES](state, data) {
        state.preferences = data;
    },
    [SET_ERROR](state, error) {
        console.log(error);
        state.error = error;
    },
    [CLEAR](state) {
        state.preferences = {
            gradeNotifications: false,
            absenceNotifications: false,
            absenceReminders: false,
            monthlySummary: false,
            iftttWebhookKey: undefined
        };
    },
};

const actions = {
    //asynchronous
    [UPDATE_PREFERENCES](state, payload) {
        return new Promise((resolve, reject) => {
            PreferencesService.update(payload).then(({data}) => {
                resolve(data);
            }).catch(error => {
                state.commit(SET_ERROR, error);
                reject(error);
            });
        });
    },
    [FETCH_PREFERENCES](state, payload) {
        return new Promise((resolve, reject) => {
            PreferencesService.fetch(payload).then(({data}) => {
                state.commit(SET_PREFERENCES, data.user);
                resolve(data);
            }).catch(error => {
                state.commit(SET_ERROR, error);
                reject(error);
            });
        });
    },
}

export default {
    state,
    getters,
    actions,
    mutations
};