var http = require('http');
var port = process.env.port || 1337;
/**
 * Creates the server, tests WordNet access
 */
http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello user\n');

    var wordnet = new WordNet();
    wordnet.lookup('simple', function (results) {
        results.forEach(function (result) {
            console.log('------------------------------------');
            console.log(result.synsetOffset);
            console.log(result.pos);
            console.log(result.lemma);
            console.log(result.synonyms);
            console.log(result.pos);
            console.log(result.gloss);
                }});
}).listen(port);