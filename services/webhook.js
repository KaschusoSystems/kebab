const axios = require('axios');

async function triggerWebhook(iftttWebhookKey, triggerName, payload) {
    console.log(`Triggering webhook event: ${JSON.stringify({ triggerName, payload })}`)
    await axios.post(createIfttWebhookUri(iftttWebhookKey, triggerName), payload);
}

function createIfttWebhookUri(iftttWebhookKey, triggerName) {
    return `https://maker.ifttt.com/trigger/${triggerName}/with/key/${iftttWebhookKey}`;
}

module.exports = {
    triggerWebhook
};