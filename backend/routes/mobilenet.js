

import autodraw from 'autodraw';
import expectedShapes from '../expectedShapes';

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

const shapes = new Set(expectedShapes);

const mobileNet = {
    log:(req, res) => {
        (async () => {
            let result = await autodraw(testShapes);
            res.send(result);
        })();
    },
    infer:(req, res) => {
        let received = req.body;
        const tosend = received.shapes.filter(item => item.length>0);
        (async () => {
            let result = await autodraw(tosend);
            let filteredResults = result.map(item => {
                return {
                    name: item.name,
                    confidence: item.confidence
                };
            }).filter(item => shapes.has(item.name));
            // console.log(result);
            // console.log(filteredResults);
            filteredResults = filteredResults.reduce(function (a, b) {
                const higherConfidence = Math.max(a.confidence, b.confidence)
                return a.confidence === higherConfidence ? a : b;
            });
            res.json({result: filteredResults});
        })();
    },
    debug: (req, res) => {
        let received = req.body;
        const tosend = received.shapes.filter(item => item.length > 0);
        (async () => {
            let result = await autodraw(tosend);
            let filteredResults = result.map(item => {
                return {
                    name: item.name,
                    confidence: item.confidence
                };
            });
            
            res.json({ result: filteredResults });
        })();
    }
}


export default mobileNet;