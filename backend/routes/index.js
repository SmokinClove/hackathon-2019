
import express from 'express';
import mobileNet from './mobilenet'
var router = express.Router();

// const SAVE = '/save';
const INFER = '/infer';

router.get('/', function (req, res) {
    res.json({ message: 'API entry point is /api/<object>' })
});

router.route(INFER).post(mobileNet.log);
router.route(INFER).get(mobileNet.log);
//for every new schema, write routes for them
//import functions from controller file
// var exampleController = require('../controllers/example.controller.js');
//routes for each function
// router.route('/example').post(exampleController.createExample);
// router.route('/example').get(exampleController.retrieveAllExample);
// //routes using id in the url
// router.route('/example/:example_id').get(exampleController.retrieveOneExample);
// router.route('/example/:example_id').post(exampleController.updateExample);
// router.route('/example/:example_id').delete(exampleController.deleteExample);

export default router;