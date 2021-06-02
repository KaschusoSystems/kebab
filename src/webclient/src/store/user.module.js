import {SET_ERROR} from "./mutations.type";
import {DELETE_USER, LOGOUT} from "./actions.type";
import {UserService} from "../common/api.service";

const actions = {
    //asynchronous (e.g. Requests)
    [DELETE_USER](state, payload) {
        return new Promise((resolve, reject) => {
            UserService.delete()
                .then(response => {
                    // state.dispatch('LOGOUT');
                    state.dispatch(LOGOUT, null, { root: true })
                    resolve(response.data);
                })
                .catch(error => {
                    state.commit(SET_ERROR, error.response);
                    reject(error.response);
                });
        });
    }
}

export default {
    actions
};