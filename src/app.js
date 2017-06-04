const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const feathers = require('feathers');
const configuration = require('feathers-configuration');
const hooks = require('feathers-hooks');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio');

const middleware = require('./middleware');
const services = require('./services');
const appHooks = require('./app.hooks');

const authentication = require('./authentication');

const mongodb = require('./mongodb');

const app = feathers();

// Load app configuration
app.configure(configuration(path.join(__dirname, '..')));
// Enable CORS, security, compression, favicon and body parsing
app.use(cors());
app.use(helmet({
  frameguard: false
}));
app.use(compress());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder
app.use('/', feathers.static(app.get('public')));

// Set up Plugins and providers
app.configure(hooks());
app.configure(mongodb);
app.configure(rest());
app.configure(socketio({
  wsEngine: 'uws'
}));

app.configure(authentication);

// Set up our services (see `services/index.js`)
app.configure(services);
// Configure middleware (see `middleware/index.js`) - always has to be last
app.configure(middleware);
app.hooks(appHooks);

 app.configure(socketio(function(io) {
    io.on('connection', function(socket) {
      socket.emit('total_connections', Object.keys(io.sockets.sockets).length);
	      socket.on('channel', function (channel) {
  				socket.join(channel);
  				var connection = io.nsps['/'].adapter.rooms[channel];
          socket.emit('viewers', connection.length);
		    });
        socket.on('end', function (){
            socket.disconnect(0);
        });
        socket.on('redirect', function (argUsername, url){
          console.log("redirecting " + argUsername);
          socket.broadcast.emit('redirect', argUsername, url);
        });
        socket.on('reload', function (argUsername){
          console.log("reloading " + argUsername);
          socket.broadcast.emit('reload', argUsername);
        });
      });
    }))

module.exports = app;
