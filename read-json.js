var Promise = require('bluebird');
var fs   = require('fs');
var rp = require('request-promise');
var saw = require('string-saw');

Promise.promisifyAll(fs);

var myFile = 'data/videos.json';

fs.readFileAsync(myFile).then(JSON.parse).then( function(val) {
    // Get url of each video then get page's title
    var i      = 0;
    var videos = val.result.videos;
    videos.map( function(video) {
        video.index = ++i;
        return rp( video.web_url )
            .promise()
            .bind({ video: video })
            .then(findTitle)
            .then(function( title ){
                console.log( '%d : %s', video.index, title );
            });
    });
})
.catch(SyntaxError, function(e) {
    console.error("invalid json in file");
})
.catch(function(e) {
    console.error(e)
});

function findTitle( html ) {
    var str = saw(html)
        .match(/<title>(.*)<\/title>/)
        .itemFromRight(1)
        .remove(/\s-\sS.*/)
        .toString();
    return str;
}
