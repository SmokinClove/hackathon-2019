
import express from 'express';
import mobileNet from './mobilenet'
var router = express.Router();

// const SAVE = '/save';
const INFER = '/infer';
const DEBUG = '/debug';

router.get('/', function (req, res) {
    res.json({ message: 'API entry point is /api/<object>' })
});

router.route(INFER).post(mobileNet.infer);
router.route(INFER).get(mobileNet.log);
router.route(DEBUG).post(mobileNet.debug);
export default router;