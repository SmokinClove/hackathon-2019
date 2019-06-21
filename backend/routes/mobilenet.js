

import autodraw from 'autodraw';
import { adjustedExpectedShapes, specialExpectedShapes } from '../autoDrawToShape';
import * as mobilenet from '@tensorflow-models/mobilenet'
import  * as tf from '@tensorflow/tfjs';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
// import atob from 'atob';

const classifier = knnClassifier.create();

import fs from 'fs';
import jpeg from 'jpeg-js';
// import { array } from '@tensorflow/tfjs-data';

const NUMBER_OF_CHANNELS = 3

let model;
const imageByteArray = (image, numChannels) => {
    const pixels = image.data
    const numPixels = image.width * image.height;
    const values = new Int32Array(numPixels * numChannels);

    for (let i = 0; i < numPixels; i++) {
        for (let channel = 0; channel < numChannels; ++channel) {
            values[i * numChannels + channel] = pixels[i * 4 + channel];
        }
    }
    return values
}

const imageToInput = (image, numChannels) => {
    const values = imageByteArray(image, numChannels)
    const outShape = [image.height, image.width, numChannels];
    const input = tf.tensor3d(values, outShape, 'int32');
    return input
}

const classify = (directory, classname) => {
    const files = fs.readdirSync(directory);
    // console.log(directory)
    for (let i=0; i<files.length; i++) {
        console.log(directory + '/' + files[i], files[i].slice(-4) );
        if (files[i].slice(-4) === '.jpg'){
            const buf = fs.readFileSync(directory + '/' + files[i]);
            const image = jpeg.decode(buf, true);
            const input = imageToInput(image, NUMBER_OF_CHANNELS);
            const activation = model.infer(input, 'conv_preds');
            // Pass the intermediate activation to the classifier.
            classifier.addExample(activation, classname);
            console.log('classifying' + files[i]);
        }
    }
    console.log(classname + 'classified');
}


mobilenet.load().then(item => {
    // eslint-disable-next-line no-console
    console.log('mobilenetLoaded');
    model = item;

    classify(__dirname + '/rarrowsettest', 'rArrow');
    classify(__dirname + '/uarrowsettest', 'uArrow');
    classify(__dirname + '/darrowsettest', 'dArrow');
    classify(__dirname + '/larrowsettest', 'lArrow');
    // Get the activation from mobilenet from the webcam.
});

const shape1 = [
    {
        x: 10,
        y: 5
    },
    {
        x: 40,
        y: 10
    }
]

const testShapes = [
    shape1
]

const shapes = new Set(adjustedExpectedShapes);

const specialShapes = new Set(specialExpectedShapes);

async function identifyArrow(data) {
    // console.log(rawImageData);
    // const input = imageToInput(image, NUMBER_OF_CHANNELS);
    const input = imageToInput(data, NUMBER_OF_CHANNELS);
    // const predictions = await model.classify(input);


    const activation = model.infer(input, 'conv_preds');
    // Get the most likely class and confidences from the classifier module.
    let result = await classifier.predictClass(activation);
    
    console.log('classification results:', result);
    return result;
}

const mobileNet = {
    log:(req, res) => {
        (async () => {
            let result = await autodraw(testShapes);
            res.send(result);
        })();
    },
    infer:(req, res) => {
        let received = req.body;
        const tosend = received.shapes.filter(item => item.length > 0);
        (async () => {
            if (tosend.length > 0) {
                let result = await autodraw(tosend);
                let filteredResults = result.map(item => {
                    return {
                        name: item.name,
                        confidence: item.confidence
                    };
                }).filter(item => shapes.has(item.name));
                let autodrawFinal;
                console.log(filteredResults, filteredResults.findIndex(item => specialShapes.has(item.name)));
                if (filteredResults.findIndex(item => specialShapes.has(item.name)) !== -1) {
                    //handle arrow here
                    const prediction = await identifyArrow(received.data);
                    autodrawFinal = { id: received.id, results: [prediction] };
                } else {
                    if (filteredResults.length > 1) {
                        
                        filteredResults = filteredResults.reduce(function (a, b) {
                            const higherConfidence = Math.max(a.confidence, b.confidence)
                            return a.confidence === higherConfidence ? a : b;
                        })
                        autodrawFinal = { id: received.id, results: [filteredResults] };
                        
                    } else {
                        autodrawFinal = { id: received.id, results: filteredResults };
                    }
                }
                res.json(autodrawFinal)
            } else {
                res.json({id: received.id, results: []});
            }
        })();
    },
    debug: (req, res) => {
        let received = req.body;
        const tosend = received.shapes.filter(item => item.length > 0);
        (async () => {
            if (tosend.length > 0) {
                let result = await autodraw(tosend);
                let filteredResults = result.map(item => {
                    return {
                        name: item.name,
                        confidence: item.confidence
                    };
                }).filter(item => shapes.has(item.name));
                
                res.json({ id: received.id, results: filteredResults });
            } else {
                res.json({ id: received.id, results: [] });
            }

        })();
    }
}


export default mobileNet;