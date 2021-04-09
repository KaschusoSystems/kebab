const axios = require('axios');
const KASCHUSO_API_BASE_URI = process.env.KASCHUSO_API_URI ? process.env.KASCHUSO_API_URI : 'hhttp://localhost:3001/api';

function createUrlParameter(username, password, mandator) {
    return `mandator=${encodeURIComponent(mandator)}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
}

async function login(username, password, mandator) {
    const uri = `${KASCHUSO_API_BASE_URI}/authenticate?${createUrlParameter(username, password, mandator)}`;
    try {
        const res = await axios.get(uri);
        if (res.status === 200) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}

async function getUserInfo(user) {
    const uri = `${KASCHUSO_API_BASE_URI}/user/info?${createUrlParameter(user.username, user.password, user.mandator)}`;
    const res = await axios.get(uri);
    return res.data.userInfo;
} 

async function scrapeGrades(user) {
    const uri = `${KASCHUSO_API_BASE_URI}/grades?${createUrlParameter(user.username, user.password, user.mandator)}`;
    const res = await axios.get(uri);
    return res.data.grades;
}

async function scrapeAbsences(user) {
    const uri = `${KASCHUSO_API_BASE_URI}/absences?${createUrlParameter(user.username, user.password, user.mandator)}`;
    const res = await axios.get(uri);
    return res.data.absences;
}

module.exports = {
    login,
    scrapeGrades,
    scrapeAbsences,
    getUserInfo
};