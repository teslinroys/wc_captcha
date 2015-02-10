//First load HTTP functions.
var http = require('http');
//We will use the port defined in environment, otherwise 1337.
var port = process.env.port || 1337;

//Create an HTTP server to listen for clients.
http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello user\n');
    
    //Define a wordnet object. Then use it to retrieve information about a synset.
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
        })
    });
}).listen(port);