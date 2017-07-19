const getPackage = require('get-repo-package-json')
const request = require('request');

getPackage('https://github.com/substack/stream-handbook', function(err, pkg) {
    if (err) throw err
    let tmp = pkg.dependencies;
    // pkg is a JSON object 
})