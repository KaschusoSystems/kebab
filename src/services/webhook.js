const axios = require('axios');
const gmail = require('./gmail');
const logger = require('../domain/logger');

async function triggerWebhook(user, triggerName, payload) {
    logger.debug(`webhook.triggerWebhook.user-${user.username}`);
    axios.post(createIfttWebhookUri(user.iftttWebhookKey, triggerName), payload).catch(err => {
        logger.error(`webhook.triggerWebhook.user-${user.username}: ${err}`);
        gmail.sendIftttWebhookError(user);
        Promise.resolve(err)
    });
}

function createIfttWebhookUri(iftttWebhookKey, triggerName) {
    return `https://maker.ifttt.com/trigger/${triggerName}/with/key/${iftttWebhookKey}`;
}

module.exports = {
    triggerWebhook
};