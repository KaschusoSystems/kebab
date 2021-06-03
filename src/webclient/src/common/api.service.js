import Vue from "vue";
import axios from "axios";
import VueAxios from "vue-axios";
import AuthService from "./auth.service";

const ApiService = {
    init(onAuthError /*function*/) {
        Vue.use(VueAxios, axios);
        Vue.axios.defaults.baseURL = '/api';
        //if user token is invalid
        Vue.axios.interceptors.response.use(response => {
            return response;
        }, error => {
            if (error.response.status === 401 && AuthService.getToken()) {
                alert("Fehler bei Authentifizierung!");
                onAuthError();
            }
            return Promise.reject(error);
        });
    },

    setHeader() {
        Vue.axios.defaults.headers.common[
            "Authorization"
            ] = `Bearer ${AuthService.getToken()}`;
    },

    clearHeader() {
        delete Vue.axios.defaults.headers.common["Authorization"];
    },

    get(resource, subResource = "") {
        return Vue.axios.get(`${resource}/${subResource}`).catch(error => {
            throw new Error(`ApiService ${error}`);
        });
    },

    search(resource, params) {
        return Vue.axios.get(resource, params).catch(error => {
            throw new Error(`ApiService ${error}`);
        });
    },

    post(resource, payload) {
        if (resource === "auth") {
            this.clearHeader();
        }
        return Vue.axios.post(resource, payload);
    },

    put(resource, payload) {
        return Vue.axios.put(resource, payload);
    },

    delete(resource, params) {
        return Vue.axios.delete(resource, params).catch(error => {
            throw new Error(`ApiService ${error}`);
        });
    },
};

export default ApiService;

export const LoginService = {
    login(payload){
        return ApiService.post("/users/login", payload);
    },
    updatePassword(payload) {
        return ApiService.put("/user/auth", payload);
    }
};

export const UserService = {
    delete(){
        return ApiService.delete("/user");
    }
};

export const PreferencesService = {
    update(payload){
        return ApiService.put("/user", payload);
    },
    fetch(payload){
        return ApiService.get("/user", payload);
    },
};

export const MandatorListService = {
    fetch(payload){
        return ApiService.get("/mandators");
    },
};