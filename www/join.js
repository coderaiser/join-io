'use strict';

/* global window */

const Scope = typeof window !== 'undefined' ? window : global;
const PREFIX = '/join';

if (typeof module === 'object' && module.exports)
    module.exports = join;
else
    Scope.join = join;

function join(prefix, names) {
    if (!names) {
        names = prefix;
        prefix = PREFIX;
    }
    
    if (!names)
        throw Error('names must be array!');
    
    return prefix + ':' + names.join(':');
}

