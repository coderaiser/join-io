Join-io
=======

Join files on a fly to reduce requests count.


## Install

`npm i join-io --save`

## How it works?

`join-io` it's middleware that works with streams: open files and pipe them to `response` one-by-one,
when everything is done, stream is closing. `join-io` based on readPipe function of [files-io](https://github.com/coderaiser/files-io "Files-io").

[jsDelivr](https://jsdelivr.com/ "jsDelivr") works in similar way: [load Multiple files with a single HTTP request](https://www.maxcdn.com/blog/jsdelivr-better/ "load Multiple files with a single HTTP").

## How to use?

`Join-io` could be used as express middleware.

### Client

```html
<link rel="/join:/css/normilize.css:/css/style.css">
<script src="/join:/lib/client.js:/lib/util.js:/lib/jquery.js"></script>
```

#### Join.js

You could build join urls dynamically. Load `/join/join.js` library for this purpose.

```html
<script src="/join/join.js"></script>
<script>
    join(['lib/client', 'lib/util.js']);
</script>
```

To decrease requests count you could make `/join/join.js` part of request:

```html
<script src="/join:/lib/client.js:/lib/util.js:/join/join.js"></script>
```

Instead of `/join` you could use any prefix you like (don't forget to set it on the server side).

### Server

```js
const join = require('join-io');
const http = require('http');
const express = require('express');

const app = express();
const server = http.createServer(app);

const port = 1337;
const ip = '0.0.0.0';

app.use(join({
    dir: __dirname,
    prefix: '/join',    /* default */
}));

app.use(express.static(__dirname));

server.listen(port, ip);
```

## License

MIT

