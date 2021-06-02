import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from 'vuex-persistedstate';

import auth from "./auth.module";
import preferences from "./preferences.module";
import mandatorList from "./mandatorList.module";
import user from "./user.module";

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        auth,
        preferences,
        mandatorList,
        user
    },
    plugins: [createPersistedState({
        storage: window.sessionStorage,
    })],
});