const axios = require('axios');
const logger = require('../domain/logger');

const KASCHUSO_API_BASE_URI = process.env.KASCHUSO_API_URI || 'http://localhost:3001/api';

function createUrlParameter(username, password, mandator) {
    return `mandator=${encodeURIComponent(mandator)}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
}

async function login(username, password, mandator) {
    logger.debug(`kaschuso-api.login.invoked.user-${username}.mandator-${mandator}`);
    const uri = `${KASCHUSO_API_BASE_URI}/authenticate?${createUrlParameter(username, password, mandator)}`;
    return axios.get(uri).then(res => {
            return res.status === 200;
        }).catch(error => {
            logger.error(`kaschuso-api.login: ${error}`);
            return false
        });
}

async function getUserInfo(user) {
    logger.debug(`kaschuso-api.getUserInfo.invoked.user-${user.username}`);
    const uri = `${KASCHUSO_API_BASE_URI}/user/info?${createUrlParameter(user.username, user.getDecryptedPassword(), user.mandator)}`;
    const res = await axios.get(uri);
    return res.data.userInfo;
} 

async function scrapeGrades(user) {
    logger.debug(`kaschuso-api.scrapeGrades.invoked.user-${user.username}`);
    const uri = `${KASCHUSO_API_BASE_URI}/grades?${createUrlParameter(user.username, user.getDecryptedPassword(), user.mandator)}`;
    const res = await axios.get(uri);
    return res.data.subjects;
}

async function scrapeAbsences(user) {
    logger.debug(`kaschuso-api.scrapeAbsences.invoked.user-${user.username}`);
    const uri = `${KASCHUSO_API_BASE_URI}/absences?${createUrlParameter(user.username, user.getDecryptedPassword(), user.mandator)}`;
    const res = await axios.get(uri);
    return res.data.absences;
}

async function getMandators() {
    logger.debug('kaschuso-api.getMandators.invoked');
    const uri = `${KASCHUSO_API_BASE_URI}/mandators`;
    const res = await axios.get(uri);
    return res.data.mandators;
}

module.exports = {
    login,
    scrapeGrades,
    scrapeAbsences,
    getUserInfo,
    getMandators
};