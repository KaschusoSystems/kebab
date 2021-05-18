const axios = require('axios');
const gmail = require('./gmail');

async function triggerWebhook(user, triggerName, payload) {
    console.log(`Triggering webhook event for user '${user.username}': ${JSON.stringify({ triggerName, payload })}`)
    axios.post(createIfttWebhookUri(user.iftttWebhookKey, triggerName), payload).catch(err => {
        console.log(`Error triggering webhook for user '${user.username}': ${err}`);
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