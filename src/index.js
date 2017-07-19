const request = require('request');
const cheerio = require('cheerio');
const semver = require('semver');
const getPackage = require('get-repo-package-json');

function getRepoVersion(pkgName) {
    return new Promise((resolve, reject) => {
        request.get('https://www.npmjs.com/package/' + pkgName, function(err, remoteResponse, remoteBody) {
            if (err) {
                reject(err);
            }
            let $ = cheerio.load(remoteBody);
            let curVersion = $('.box li strong').eq(0).text();

            resolve(curVersion);
        });
    });
}

function getPackageJSON(path) {
    console.log(111);
    return new Promise((resolve, reject) => {
        getPackage(path, function(err, pkg) {
            if (err) console.log(err);
            //console.log(pkg);

            let arr = [];
            let size = Object.keys(pkg.dependencies).length;
            let counter = 0;
            Object.keys(pkg.dependencies).forEach(function(name, index) {
                let version = pkg.dependencies[name];

                arr.push({ name, version });
                if (index === size - 1) {
                    arr.map((i) => {
                        getRepoVersion(i.name).then(lastV => {
                            counter++;
                            let required = i.version;
                            if (required.indexOf('^') === 0) required = required.replace('^', '');
                            if (required.indexOf('~') === 0) required = required.replace('~', '');
                            i.diff = semver.diff(required, lastV);
                            i.lastV = lastV;
                            if (counter === arr.length) resolve(arr);
                        })
                    })
                }
            });

            if (err) {
                console.log(err);
                return;
            }

        });
    })
}

function getAll(path) {
    return new Promise((resolve, reject) => {
        getPackageJSON(path).then(list => {
            let arr = list.map(i => { return i.name });
            Promise.all(arr.map(getRepoVersion))
                .then(results => {
                    console.log(results);
                    resolve(results);
                });
        })
    });

}

// function getPackageJSON(path) {
//     getPackage(path, function(err, pkg) {
//         if (err) throw err
//         console.log(pkg.dependencies);

//     })
//     return new Promise((resolve, reject) => {
//         request.get(path, function(err, remoteResponse, remoteBody) {
//             if (remoteResponse.statusCode !== 200) return reject('error request.bad url!');
//             let tmp = JSON.parse(remoteBody);
//             let arr = [];
//             let size = Object.keys(tmp.dependencies).length;
//             let counter = 0;
//             Object.keys(tmp.dependencies).forEach(function(name, index) {
//                 let version = tmp.dependencies[name];

//                 arr.push({ name, version });
//                 if (index === size - 1) {
//                     arr.map((i) => {
//                         getRepoVersion(i.name).then(lastV => {
//                             counter++;
//                             let required = i.version;
//                             if (required.indexOf('^') === 0) required = required.replace('^', '');
//                             if (required.indexOf('~') === 0) required = required.replace('~', '');
//                             i.diff = semver.diff(required, lastV);
//                             i.lastV = lastV;
//                             if (counter === arr.length) resolve(arr);
//                         })
//                     })
//                 }
//             });

//             if (err) {
//                 console.log(err);
//                 return;
//             }
//         });
//     });
// }

module.exports.getPackageJSON = getPackageJSON;