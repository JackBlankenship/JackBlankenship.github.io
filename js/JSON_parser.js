var gblBeginIndex, gblEndIndex, gblCurrentIndex, lKey, strLength;
var items = [];
var arrayOfKeys = [];
var arrayOfKeysDebug = [];
var arrayOfObjects = [];
var arrayOfObjectsStack = [];
var arrayOfObjectsStackIdx = [];
var arrayOfStarts = [], arrayOfVariables = [], arrayOfReferences = [], arrayOfCode = [];
var myDebug = false, myMinIdx = 0, myMaxIdx = 0;
var iTemp, lastKey, twoChars;


function getNextKey(kString, parentKey, kPointer) {

  var rArray = [];
  var begIdx, endIdx, myKey, kLength, keyAdded = false;
  begIdx = kString.indexOf('"',kPointer); // object ALWAYS starts with a name pair
  rArray.push(begIdx);

  if (myDebug === true) {
    console.log("getNextKey begIdx "+ begIdx);
    if (begIdx > myMinIdx && begIdx < myMaxIdx){
      console.log(kString.substr(begIdx,75));
    } else {
      if (begIdx > myMaxIdx) {
        myDebug = false;
        console.log('---------  End range debug---------');
      }
    }
  } else {
    myMinIdx = 126717;
    myMaxIdx = 144000;
    if (begIdx > myMinIdx && begIdx < myMaxIdx) {
      myDebug = true;
      console.log('---------Begin range debug---------');
    }
  }

  if (begIdx > 0) {                       // found beginning, continue processing
    begIdx++                              // get past the Quote
    endIdx = kString.indexOf('"',begIdx); // Find ending quote
    if (endIdx > 0) {
      kLength = endIdx - begIdx;          // zero based Math
      myKey = kString.substr(begIdx, kLength);
      endIdx++;
      if (kString.charAt(endIdx) === ":") {
        iTemp++;

        if (!parentKey) {
          keyAdded = addToKeyArray(myKey);
        } else {
          keyAdded = addToKeyArray(parentKey + '.' + myKey); 
        }  // end parentKey check
        rArray.push(endIdx);
        rArray.push('normal');
        rArray.push(myKey);
        // More logic to determine next thingy ie Array or Object.
      } else {
        rArray.push(0);
        rArray.push('value');
        rArray.push(false);
        rArray.push(myKey);
        // you seem to have ahold of a "value"
      } // no endFound
      
    } else {
      //no end found
      rArray.push(0);
      rArray.push('unknown end');
      rArray.push(false);
    }
  } else {
    //no begin found
    rArray.push(0);
    rArray.push('unknown begin');
    rArray.push(false);
  }
  rArray.push(parentKey);
  rArray.push(keyAdded);
  //console.log("NextKey exiting string position " + endIdx + " value " + kString.charAt(endIdx));
  gblEndIndex = endIdx;
  gblBeginIndex = begIdx;
  gblCurrentIndex = kPointer;
  if (myKey === '1089') {
    console.log("Bad key located. string started at:" + begIdx + " string ended at: " + endIdx);
  }
  return rArray;
} // end getNextKey function returns rArray[ begIdx, endIdx, data-type, key, parentKey, keyAdded ]

