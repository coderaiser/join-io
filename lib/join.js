'use strict';

const path = require('path');
const zlib = require('zlib');

const files = require('files-io');
const ponse = require('ponse');

const FILE = __dirname + '/../www/join.js';
const PREFIX = '/join';

module.exports = (options) => {
    return join.bind(null, options);
};

function join(options, req, res, next) {
    options = options || {};
    
    const prefix = options.prefix || PREFIX;
    const dir = options.dir || __dirname + '/../';
    const name = ponse.getPathName(req);
    
    const isJoin = !name.indexOf(prefix + ':');
    const isJoinFile = name === prefix + '/join.js';
    
    if (!isJoin && !isJoinFile)
        return next();
    
    const getNames = (isJoinFile) => {
        if (isJoinFile)
            return [FILE];
        
        return parse(prefix, dir, name);
    };
    
    const names = getNames(isJoinFile);
    
    readPipe(req, res, names);
    
    return isJoin;
}

function parse(prefix, dir, url) {
    const joinPath = prefix + prefix + '.js';
    const joinOpt = joinPath.replace(/^\//, '/?');
    const joinRegExp = RegExp(joinOpt);
    const isStr = typeof url === 'string';
    
    if (!isStr)
        throw Error('url must be string!');
    
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
    const gzip = ponse.isGZIP(request);
    const name = names[0];
    const cache = true;
    
    ponse.setHeader({
        name,
        cache,
        gzip,
        request,
        response,
    });
    
    const stream = !gzip ? response : zlib.createGzip();
    
    files.readPipe(names, stream).catch((error) => {
        if (!error)
            return;
        
        const msg = error.message;
        
        if (response.headersSent)
            return stream.end(msg);
        
        const name = ponse.getPathName(request);
        ponse.sendError(msg, {
            name,
            gzip,
            request,
            response,
        });
    });
    
    /*
     * pipe should be setted up after
     * readPipe called with stream param
     */
    if (gzip)
        stream.pipe(response);
}

