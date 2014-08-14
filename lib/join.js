(function() {
    'use strict';
    
    var DIR         = '../',
        DIR_SERVER  = DIR + 'server/',
        files       = require(DIR_SERVER + 'files'),
        ponse       = require(DIR_SERVER + 'ponse'),
        
        Minify      = require(DIR_SERVER + 'minify'),
        
        Util        = require(DIR + 'util'),
        
        path        = require('path'),
        zlib        = require('zlib'),
        
        PREFIX      = '/join';
    
    module.exports  = function(options) {
        return join.bind(null, options);
    };
    
    function join(options, req, res, next) {
        var prefix, dir,
            names,
            isMinify,
            isFunc,
            exec        = Util.exec,
            read        = exec.with(readPipe, req, res),
            path        = ponse.getPathName(req),
            regExp      = new RegExp('^' + PREFIX + ':'),
            regExpFile  = new RegExp('^' + PREFIX + '/join.js$'),
            isJoin      = path.match(regExp),
            isJoinFile  = path.match(regExpFile);
        
        if (!options)
            options = {};
        
        isFunc  = Util.isFunction(options.minify);
        
        if (isFunc)
            isMinify = options.minify();
        else
            isMinify = options.minify;
        
        if (isJoinFile) {
            ponse.sendFile({
                name    : __dirname + '/../join.js',
                gzip    : true,
                request : req,
                response: res
            });
        } else if (!isJoin) {
            next();
        } else {
            prefix  = options.prefix || PREFIX;
            dir     = options.dir || __dirname + '/../../';
            
            names   = parse(prefix, dir, path);
            
            exec.if(!isMinify, function(namesNew) {
                var is      = Util.isArray(namesNew);
                
                if (is)
                    names = namesNew;
                
                read(names);
            }, function(callback) {
                uglify(names, callback);
            });
        }
        
        return isJoin;
    }
    
    function parse(prefix, dir, url) {
        var names,
            isStr    = typeof url === 'string';
        
        if (!isStr)
            throw(Error('url must be string!'));
            
        names = url.replace(prefix + ':', '')
                   .split(':')
                   .map(function(name) {
                        return path.join(dir, name);
                   });
        
        return names;
    }
    
    function readPipe(req, res, names) {
        var stream,
            path        = ponse.getPathName(req),
            gzip        = zlib.createGzip(),
            isGzip      = ponse.isGZIP(req);
            
        ponse.setHeader({
            name        : names[0],
            cache       : true,
            gzip        : isGzip,
            request     : req,
            response    : res
        });
        
        stream = isGzip ? gzip : res;
        
        files.readPipe(names, stream, function(error) {
            var msg = '';
            
            if (error) {
                Util.log(error);
                msg = error.message;
                
                if (res.headersSent)
                    stream.end(msg);
                else
                    ponse.sendError(msg, {
                        name        : path,
                        gzip        : isGzip,
                        request     : req,
                        response    : res
                    });
            }
        }
        );
        
        /* 
         * pipe should be setted up after
         * readPipe called with stream param
         */
        if (isGzip)
            gzip.pipe(res);
    }
    
    function minify(name, callback) {
        Minify.optimize(name, callback);
    }
    
    function retMinify(name) {
        return minify.bind(null, name);
    }
    
    function checkExt(name) {
        var ret;
        
        ret = Util.checkExt(name, ['js', 'css', 'html']);
        
        return ret;
    }
    
    function uglify(names, callback) {
        var func,
            funcs   = [];
        
        names = names.map(function(name) {
            var is;
            
            funcs.push(retMinify(name));
            is      = checkExt(name);
            
            if (is) {
                name = Minify.getName(name);
            }
            
            return name;
        });
        
        func = Util.exec.ret(callback, names);
        
        Util.exec.parallel(funcs, func);
    }
})();
