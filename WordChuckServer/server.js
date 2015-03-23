//First load HTTP functions.
var http = require('http');
//Then IO functions.
var fs = require('fs');
//Then load WordNet using the natural package.
var natural = require('natural');
var wordnet = new natural.WordNet();
var tokenizer = new natural.WordTokenizer();
var rndwords = require('random-words');
var WordPOS = require('wordpos');
var wordpos = new WordPOS();

var verblist = new Array();
var inputf = fs.createReadStream('index.verb');
readLines(inputf, addToVerbList, verblist);

//We will use the port defined in environment, otherwise 1337.
var port = process.env.port || 1337;


//Create an HTTP server to listen for clients.
http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    //samePOS("closet", "microorganism", function (posres) { console.log(posres) });
    //mutateWord("closet", function (word,mut) { console.log(word+" "+mut) })
    var countprobs = 0;
    var pstring = "";
    var totalprobs=100;
    for (var k = 0; k < totalprobs; k++) {
        genProblem(function writeToLog(triplet) {
            pstring = pstring + countprobs + " " + triplet + "\n";
            console.log(triplet);
            countprobs++;
            if (countprobs == totalprobs)
                printProblems(res, pstring);
        });
    }
    
   
    //genCandidatePhrase(5, function writeToPage(phrase) { res.end(phrase); })
    //genMatchPhrase(5, function writeToPage(phrase) { res.end(phrase); });
    //genProblem(function writeToPage(triplet) { res.end(triplet); })
    //console.log(tokenizer.tokenize("\"beat the drum\""));
    //wordnet.lookupSynonyms("beat", function (results) { //And doing WordNet lookups for the synsets the lemma is a part of
    //        console.log([results[0].lemma,results[1].lemma].length);
    //});
}).listen(port);

function printProblems(res, problemsString)
{
    res.end(problemsString);
}


function genRandomPhrase(plength, callback)
{
    var rw = rndwords(plength);
    var phrase = "\"" + rw[0];
    for (var i = 1; i < plength; i++)
        phrase = phrase + " " + rw[i];
    phrase = phrase + "\"";
    callback(phrase);
}

function genProblem(callback)
{
    var triplet = new Array();
    var phrase_functions = new Array();
    //phrase_functions.push(genMatchPhrase);
    phrase_functions.push(genMatchPhrase);
    phrase_functions.push(genCandidatePhrase);
    phrase_functions.push(genRandomPhrase);

    phrase_functions.forEach(function (phrasegen_func) {
        phrasegen_func(getRandomInt(3,7), function (phrase) {
            triplet.push(phrase)
            if (triplet.length == 3)
                callback(triplet[0]+", "+triplet[1]+", "+triplet[2]);
        });
    });
}

function genMatchPhrase(plength, callback)
{
    var phrase_options = new Array();
    var lemma = verblist[getRandomInt(0, verblist.length)]; //Keep generating random verb lemmas
    wordnet.lookup(lemma, function (results) { //And doing WordNet lookups for the synsets the lemma is a part of
        results.forEach(function (result) { //For each synset we find,
            //console.log("synset hit");
            //if (result.pos == 'v') { //only take results from verb forms
                var gl = String(result.gloss); //Extract glossary from synset
                var sentence_pattern = /"(.*?)"/g; //Use a regular expression to identify the sentence examples
                var matches = gl.match(sentence_pattern); //Find matches for the regex
                if (matches != null) //If there are any matches,
                    for (var n = 0; n < matches.length; n++) //Go through each match
                        if (tokenizer.tokenize(matches[n]).length == plength) //And if it is the right length
                            phrase_options.push(matches[n]); //Make a note of the phrase
            //}
        })
        if (phrase_options.length < 1)
            genMatchPhrase(plength, callback); //try another lemma if this one didn't give us the results we want
        else
            callback(phrase_options[getRandomInt(0, phrase_options.length)]); //complete when at least one phrase to choose from is found
    })
}

function genCandidatePhrase(plength, callback) {
    genMatchPhrase(plength, function mutate(phrase) {
        var phrasewords = tokenizer.tokenize(phrase);
        var mutations = new Array();
        var countwords = 0;
        phrasewords.forEach(function wordInPhrase(word) {
            mutateWord(word, function givenMutation(word, mutation) {
                if (word!=mutation)
                    mutations.push([word, mutation]);
                countwords++;
                if (countwords == phrasewords.length)
                    callback(applyMutation(phrasewords, mutations[getRandomInt(0, mutations.length)]))
            })
        });
    });
}

function applyMutation(phrasewords, mutation)
{
    var mp = "\"" + phrasewords[0];
    for (var i = 1; i < phrasewords.length; i++)
        mp = mp + " " + phrasewords[i];
    mp = mp + "\"";
    if (mutation!=null)
        mp=mp.replace(mutation[0], "("+mutation[0]+"->"+mutation[1]+")");
    return mp;
}

function mutateWord(word, callback)
{
    wordnet.lookupSynonyms(word, function (synonyms) {
        if (synonyms.length > 0) {
            var pos_matching_syns = new Array();
            var countsyns = 0;
            synonyms.forEach(function synInSet(syn) {
                samePOS(word, syn.lemma, function (isSame) {
                    countsyns++;
                    if (isSame) 
                        pos_matching_syns.push(syn);
                    if (countsyns == synonyms.length) {
                        if (pos_matching_syns.length > 0)
                            callback(word, pos_matching_syns[getRandomInt(0, pos_matching_syns.length)].lemma);
                        else
                            callback(word, word);
                    }
                })
            });
        }
        else
            callback(word, word);
    });
}

//Takes two single words a,b, calls back with true if they are the same POS, false if not.
function samePOS(a,b, callback)
{
    var strab = a + " " + b;
    wordpos.getPOS(strab, function sumAndCheckPOS(posres) {
        //console.log(strab + " v=" + posres.verbs.length + " n="+ posres.nouns.length+" av="+ posres.adverbs.length+" ad="+ posres.adjectives.length+" r="+posres.rest.length);
        if (posres.verbs.length == 2 || posres.nouns.length == 2 || posres.adverbs.length == 2 || posres.adjectives.length == 2) {
            callback(true);
        }
        else {
            callback(false);
        }
    });
}

// Returns a random integer between min (included) and max (excluded)
// Using Math.round() will give you a non-uniform distribution!
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function readLines(input, func, output) {
    var remaining = '';
    
    input.on('data', function (data) {
        remaining += data;
        var index = remaining.indexOf('\n');
        var last = 0;
        while (index > -1) {
            var line = remaining.substring(last, index);
            last = index + 1;
            func(line, output);
            index = remaining.indexOf('\n', last);
        }
        
        remaining = remaining.substring(last);
    });
    
    input.on('end', function () {
        if (remaining.length > 0) {
            func(remaining, output);
        }
    });

    
}

function addToVerbList(data, output) {
    output.push(tokenizer.tokenize(data)[0]);
}
