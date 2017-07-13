'use strict';

const path = require('path');
const zlib = require('zlib');

const files = require('files-io');
const ponse = require('ponse');
const exec = require('execon');

const currify = require('currify/legacy');

const FILE = __dirname + '/../www/join.js';
const PREFIX = '/join';
const uglify = currify(_uglify);

module.exports = (options) => {
    return join.bind(null, options);
};

function join(options, req, res, next) {
    options = options || {};
    
    const prefix = options.prefix || PREFIX;
    const dir = options.dir || __dirname + '/../';
    const path = ponse.getPathName(req);
    
    const isJoin = !path.indexOf(prefix + ':');
    const isJoinFile = path === prefix + '/join.js';
    
    if (!isJoin && !isJoinFile)
        return next();
    
    const names;
    if (isJoinFile)
        names = [FILE];
    else
        names = parse(prefix, dir, path);
    
    readPipe(req, res, names);
    
    return isJoin;
}

function parse(prefix, dir, url) {
    const joinPath = prefix + prefix + '.js';
    const joinOpt = joinPath.replace(/^\//, '/?');
    const joinRegExp = RegExp(joinOpt);
    const isStr = typeof url === 'string';
    
    if (!isStr)
        throw(Error('url must be string!'));
    
    const names = url.replace(prefix + ':', '')
       .split(':')
       .map((name) => {
           if (joinRegExp.test(name))
               return FILE;
            
           return path.join(dir, name);
       });
    
    return names;
}

function readPipe(request, response, names) {
    const path = ponse.getPathName(req);
    const gzip = zlib.createGzip();
    const gzip = ponse.isGZIP(req);
    const name = names[0];
    const cache = true;
    
    ponse.setHeader({
        name,
        cache,
        gzip,
        request,
        response,
    });
    
    const stream = isGzip ? gzip : res;
    
    files.readPipe(names, stream, (error) => {
        if (!error)
            return;
        
        const msg = error.message;
        
        if (res.headersSent)
            return stream.end(msg);
        
        ponse.sendError(msg, {
            name        : path,
            gzip,
            request,
            response,
        });
    });
    
    /* 
     * pipe should be setted up after
     * readPipe called with stream param
     */
    if (isGzip)
        gzip.pipe(res);
}