function getNextValue(kString, parentKey, currentKey, kPointer, currentKeys, keyAdded) {
  var rArray = [];
  var begIdx, endIdx, myKey, kLength, kChar, kObject, tIdx, singularKey, singularParent, joinedKey, joinedVariable, arrayDepth, arrayTerminator, tempBegIdx;
  begIdx = kPointer + 1;
//  console.log("NextValue entry string position " + begIdx + " value " + kString.charAt(begIdx));
  rArray.push (begIdx);
  kChar = kString.substr(begIdx,2);
 // if (begIdx > 115676){ //256171 for GW2 debugging
 //  console.log("NextValue, examined string is " + kChar);
 // }
  // Unhandled data exception on ]},.
  if (keyAdded) {
    singularKey = getSingularFromPlural(currentKey);
    if (parentKey) {
      singularParent = getSingularFromPlural(parentKey);
    } else {
      singularParent = "data";
    }
    joinedVariable = singularParent + "_" + currentKey;
    // somehow the keyAdded is not working properly 08-10-2016
    if (arrayOfVariables.indexOf(joinedVariable) < 0) { 
      arrayOfVariables.push(joinedVariable);
    }
    joinedKey = singularParent + "." + currentKey;
    if (arrayOfReferences.indexOf(joinedVariable)) { 
      arrayOfReferences.push(joinedVariable + " = " + joinedKey);
    }
    // somehow the keyAdded is not working properly 08-10-2016 END
  }

  // 08-10-2016 Guildwars2 feed breaking near character 126715 object sectors:[{"sector_id":1089,}]
  //"skill_challenges":[],"sectors":[{"sector_id":1089,"name":"Dappled Shores","level":80,"coord":[13631.9,20072],

  if (kChar ==='[{') {
    endIdx = begIdx + 1;
    kObject = 'arrayOfObjects';
    arrayOfStarts.push(parentKey + " " + " " + currentKeys + " " +kChar); // This might be a push of just the kChar.charAt(1)
    if (keyAdded) {
      arrayOfCode.push("for (i=0, il=" + joinedKey + ".length; i<il; i++) {" ); 
      arrayOfCode.push(" " + singularKey + " = " + joinedKey +"[i];");
      arrayOfReferences.pop(); // remove prior added
      arrayOfVariables.pop();
      // for (i = 0, il = gameMap.points_of_interest.length; i < il; i++) {
      //          poi = gameMap.points_of_interest[i];
    }
  } else if ( kChar.charAt(0) === '[') {
    // 2016-08-18 An array of arrays gives an error 
    arrayDepth = 0;
    kObject = 'normal';                    // add array function call?
    kChar = kString.substr(begIdx,3);       //handle null arrays
    arrayTerminator = ']';
    if (kChar.charAt(1) ==='[') {
      console.log("--String:" + kString.substr(begIdx,30));
      endIdx = begIdx + 1; // zero based math fun.

      do {
        arrayDepth++;
        endIdx++;
        arrayTerminator = arrayTerminator + ']';
      } while (kString.charAt(endIdx) === '[');
      //console.log("--array terminator:" + arrayTerminator);
      tempBegIdx = kString.indexOf(arrayTerminator) + arrayDepth;
      if (keyAdded) {
          joinedVariable = joinedVariable + '[]';
          arrayOfVariables.pop();
          arrayOfVariables.push(joinedVariable);
      }
      console.log('--ending position string:' + kString.substr(tempBegIdx,10));
    } else {
      if (keyAdded) {
        if ((kChar === '[]}') || (kChar === '[],')) {  // added check for empty array [],
          arrayOfKeys.pop();
        } else {                          // logic to change variable to be array.
          joinedVariable = joinedVariable + '[]';
          arrayOfVariables.pop();
          arrayOfVariables.push(joinedVariable);
        }
      }
      
    }
    endIdx = kString.indexOf(arrayTerminator, begIdx); // ERROR this '],' fails on char 385????
    // having an issue with empty array skill_challenges before object of an array sectors.sector_id:1089
    if (myDebug === true) {
      if (begIdx > myMinIdx && begIdx < myMaxIdx) {
        console.log("Next charAt " + kString.charAt(endIdx));
      }
    }

    do {
      endIdx++; 
      // This is where I thought about checking for object end and .pop off of stack. For each }]} or }} detected.
      // 
      kChar = kString.substr(endIdx,2);
      if (kChar === "}]") {
        kObject = 'endOfArrayOfObjects';
      } 
    } while ((kString.charAt(endIdx)=== "]") || (kString.charAt(endIdx) === "}"));

    if (myDebug === true) {
      console.log("string is " + kString.substr((endIdx-1),3));
    }

    if (kString.substr((endIdx-1),3) === '},"') {
  //    console.log("Attempt to handle end object at " + endIdx);
      endIdx = kString.indexOf(":", begIdx);
    }
  } else if ( kChar.charAt(0) === '{') {
    kObject = 'object';
    endIdx = kString.indexOf(':', begIdx);
    arrayOfStarts.push(kChar.charAt(0));
    if (keyAdded) {
      console.log("Parent:" + parentKey + " currentKey:" + currentKey);
      singularKey = getSingularFromPlural(currentKey);
      if (parentKey) {
        singularParent = getSingularFromPlural(parentKey);
      } else {
        singularParent = "data";
      }
      joinedKey = singularParent + "." + currentKey;
      arrayOfCode.push("for (" + singularKey + " in " + joinedKey + ") {" ); //for (region in data.regions) { region = data.regions[region];
      arrayOfCode.push(" " + singularKey + " = " + joinedKey + "[" + singularKey + "];");
      arrayOfReferences.pop(); // remove as prior line added code 
      arrayOfVariables.pop();
    }
    if (endIdx > 0) {
      if (kString.substr((endIdx),2) !== ":{") { // Single object encountered @treehouse.com
        endIdx = begIdx;
      }
    }
  } else {
    kObject = 'normal';
    endIdx = begIdx;
    if (kChar.charAt(0)=== '"') {
      endIdx = kString.indexOf('"', (begIdx + 1));
      endIdx++; // Have to get past the quote or youll trash getNextKey
      //console.log ("Found quote at char " + begIdx);
    } else {
    // 15-03-05 Suggest putting , check and roll backwards 1 or 2 chars to check for
      // termination of Array ] or termination of object }
      // true, kObject = "EendOfArrayOfObjects"
      tIdx = kString.indexOf(',', endIdx);
      if (tIdx > 0) {
        kChar = kString.substr(endIdx,(tIdx - endIdx));
        tIdx = kChar.indexOf(']}',0);
        if (tIdx > 0) {
          kObject = "endOfArrayOfObjects";
        }
      }
      //if (endIdx> 1148 && endIdx < 1190) {
      //    console.log("GetNextValue string:" + kString.substr(endIdx,40));
      //    console.log("small string:" + kChar);
      //}
    }
    // add logic using tIdx to look for },{ which is still normal else single '},"' which is an endOfObject
    tIdx = kString.indexOf(',', endIdx);
    if (tIdx > 0) {
      kChar = kString.substr((tIdx - 1), 3);
      if (kChar === '},"' ) {
        //console.log("endOfObject detected: "+ kChar);
        kObject = "endOfObject";
        endIdx = tIdx; // needed to continue processing correctly
      }
    }
  }

  if ((currentKey ==='1089') || (parentKey === '1089')) {
    console.log('--1089 ' + kString.substr(begIdx,(endIdx - begIdx))); // 08-10-2016
    console.log(' -1089 begIdx:' + begIdx + ' endIdx:' + endIdx);
  } else {
    if (currentKey ==='skill_challenges') {
      console.log('-- ' + kString.substr(begIdx,(endIdx - begIdx))); // 08-10-2016
      console.log(' - begIdx:' + begIdx + ' endIdx:' + endIdx);
      console.log(' - :' + kString.substr(begIdx, 50));
    }
  }

  rArray.push(endIdx);
  rArray.push(kObject);
  if (begIdx < 1) {
    rArray[2] = 'failed begin';
  }
  if (endIdx < 1) {
    rArray[2] = 'failed end';
  }
  rArray.push(parentKey);
  if ((begIdx > 0) && (endIdx> 0)) {
    rArray.push(kString.substr(begIdx,(endIdx - begIdx)));
  } else {
    rArray.push("termination");
  }

  gblEndIndex = endIdx;
  gblBeginIndex = begIdx;
  gblCurrentIndex = kPointer;
  return rArray;  // should be begIdx, endIdx, kObject, parentKey,  
} // end getNextValue function

