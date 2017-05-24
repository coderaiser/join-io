'use strict';

var path = require('path');
var zlib = require('zlib');

var files = require('files-io');
var ponse = require('ponse');
var Minify = require('minify');
var exec = require('execon');

var currify = require('currify/legacy');

var FILE = __dirname + '/../www/join.js';
var PREFIX = '/join';
var uglify = currify(_uglify);

module.exports = function(options) {
    return join.bind(null, options);
};

function join(options, req, res, next) {
    options = options || {};
    
    var prefix = options.prefix || PREFIX;
    var dir = options.dir || __dirname + '/../';
    var isFunc = typeof options.minify === 'function';
    var isMinify = isFunc ? options.minify() : options.minify;
    var read = exec.with(readPipe, req, res);
    var path = ponse.getPathName(req);
    
    var isJoin = !path.indexOf(prefix + ':');
    var isJoinFile = path === prefix + '/join.js';
    
    if (!isJoin && !isJoinFile)
        return next();
    
    var names;
    if (isJoinFile)
        names = [FILE];
    else
        names = parse(prefix, dir, path);
    
    exec.if(!isMinify, function(error, namesObj) {
        var is = typeof namesObj === 'object';
        
        if (is)
            names = names.map(function(key) {
                return namesObj[key] || key;
            });
        
        read(names);
    }, uglify(names));
    
    return isJoin;
}

function parse(prefix, dir, url) {
    var joinPath = prefix + prefix + '.js';
    var joinOpt = joinPath.replace(/^\//, '/?');
    var joinRegExp = RegExp(joinOpt);
    var isStr = typeof url === 'string';
    
    if (!isStr)
        throw(Error('url must be string!'));
    
    var names = url.replace(prefix + ':', '')
       .split(':')
       .map(function(name) {
           if (joinRegExp.test(name))
               return FILE;
            
           return path.join(dir, name);
       });
    
    return names;
}

function readPipe(req, res, names) {
    var path = ponse.getPathName(req);
    var gzip = zlib.createGzip();
    var isGzip = ponse.isGZIP(req);
    
    ponse.setHeader({
        name        : names[0],
        cache       : true,
        gzip        : isGzip,
        request     : req,
        response    : res
    });
    
    var stream = isGzip ? gzip : res;
    
    files.readPipe(names, stream, function(error) {
        if (!error)
            return;
        
        var msg = error.message;
        
        if (res.headersSent)
            return stream.end(msg);
        
        ponse.sendError(msg, {
            name        : path,
            gzip        : isGzip,
            request     : req,
            response    : res
        });
    });
    
    /* 
     * pipe should be setted up after
     * readPipe called with stream param
     */
    if (isGzip)
        gzip.pipe(res);
}

function minify(name, callback) {
    Minify(name, 'name', function(error, name) {
        callback(null, name);
    });
}

function retMinify(name) {
    return minify.bind(null, name);
}

function _uglify(names, callback) {
    var funcs = {};
    
    names.forEach(function(name) {
        funcs[name] = retMinify(name);
    });
    
    exec.parallel(funcs, callback);
}

