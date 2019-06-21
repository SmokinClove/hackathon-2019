
//packages
import express from 'express';
var app = express();
import bodyParser from 'body-parser';
import project_routes from './routes';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//port can be overwritten here
var port = process.env.PORT || 8080;

//API routes
app.use('/api', project_routes);

app.listen(port);
console.log('Server started, listening on port: ' + port);