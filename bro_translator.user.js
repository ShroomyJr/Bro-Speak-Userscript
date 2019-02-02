// ==UserScript==
// @name            Bro Speak
// @namespace       BroSpeakTranslator
// @description	    Everyone talks like a bro, bro.
// @include         *
// @version         1.0.1
// ==/UserScript==

/*
  
  Bro Speak 

  Licensed under the MIT License.
  Author: ShroomyJr
  
  This program significantly borrows from the Profanity-Filter by Mike (https://userscripts-mirror.org/scripts/review/4175) 
*/

(function() {

	//some performance settings
	var MillisecondsPauseBetweenBatches=3;
	var NodesPerBatch = 20;
	var ReplacementText = "bro";
	
	//edit the words here
	//sorted alpha backwords to catch bad word groupings
  var broDictionary={
    "male"	: "BRO-type",
    "many"	:	"many",
    "man" 	: "BRO",
    "men" 	: "BROs",
    "profess"	:	"BROfess",
    "aloha"	:	"aBROha",
    "best in show" : "best in BRO",
    "human"	:	"huBRO",
    "adult"	:	"grownski-BROski",
    "penis"	: "BRO-meat",
    "woman"	:	"chick",
    "women"	:	"chicks",
    "guy"	:	"BROseph",
    "dude"	:	"brah",
    "beer"	:	"brewski",
    "X chromosome" : "better chromosome"
   	
    		    		
    }
  var keys = Object.keys(broDictionary);
  
	var i = 0;
	var st = new Date().valueOf();  //for performance testing	
	var els = document.evaluate('//text()', document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	var bw="("+keys.join("|")+")";
	bw=new RegExp(bw, "gi");
	
	//do the title first
  document.title = replaceOnceUsingDictionary(broDictionary, document.title, function(key, dictionary) {
        return dictionary[key];
      });

	function CleanSome() 
	{		
		var el;
		var newval="";
		var data = "";
		var loopCount = 0;
		while ((el=els.snapshotItem(i++)) && (loopCount <= NodesPerBatch)) 
		{
			data = el.data;
      
		//newval = data.replace(/[a-z]/gi, m => broDictionary[m]);
			newval = replaceOnceUsingDictionary(broDictionary, data, function(key, dictionary) {
        return dictionary[key];
      });
      
      if (newval.length != data.length ||  newval != data)
			{
				//check the length first since its quicker than a a string comparison.
				//only change the value if we need to. its quicker.
				el.data = newval;
			}
			loopCount++;
		}
		
		if (el != null)
		{
			//more work left to do
			i--;
			GoNow(MillisecondsPauseBetweenBatches);
		}
		else
		{
			//we're done
			DoneNow();
		}
	}
	
	function DoneNow()
	{
		var et = new Date().valueOf();
		//alert("Milliseconds to complete: " + (et - st).toString()); //timer code
	}

	function GoNow(WaitUntil)
	{
		window.setTimeout(CleanSome, WaitUntil); 
	}
  
  
	
  function replaceOnceUsingDictionary(dictionary, content, replacehandler) {
    if (typeof replacehandler != "function") {
        // Default replacehandler function.
        replacehandler = function(key, dictionary){
            return dictionary[key];
        }
    }

    var patterns = [], // \b is used to mark boundaries "foo" doesn't match food
        patternHash = {},
        oldkey, key, index = 0,
        output = [];
    for (key in dictionary) {
        // Case-insensitivity:
        key = (oldkey = key).toLowerCase();
        dictionary[key] = dictionary[oldkey];

        // Sanitize the key, and push it in the list
        patterns.push('(?:' + key.replace(/([[^$.|?*+(){}])/g, '\\$1') + ')');

        // Add entry to hash variable, for an optimized backtracking at the next loop
        patternHash[key] = index++;
    }
    var pattern = new RegExp(patterns.join('|'), 'gi'),
        lastIndex = 0;

    // We should actually test using !== null, but for foolproofness,
    //  we also reject empty strings
    while (key = pattern.exec(content)) {
        // Case-insensitivity
        key = key[0].toLowerCase();

        // Add to output buffer
        output.push(content.substring(lastIndex, pattern.lastIndex - key.length));
        // The next line is the actual replacement method
        output.push(replacehandler(key, dictionary));

        // Update lastIndex variable
        lastIndex = pattern.lastIndex;

        // Don't match again by removing the matched word, create new pattern
        patterns[patternHash[key]] = '^';
        pattern = new RegExp(patterns.join('|'), 'gi');

        // IMPORTANT: Update lastIndex property. Otherwise, enjoy an infinite loop
        pattern.lastIndex = lastIndex;
    }
    output.push(content.substring(lastIndex, content.length));
    return output.join('');
}
  
	//spin the initial "thread"
	GoNow(0);

})
();