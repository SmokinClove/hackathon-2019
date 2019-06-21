
//packages
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import project_routes from './routes';

var app = express();
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//port can be overwritten here
var port = process.env.PORT || 8080;

//API routes
app.use('/api', project_routes);

app.listen(port);
console.log('Server started, listening on port: ' + port);