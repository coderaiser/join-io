Join-io
=======

Join files on a fly to reduce requests count.


## Install

`npm i join-io --save`

## Hot to use?

`Join-io` could be used as express middleware.

### Client

```html
<link rel="/join:/css/normilize.css:/css/style.css">
<script src="/join:/lib/client.js:/lib/util.js:/lib/jquery.js"></script>
```

### Server

```js
var join        = require('join-io'),
    http        = require('http'),
    express     = require('express'),
    
    app         = express(),
    server      = http.createServer(app),
    
    port        = 1337,
    ip          = '0.0.0.0';
    
app.use(join({
    dir: __dirname,
    minify: false /* default */
}));

app.use(express.static(__dirname));

server.listen(port, ip);
```

## License

MIT