function getSingularFromPlural(currentKey) {
  var sLength, sKey, partA, partB;
  sLength = currentKey.indexOf('s_');
  if (sLength > 0 ) {
    partA = currentKey.substr(0, sLength);
    partB = currentKey.substr(sLength+1);
    sKey = partA + partB;
  } else {
    sLength = currentKey.length;
    // Because some objects are written in the singluar voice or have one occurance. 08-09-2016
    if (currentKey.charAt(sLength - 1) === 's') {
      sKey = currentKey.substr(0, (sLength - 1));
    } else { 
      sKey = currentKey;
    } // end 08-09-2016 change.
  }
  return sKey;
}
function haveAnObject(oString, parentKey, strPointer, loopLimit) {
  var arrayOfValues = [0,0,'normal'];
  var currentKeys = [];
  var myKey, haoIdx, haoTermIdx, haoString, haokeyAdded = false;
  if (parentKey !== false) {
    // attempt to prevent duplicate entires as I have not figured out how to bypass duplicate
    // data objects in getNextValue logic when object end is detected.
    if (arrayOfObjects.indexOf(parentKey) < 0 ) { 
      arrayOfObjects.push(parentKey);
      haokeyAdded = true;
    }
    if (arrayOfObjectsStack.indexOf(parentKey) < 0) {  
      arrayOfObjectsStack.push(parentKey); // stack of the objects we are processing
      arrayOfObjectsStackIdx.push(strPointer);
    }
  }
  //  console.log("Have an Object starting at " + strPointer);

  do {
    arrayOfValues = getNextKey(oString, parentKey, strPointer);
    //NO! haokeyAdded = arrayOfValues[5];
    if (myDebug === true) {
      console.log("Post getNextKey " + arrayOfValues);
    }

    //if (arrayOfValues[1] > 928 && arrayOfValues[1] < 1190) {
    //  console.log("detected key is " + oString.substr(arrayOfValues[0],(arrayOfValues[1]- arrayOfValues[0])));
    //}

    if ((arrayOfValues[0] > 0) && (arrayOfValues[1] > 0)) {
      myKey = arrayOfValues[3];
      currentKeys.push(myKey);
      if (myDebug === true) {
        console.log("Before getNextValue call:" + arrayOfValues);
      }
      arrayOfValues = getNextValue(oString, parentKey, myKey, arrayOfValues[1], currentKeys, arrayOfValues[5]);

      strPointer = arrayOfValues[1];
    }

    //if (arrayOfValues[1] > 928 && arrayOfValues[1] < 1190) { 
    //  console.log("Key-Value loop array" + arrayOfValues);
    //  console.log("Data is:" + oString.substr(arrayOfValues[0],(arrayOfValues[1]- arrayOfValues[0])));
    //}
  } while (arrayOfValues[2] === 'normal');
  
  //if (arrayOfValues[1] > 928 ) {
  //console.log("Exited Do loop haveAnObject " + arrayOfValues[2]);
  //console.log('myKey is ' + myKey);
  //console.log("charAt " + arrayOfValues[1] + " is "+ oString.charAt(arrayOfValues[1]));
  //console.log("30 chars" + oString.substr(arrayOfValues[1],30));
  //console.log("Parent key is " + parentKey);
  //console.log("Full arrayOfValues:" + arrayOfValues);
  //}

  if ((arrayOfValues[2] === 'endOfArrayOfObjects') || ( arrayOfValues[2] === 'endOfObject')) {
    console.log("Pre arrayOfObjectsStack pop:" + arrayOfObjectsStack);
    console.log("Pre arrayOfObjectsStack pop:" + arrayOfObjectsStackIdx);
    if (haokeyAdded === true) { //key was added
      // arrayOfCode.push("} // terminator for " + parentKey + "." + myKey);
      arrayOfCode.push("} // terminator for " + arrayOfObjectsStack[(arrayOfObjectsStack.length - 2)] + "." + arrayOfObjectsStack[(arrayOfObjectsStack.length - 1)]); //array zero based math
    } else {
      console.log("haokeyAdded:" + haokeyAdded + " parentKey:" + parentKey + " myKey:" + myKey);
    }
    arrayOfObjectsStack.pop(); // remove the current object
    arrayOfObjectsStackIdx.pop();
    console.log("Post arrayOfObjectsStack pop:" + arrayOfObjectsStack);
    console.log("Simulated parentKey is:" + arrayOfObjectsStack[(arrayOfObjectsStack.length - 1)]);
    if (oString.substr(arrayOfValues[1],2) === ',"') {
      myKey = arrayOfObjectsStack[(arrayOfObjectsStack.length - 1)];
      haveAnObject(oString, myKey, arrayOfValues[1], loopLimit);
    } else { // 2015-05-20. At this point, you need to traverse back up to next higher object.
      console.log("Exit string at:" + arrayOfValues[1] + ' is:' + oString.substr(arrayOfValues[1],6));
      haoIdx = oString.indexOf(',',arrayOfValues[1]); // get the position of the next , character
      // 2016-09-16 You might have multiple object ends here?
      if ( haoIdx > 0 ) {                               // found one
        haoString = oString.substr(arrayOfValues[1],(haoIdx - arrayOfValues[1]));
        console.log("Data between value and ,:" + haoString); 
        haoTermIdx = haoString.indexOf(']}'); //look for an array terminator
        if ( haoTermIdx > 0 ) {
          myKey = arrayOfObjectsStack[(arrayOfObjectsStack.length - 1)];
          console.log("Reset key to:" + myKey);
          haveAnObject(oString, myKey, haoIdx, loopLimit); 
        }
      }
    }
  } else {
  //loopLimit--;
    if ((arrayOfValues[2] === 'arrayOfObjects') || (arrayOfValues[2] === 'object'))  {
      haveAnObject(oString, myKey, arrayOfValues[1], loopLimit);
    }
  }  


} // end haveAnObject function

