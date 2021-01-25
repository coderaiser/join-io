'use strict';

const {run} = require('madrun');

module.exports = {
    'lint': () => 'putout lib .madrun.js',
    'fix:lint': () => run('lint', '--fix'),
};

