const axios = require('axios');

async function triggerWebhook(uri, payload) {
    console.log(`Triggering webhook event: ${JSON.stringify({ uri, payload })}`)
    await axios.post(uri, payload);
}

module.exports = {
    triggerWebhook
};
