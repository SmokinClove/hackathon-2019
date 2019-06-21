
//packages
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import project_routes from './routes';
// require('@tensorflow/tfjs-node');

var app = express();
app.use(cors());

app.use(express.static('public'))
app.use(bodyParser.urlencoded({
    parameterLimit: 100000,
    limit: '5000mb',
    extended: true
}));
app.use(bodyParser.json({limit: '5000mb'}));

// app.use(express.bodyParser({ limit: '50mb' }));

//port can be overwritten here
var port = process.env.PORT || 8080;

//API routes
app.use('/api', project_routes);

app.listen(port);
console.log('Server started, listening on port: ' + port);