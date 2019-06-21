

import autodraw from 'autodraw';

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

const shapes = [
    shape1
]

const mobileNet = {
    log:(req, res) => {
        (async () => {
            let result = await autodraw(shapes);
            res.send(result);
        })();
    },
    infer:(req, res) => {
        let received = req.body;
        const tosend = received.shapes.filter(item => item.length>0);
        (async () => {
            let result = await autodraw(tosend);
            res.json(result);
        })();
    }
}


export default mobileNet;