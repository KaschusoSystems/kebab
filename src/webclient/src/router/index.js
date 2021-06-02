import Vue from 'vue';
import VueRouter from 'vue-router';
import {PATH_LOGIN, PATH_AUTH, PATH_SETTINGS} from "../common/config";

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        redirect: PATH_LOGIN,
    },
    {
        path: PATH_LOGIN,
        name: 'Login',
        component: () => import('../views/Login')
    },
    {
        path: PATH_AUTH,
        name: 'Auth',
        component: () => import('../views/Auth')
    },
    {
        path: PATH_SETTINGS,
        name: 'Settings',
        component: () => import('../views/Settings')
    },
    {
        path :'*',
        component: () => import('../views/NotFound')
    }
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

export default router;