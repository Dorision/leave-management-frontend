const PROXY_CONFIG = {
  "/api/*": {
    "target": "http://127.0.0.1:5254",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug",
    "headers": {
      "Connection": "keep-alive"
    },
    "bypass": function(req, res, proxyOptions) {
      console.log('[PROXY] Request URL:', req.url);
      console.log('[PROXY] Method:', req.method);
      console.log('[PROXY] Target:', proxyOptions.target);
    }
  }
};

module.exports = PROXY_CONFIG;