import {CLEAR, SET_ERROR, SET_MANDATORLIST} from "./mutations.type";
import {FETCH_MANDATORLIST} from "./actions.type";
import {MandatorListService} from "../common/api.service";

//define states (variables)
const state = {
    mandatorList: [],
    error: null,
};

//normal getter methods
const getters = {
    mandatorList(state) {
        return state.mandatorList;
    },
};

//setter or updater methods
const mutations = {
    //synchronous (state changes)
    [SET_MANDATORLIST](state, data) {
        state.mandatorList = data;
    },
    [SET_ERROR](state, error) {
        console.log(error);
        state.error = error;
    },
    [CLEAR](state, clearAll) {
        if(clearAll){
            state.mandatorList = [];
        }
    },
};

const actions = {
    [FETCH_MANDATORLIST](state, payload) {
        return new Promise((resolve, reject) => {
            MandatorListService.fetch().then(({data}) => {
                state.commit(SET_MANDATORLIST, data);
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