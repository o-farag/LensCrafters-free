const { createProxyMiddleware } = require('http-proxy-middleware');

// work around from https://stackoverflow.com/questions/70374005/invalid-options-object-dev-server-has-been-initialized-using-an-options-object/70413065#70413065
module.exports = function(app) {
  app.use(
    '/data',
    createProxyMiddleware({
      target: 'http://127.0.0.1:5100',
      changeOrigin: true,
    })
  );
};