import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ApiService from "./common/api.service";
import {LOGOUT} from "./store/actions.type";
import {PATH_LOGIN, PATH_SETTINGS} from "./common/config";
import {CHECK_AUTH} from "./store/mutations.type";

import 'bootstrap/dist/css/bootstrap.css';

import VueSnackbar from "vue-snack";
import "vue-snack/dist/vue-snack.min.css";
Vue.use(VueSnackbar, {position: "bottom", time: 4000});

// VueLoading
import VueLoading from 'vue-loading-template';
Vue.use(VueLoading, /** options **/)

//ApiService
let onAuthError = function (){
  store.dispatch(LOGOUT).then(()=>{
    router.push(PATH_LOGIN);
  });
}
ApiService.init(onAuthError);

router.beforeEach((to, from, next) =>
    Promise.all([store.dispatch(CHECK_AUTH)]).then(next)
);

router.beforeEach((to, from, next) => {
  if (to.path === PATH_SETTINGS && !store.getters.isAuthenticated) {
    router.push(PATH_LOGIN);
  } else if (to.path === PATH_LOGIN && store.getters.isAuthenticated) {
    router.push(PATH_SETTINGS);
  } else {
    next();
  }
});

Vue.config.productionTip = false
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
