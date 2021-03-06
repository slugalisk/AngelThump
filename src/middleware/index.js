const handler = require('@feathersjs/express/errors');
const notFound = require('feathers-errors/not-found');
const auth = require('@feathersjs/authentication');
const path = require('path');
const signup = require('./signup');
const events = require('./nginx_events');
const authManagement = require('./authManagement');
const patreonAPI = require('./patreonAPI');
const patreonWebhooks = require('./patreonWebhooks');
const api = require('./api');
const admin = require('./admin');
const embed = require('./embed');
const cache = require('apicache').middleware;

module.exports = function () {
  const app = this;

  app.set('view engine', 'ejs');
  app.set('views', 'public');

  app.get('/embed/:username', embed(app));

  //test-bed
  app.get('/embed-test/:username', function(req, res, next){
    res.render('embed-test', {username: req.params.username});
  });

  app.get('/api', cache('30 seconds'), api.all(app));

  app.get('/api/:username', cache('30 seconds'), api.individual(app));

  app.get('/admin/reload/:username', admin.reload(app));

  app.get('/admin/redirect/:username/:puntUsername', admin.redirect(app));

  app.get('/dmca', function(req, res, next){
    res.sendFile('dmca.html', { root: path.join(__dirname, '../../public') });
  });
  app.get('/privacy', function(req, res, next){
    res.sendFile('privacy.html', { root: path.join(__dirname, '../../public') });
  });
  app.get('/tos', function(req, res, next){
    res.sendFile('tos.html', { root: path.join(__dirname, '../../public') });
  });
  app.get('/profile', function(req, res, next){
    res.redirect(301, 'https://angelthump.com/dashboard');
  });
  app.get('/dashboard', function(req, res, next){
    res.sendFile('dashboard.html', { root: path.join(__dirname, '../../public') });
  });
  app.get('/settings', function(req, res, next){
    res.redirect(301, 'https://angelthump.com/dashboard/settings');
  });
  app.get('/dashboard/settings', function(req, res, next){
    res.sendFile('settings.html', { root: path.join(__dirname, '../../public') });
  });
  app.get('/patreon', function(req, res, next){
    res.redirect(301, 'https://angelthump.com/dashboard/patreon');
  });
  app.get('/dashboard/patreon', function(req, res, next){
    res.sendFile('patreon.html', { root: path.join(__dirname, '../../public') });
  });
  app.get('/login', function(req, res, next){
    res.sendFile('login.html', { root: path.join(__dirname, '../../public') });
  });
  app.get('/signup', function(req, res, next){
    res.sendFile('signup.html', { root: path.join(__dirname, '../../public') });
  });
  app.get('/reset', function(req, res, next){
    res.sendFile('reset.html', { root: path.join(__dirname, '../../public') });
  });

  app.get('/donate', function(req, res, next){
    res.redirect(301, 'https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=3VKPL7E8RSL38');
  });

  app.get('/reset_email', function(req, res, next){
    res.sendFile('reset_email.html', { root: path.join(__dirname, '../../public') });
  });

  app.get('/reset_password', function(req, res, next){
    res.sendFile('reset_password.html', { root: path.join(__dirname, '../../public') });
  });

  app.get('/patron', function(req, res, next){
    res.sendFile('patron.html', { root: path.join(__dirname, '../../public') });
  });
  app.post('/patron', patreonAPI(app));

  app.post('/patreon/create', patreonWebhooks.create(app));
  app.post('/patreon/update', patreonWebhooks.update(app));
  app.post('/patreon/delete', patreonWebhooks.delete(app));

  app.get('/resend-email/:email', authManagement.resend(app));

  app.get('/management/:type(verify||reset||verifyChanges)/:hash', authManagement(app));

  app.post('/signup', signup(app));
  app.get('/checkPassword', function(req, res, next){
    res.sendFile('checkPassword.html', { root: path.join(__dirname, '../../public') });
  });
  app.post('/checkPassword', admin.checkPassword(app));

  app.post('/live', events.stream(app));
  app.post('/done', events.done(app));

  app.use(notFound());

  app.use(handler({
    html: function(error, req, res, next) {
        res.render('errors.ejs', {code: error.code, message: error.message});
    }
  }));
};
