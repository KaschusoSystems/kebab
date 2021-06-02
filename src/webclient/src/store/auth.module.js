import {LOGIN, LOGOUT} from "./actions.type";
import AuthService from "../common/auth.service";
import {CHECK_AUTH, PURGE_AUTH, SET_AUTH, SET_ERROR, UPDATE_PASSWORD} from "./mutations.type";
import ApiService, {LoginService} from "../common/api.service";

//define states (variables)
const state = {
    isAuthenticated: false,
    isKaschusoAuthenticated: false,
    username: '',
    mandator: '',
    error: null,
};

//normal getter methods
const getters = {
    isAuthenticated(state) {
        return state.isAuthenticated;
    },
    username(state) {
        return state.username;
    },
    mandator(state) {
        return state.mandator;
    },
};

//setter or updater methods
const mutations = {
    //synchronous (state changes)
    [SET_AUTH](state, data) {
        state.isAuthenticated = true;
        state.isKaschusoAuthenticated = data.user.kaschusoAuthenticated;

        state.username = data.user.username;
        state.mandator = data.user.mandator;
        
        if (data.user.token) {
            AuthService.setToken(data.user.token);
        }
    },
    [PURGE_AUTH](state) {
        state.isAuthenticated = false;
        state.isKaschusoAuthenticated = false; 
        
        state.username = '';
        state.mandator = '';
        
        state.error = null;
        AuthService.purgeToken();
    },
    [SET_ERROR](state, error) {
        console.log(error);
        state.error = error.err;
    }
};

const actions = {
    //asynchronous (e.g. Requests)
    [LOGIN](state, payload) {
        return new Promise((resolve, reject) => {
            LoginService.login(payload)
                .then(response => {
                    state.commit(SET_AUTH, response.data);
                    resolve(response.data);
                }).catch(error => {
                state.commit(SET_ERROR, error.response);
                reject(error.response);
            });
        });
    },
    [UPDATE_PASSWORD](state, payload) {
        return new Promise((resolve, reject) => {
            LoginService.updatePassword(payload)
                .then(response => {
                    state.commit(SET_AUTH, response.data);
                    resolve(response.data);
                })
                .catch(error => {
                    state.commit(SET_ERROR, error.response);
                    reject(error.response);
                });
        });
    },
    [CHECK_AUTH](state) {
        if (AuthService.getToken()) {
            ApiService.setHeader();
        } else {
            state.commit(PURGE_AUTH);
        }
    },
    [LOGOUT](state) {
        state.commit(PURGE_AUTH);
        sessionStorage.clear();
        
        localStorage.removeItem('jwtToken');
        // localStorage.clear();
    },
}

export default {
    state,
    getters,
    actions,
    mutations
};