function addToKeyArray (pKey) { 
  var keyWasAdded = false;
  if (arrayOfKeys.indexOf(pKey) < 0) {  // not currently in the "array". 
    console.log("--Current array:" + arrayOfKeys);
    console.log("--Key adding:" + pKey + " indexOf.value:" + arrayOfKeys.indexOf(pKey));
    arrayOfKeys.push(pKey);
    arrayOfKeysDebug.push(pKey + " " + gblBeginIndex);
    keyWasAdded = true;
  }

  if (iTemp < 5) {
    //arrayOfKeys.push(lKey);
    items.push(pKey); 
    console.log(pKey);
    console.log("Begin:" + gblBeginIndex + " End;" + gblEndIndex + " Current:" + gblCurrentIndex);
    iTemp++;
  } else {
    items.pop();
    items.unshift(pKey);
  }
  return keyWasAdded;
} // end function addToKeyArray

function validateInput(myString){
  var length = myString.length;
  var myHttp = myString.substr(0,7);
  // console.log("Before call " + myString + " is "+ length);
  if (myHttp !== 'http://') {
    myHttp = myString.substr(0,8);
    if (myHttp === 'https://') {
      return true;
    } else {
      return false;
      // validateInput(myString.substr(0,(myString.length - 1)));
    }

  } else {
    return true;
  }
} // end validate function

