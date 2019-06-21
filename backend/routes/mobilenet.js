

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

function saveknn(filename) {
    let dataset = classifier.getClassifierDataset()
    var datasetObj = {}
    Object.keys(dataset).forEach((key) => {
        let data = dataset[key].dataSync();
        // use Array.from() so when JSON.stringify() it covert to an array string e.g [0.1,-0.2...] 
        // instead of object e.g {0:"0.1", 1:"-0.2"...}
        datasetObj[key] = Array.from(data);
    });
    let jsonStr = JSON.stringify(datasetObj)
    //can be change to other source
    // console.log(jsonStr)
    // localStorage.setItem("myData", jsonStr);
    fs.writeFile(filename, jsonStr, function (err) {
        if (err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    }); 
}
async function loadknn(filename) {
    const rawdata = await fs.readFileSync(filename);
    console.log('loaded file', rawdata);
    let tensorObj = JSON.parse(rawdata)
    console.log(tensorObj)
    //covert back to tensor
    Object.keys(tensorObj).forEach((key) => {
        tensorObj[key] = tf.tensor(tensorObj[key], [tensorObj[key].length / 1024, 1024])
    })
    classifier.setClassifierDataset(tensorObj);
    console.log('classifier load success')
}

mobilenet.load().then(item => {
    // eslint-disable-next-line no-console
    console.log('mobilenetLoaded');
    model = item;
    const filename = 'knnmodel.json'
    if (!fs.existsSync(filename)) {
        loadknn('knnmodela.json').then(() => {
            classify(__dirname + '/square', 'square');
            classify(__dirname + '/diamond', 'diamond');
            classify(__dirname + '/triangle', 'triangle');
            saveknn(filename);
        });
        // classify(__dirname + '/rarrowset', 'rArrow');
        // classify(__dirname + '/uarrowset', 'uArrow');
        // classify(__dirname + '/darrowset', 'dArrow');
        // classify(__dirname + '/larrowset', 'lArrow');
        // classify(__dirname + '/ldArrow', 'ldArrow');
        // classify(__dirname + '/luArrow', 'luArrow');
        // classify(__dirname + '/rdArrow', 'rdArrow');
        // classify(__dirname + '/ruArrow', 'ruArrow');
    } else {
        loadknn(filename);
    }
       
    
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
    const filename = 'knnmodel.json'
    // saveknn(filename);
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
                // console.log(filteredResults, filteredResults.findIndex(item => specialShapes.has(item.name)));
                if (filteredResults.findIndex(item => specialShapes.has(item.name)) !== -1) {
                    //handle arrow here
                    const prediction = await identifyArrow(received.data);
                    const { label } = prediction;
                    autodrawFinal = { id: received.id, results: [label] };
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