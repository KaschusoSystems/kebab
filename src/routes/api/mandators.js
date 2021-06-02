var router = require('express').Router();
const kaschusoApi = require('../../services/kaschuso-api');

router.get('/', async function (req, res, next) {
    return res.json(await kaschusoApi.getMandators());
});

module.exports = router;