$(document).ready(function() {
  
  var flickerAPI = "https://api.guildwars2.com/v1/map_floor.json?continent_id=1&floor=1";
  // flickerAPI = "http://teamtreehouse.com/jackblankenship.json";
  //flickerAPI =  "http://us.battle.net/api/wow/realm/status?jsonp=?";


  $('form').submit(function (evt) {
    var $submitButton = $('#submit');
    var $searchField = $('#search');


    evt.preventDefault();
    $searchField.prop("disabled", true);
    $submitButton.attr("disabled", true).val("parsing....");
    var animal = $searchField.val();
    //$('#photos').html('');
    //console.log("Before function:" + animal);
    if  (validateInput(animal)) {
      flickerAPI = animal;
    }  
    $.getJSON(flickerAPI, function(data){

      var myCount = 1;
      gblCurrentIndex = 1;
      gblEndIndex = 0;
      gblBeginIndex = 0;
 
      var myString = JSON.stringify(data);

      haveAnObject(myString, false, 0, 5); // just starting so, (baseString, noParent, 0 displacement)
      //var arrayOfStrings = myString.split(","); space or , won't work due to text data.
      console.log("Keys found:\n" + arrayOfKeys);
      console.log("\nObjects found:\n" + arrayOfObjects);
      //console.log("\nReferences:\n" + arrayOfReferences);

      while (arrayOfObjectsStack.length > 1 ) {
        arrayOfCode.push("} // terminator for " + arrayOfObjectsStack[(arrayOfObjectsStack.length - 2)] 
                                          + "." + arrayOfObjectsStack[(arrayOfObjectsStack.length - 1)]); //array zero based math
        arrayOfObjectsStack.pop();
      } 
     
      arrayOfCode.push("} // terminator for data." + arrayOfObjectsStack[0]); //array zero based math     
      var myContent = "";
      if (myDebug === true) {
        console.log(arrayOfKeys.length);
      }

      for ( var i=0; i < arrayOfVariables.length; i++) {
        myContent = myContent + arrayOfVariables[i] + "\n";
      }
      document.getElementById("tvariables").value = myContent;
       

      myContent = "";
      for ( var i=0; i < arrayOfReferences.length; i++) {
        myContent = myContent + arrayOfReferences[i] + "\n";
      }
      document.getElementById("treferences").value = myContent; 
 

      myContent = "";
      myContent = myContent + '$.getJSON("' + flickerAPI + '", function (data) {\n';
      for ( var j=0; j< arrayOfCode.length; j++){
        myContent = myContent + arrayOfCode[j] + "\n";
      }
      myContent = myContent + '});';
      
      document.getElementById("textarea").value = myContent;

      //reset all arrays
      arrayOfCode =[];
      arrayOfReferences = [];
      arrayOfVariables = [];
      arrayOfKeys = [];
      arrayOfValues = [];
      arrayOfObjects = [];
      arrayOfObjectsStackIdx= [];      

      $searchField.prop("disabled", false);
      $submitButton.attr("disabled", false).val("Parse");
    })
    .fail(function() {
      document.getElementById("textarea").textContent = "An error occurred with the request";
      $searchField.prop("disabled", false);
      $submitButton.attr("disabled", false).val("Parse");
    }); // end getJSON

  }); // end click

}); // end ready