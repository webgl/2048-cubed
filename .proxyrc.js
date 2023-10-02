const path = require('path');
const serveStatic = require('serve-static');

module.exports = function (app) {
  app.use(serveStatic(path.join(__dirname, 'src/assets')));
}