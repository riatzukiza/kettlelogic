Math.randomInt = function(min,max) {
    return Math.floor((Math.random() * (((max - min) + 1) + min)));
};
var randomInt = Math.randomInt;
function createContext(context,words,i,n) {
  //console.log("CREATING CONTEXT");
  if(typeof context[words[i+1]] === "undefined")  {
    context[words[i+1]] = {
      count:1,
      context:{},
      depth:n
    };
  } else  {
    context[words[i+1]].count++;
  }
  if(n > 0)
  createContext(context[words[i+1]].context,words,i+1,n-1)
};
function createDictionary(words,n)  {
    var word;
    var D = {
        context:{},
        count:0,
        depth:n
    };
    n = n-1
    for(var i = 0; i < words.length-n;i++)  {
        D.count++;
        word = words[i];
        if(typeof D.context[word] === "undefined")  {
            D.context[word] = {
                count:1,
                context:{ },
                depth:n
            };
        } else {
            D.context[word].count++;
        }
        if(n>0) {
            //console.log("n is greater than 0");
            createContext(D.context[word].context,words,i,n);
        }
    }
    return D;
};
function generateDynamicModel(words,n) {
    var dictionary = createDictionary(words,n);
    return {
        emit:function(priors) {
            var subModel = priors.reduce(function(model,word) {
                return model.context[word];
            },dictionary)
            var total,rand,prob,i,sum ;
            total   = subModel.count;
            rand    = total/randomInt(0,total);
            sum     = 0                               ;
            for(var k in subModel.context) {
                sum += total/subModel.context[k].count
                if(rand <= )
            }
        }
    }
}
function tagPhrases(string)  {
  return string.replace(/(\s\w+\s)+.+?[,!.?:;&]|(\(.+\)(?!\w\.)(\s<\/\w+>\s)*)/g," <ph> $1 </ph> ");
};
function tagSentances(string)  {
  return string.replace(/((((\s\w+\s))+.+?[!?.](?!\w\.)(\s<\/\w+>\s)*))/g," <s> $1 </s> "); 
}; 
function tagParagraphs(string)  {
	return string.replace(/([^\r\n]+)/g," <p> $1 </p> ");
};
function tagString(str)  {
	return tagParagraphs ( tagSentances ( tagPhrases(str)));
};
function getWords(string)  {//a word is a space delimited string contained in another string
//console.log(string);
  var s = string.match(/(<\w+>)|(?:\w+)|(<#\w+>)/g);
  //console.log(s);
  return s;
};

function genProb(D) {
  /*
  D is an Object of tokens (dictionary)
  and their counts in a given corpus
  which can contain other dictionaries 
  representing the words that have followed 
  them before.

  for every word in the dictionary generate an emission probability, 
  and push the word to T and the probability to P.

  there should result then a correspondence 
  of the indexes in the two arrays so that if 
  I know the index of a probability I can find the word and vice versa

  R is the recursive probability of any word given a w

  A is the associative Array which would represent the index to locate a word from
  */
  //console.log("DICTIONARY",D);
    if(typeof D !== "object")
        throw new Error("expected an object");
    var P = [],
        T = [],
        R = [],
        A = {},
        empty = true,
        keys = Object.keys(D.context);
    if(keys.length > 0) {
        //console.log("this is an object");
        keys
            .forEach(function(word,i)  {
                A[word] = i;
                P.push(D.context[word].count);
                T.push(word);
                if(D.depth > 0 ) {
                    //console.log("context",D.context[word]);
                    R.push((D.context[word]));
                }
            });
        return {
            D:D,//original dictionary
            P:P,//array of probabilities
            T:T,//array of tokens (words)
            R:R,//array of objects following this form.
            A:A,//associative Array

            updateProb:function(d) {
                Object.keys(d)
                    .forEach(function(word,i)  {
                        if(!A[word]) {
                            A[word] = i;
                            P.push(d.context[word].count);
                            T.push(word);
                            if(d.depth > 0 ) {
                                R.push(genProb(d.context[word]));
                            }
                        } else {
                            P[A[word]] += d.context[word].count
                            if(d.depth > 0 ) {
                                R[A[word]]
                                    .updateProb(d.context[word])
                            }

                        }
                    });
                return this;
            }
        };
    } //throw new Error("given an empty object");
};
function Pgiven(E) {
  //the emission probabilities given a set of priors
  var P = function(priors) {
    var res = E;
    //console.log("emissons",E);
    if(Array.isArray(priors))  {
      priors//for each prior word 
      .every(function(wi,i)  {
        //console.log("given",wi);
        //console.log("results",res);
        if(res.R[res.A[wi]]) {
          res = res.R[res.A[wi]];
          return true;
        }
        return false;
        //console.log("results",res);
      });
    }
    console.log(res);
    return res;
  };
  //P.E = E;
  return P;
};
function emitWordGiven(E) {
  var P = Pgiven(E);
  //console.log("THIS IS THE GIVEN E",E);
  return function(priors)  {
    //generate a random word given an array of prior words 
    var Emission = P(priors),total,rand,prob,i,sum ;
    //console.log("EMISSION",Emission);
        total   = Emission.D.count                       ;
        rand    = randomInt(0,total)              ;
        prob    = Emission.P                      ;
        sum     = 0                               ;
    for(i = 0;i < prob.length;i++)  {
      sum += prob[i];
      if(rand <= sum) {
        return Emission.T[i];
      }
    }
  };
};
function DynamicEmission(E) {
    var P = Pgiven(E);
    return function (priors) {
        var Emission = P(priors),total,rand,prob,i,sum ;
        //console.log("EMISSION",Emission);
        total   = Emission.D.count                       ;
        rand    = randomInt(0,total)              ;
        prob    = Emission.P                      ;
        sum     = 0                               ;
        for(i = 0;i < prob.length;i++)  {
            sum += prob[i];
            if(rand <= sum) {
                return Emission.T[i];
            }
        }
    }
}
function summerize(str,c,n) {
  //where str is a string representing a document to be summerized, 
  //and n is how long the summary should be.
  //c is the amount of context to use
  //console.log("STRING",str);
  var sum = [],emitter,prob,D,E,context = ["<ph>"],i;
  D = createDictionary(str,c);
  E = genProb(D);
  //console.log("DICTIONARY",D);
  console.log("this is n",n);
  var emit = emitWordGiven(E);
  for(i = 0;i<n;i++)  {
    //console.log("SUM",sum);
    //console.log("CONTEXT",context);
    var e = emit(context);
    //console.log("emitted word",e);
    sum.push(e);
    context = sum.slice(Math.max(sum.length-c,1));
  }
  return sum.join(" ")+".";
};
/*console.log(
  "word", emitWordGiven(
    genProb(
      createDictionary(
        readFile("./example.txt"),
        3
      )
    )
  )(["I"]));*/
//console.log(summerize(readFile(process.argv[2]).toLowerCase(),2,30));
/*module.exports = {
    summerize:summerize,
    emitWordGiven:emitWordGiven,
    genProb:genProb,
    createDictionary:createDictionary,
}*/
