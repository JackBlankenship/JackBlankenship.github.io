var gblBeginIndex, gblEndIndex, gblCurrentIndex, lKey, strLength;
var items = [];
var arrayOfKeys = [];
var arrayOfKeysDebug = [];
var arrayOfObjects = [];
var arrayOfStarts = [];
var iTemp, lastKey, twoChars;


function getNextKey(kString, parentKey, kPointer) {
  var rArray = [];
  var begIdx, endIdx, myKey, kLength;
  begIdx = kString.indexOf('"',kPointer); // object ALWAYS starts with a name pair
  rArray.push(begIdx);
  console.log("getNextKey begIdx "+ begIdx);
 if (begIdx > 256170){
  console.log(kString.substr(256170,75));
 }
  if (begIdx > 0) { // found beginning
    begIdx++ // get past the Quote
    endIdx = kString.indexOf('"',begIdx); //Find ending quote
    if (endIdx > 0) {
      kLength = endIdx - begIdx;  // zero based Math
      myKey = kString.substr(begIdx, kLength);
      endIdx++;
      if (kString.charAt(endIdx) === ":") {
        iTemp++;

        if (!parentKey) {
          addToKeyArray(myKey);
        } else {
          addToKeyArray(parentKey + '.' + myKey); 
        }  // end parentkey check
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
  //console.log("NextKey exiting string position " + endIdx + " value " + kString.charAt(endIdx));
  gblEndIndex = endIdx;
  gblBeginIndex = begIdx;
  gblCurrentIndex = kPointer;
  return rArray;
} // end getNextKey function
function getNextValue(kString, parentKey, kPointer, currentKeys) {
  var rArray = [];
  var begIdx, endIdx, myKey, kLength, kChar, kObject, tIdx;
  begIdx = kPointer + 1;
//  console.log("NextValue entry string position " + begIdx + " value " + kString.charAt(begIdx));
  rArray.push (begIdx);
  kChar = kString.substr(begIdx,2);
  if (begIdx > 115676){ //256171 for GW2 debugging
   console.log("NextValue, examined string is " + kChar);
  }
  
  if (kChar ==='[{') {
    endIdx = begIdx + 1;
    kObject = 'arrayOfObjects';
    arrayOfStarts.push(parentKey + " " + kChar); // This might be a push of just the kChar.charAt(1)
  } else if ( kChar.charAt(0) === '[') {
    kObject = 'normal';                    // add array function call
    endIdx = kString.indexOf(']', begIdx); // ERROR this '],' fails on char 385
    if (begIdx > 6375 && begIdx < 6530) {
      console.log("Next charAt " + kString.charAt(endIdx));
    }
    do {
      endIdx++; // This is where you check for object end and .pop off of stack.
      kChar = kString.substr(endIdx,2);
      if (kChar === "}]") {
        kObject = 'endOfArrayOfObjects';
      } 
    } while ((kString.charAt(endIdx)=== "]") || (kString.charAt(endIdx) === "}"));
    console.log("string is " + kString.substr((endIdx-1),3));
    if (kString.substr((endIdx-1),3) === '},"') {

  //    console.log("Attempt to handle end object at " + endIdx);
      endIdx = kString.indexOf(":", begIdx);


    }
  } else if ( kChar.charAt(0) === '{') {
    kObject = 'object';
    endIdx = kString.indexOf(':', begIdx);
    arrayOfStarts.push(kChar.charAt(0));
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
    } // 15-03-05 Suggest putting , check and roll backwards 1 or 2 chars to check for
      // termination of Array ] or termination of object }
      // true, kObject = "ExitObject" or "ExitArray"
  }
  //console.log(kString.substr(begIdx,(endIdx - begIdx)));
  rArray.push(endIdx);
  rArray.push(kObject);
  if (begIdx < 1) {
    rArray[2] = 'failed begin';
  }
  if (endIdx < 1) {
    rArray[2] = 'failed end';
  }
  rArray.push(parentKey);
  gblEndIndex = endIdx;
  gblBeginIndex = begIdx;
  gblCurrentIndex = kPointer;
  return rArray;
} // end getNextValue function

function haveAnObject(oString, parentKey, strPointer, loopLimit) {
  var arrayOfValues = [0,0,'normal'];
  var currentKeys = [];
  var myKey;
  if (parentKey !== false) {
    // attempt to prevent duplicate entires as I have not figured out how to bypass duplicate
    // data objects in getNextValue logic when object end is detected.
    if (arrayOfObjects.indexOf(parentKey) < 0 ) { 
      arrayOfObjects.push(parentKey);
    }
  }
//  console.log("Have an Object starting at " + strPointer);

  do {
    arrayOfValues = getNextKey(oString, parentKey, strPointer);
    console.log(arrayOfValues);
    if ((arrayOfValues[0] > 0) && (arrayOfValues[1] > 0)) {
      myKey = arrayOfValues[3];
      currentKeys.push(myKey);
      arrayOfValues = getNextValue(oString, parentKey, arrayOfValues[1], currentKeys);
     // console.log("Value call:" + arrayOfValues);
      strPointer = arrayOfValues[1];
    }
  } while (arrayOfValues[2] === 'normal');
  if (arrayOfValues[1] > 300) {
  console.log("Exited Do loop haveAnObject " + arrayOfValues[2]);
  console.log('myKey is ' + myKey);
  console.log("charAt " + arrayOfValues[1] + " is "+ oString.charAt(arrayOfValues[1]));
  console.log("30 chars" + oString.substr(arrayOfValues[1],30));
  }
  //loopLimit--;
  if ((arrayOfValues[2] === 'arrayOfObjects') || (arrayOfValues[2] === 'object'))  {
    haveAnObject(oString, myKey, arrayOfValues[1], loopLimit);
  }  


} // end haveAnObject function

function addToKeyArray (pKey) {
  if (arrayOfKeys.indexOf(pKey) < 0) {  // not currently in the "array". 
    arrayOfKeys.push(pKey);
    arrayOfKeysDebug.push(pKey + " " + gblBeginIndex);
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
} // end function addToKeyArray

function validateInput(myString){
  var length = myString.length;
  //var myHttp = myString.substr(0,7);
  console.log("Before call " + myString + " is "+ length);
  if (myHttp !== 'http://') {
    myHttp = myString.substr(0,8);
    if (myHttp === 'https://') {
        //valid url
    } else if (length > 1) {
      validateInput(myString.substr(0,(myString.length - 1)));
    }
  }
} // end validate function

$(document).ready(function() {
  
  var flickerAPI = "https://api.guildwars2.com/v1/map_floor.json?continent_id=1&floor=1";
   //flickerAPI = "http://teamtreehouse.com/jackblankenship.json";
  //flickerAPI =  "http://us.battle.net/api/wow/realm/status?jsoncallback=?";


  $('form').submit(function (evt) {
    var $submitButton = $('#submit');
    var $searchField = $('#search');


    evt.preventDefault();
    $searchField.prop("disabled", true);
    $submitButton.attr("disabled", true).val("parsing....");
    var animal = $searchField.val();
    //$('#photos').html('');
    //console.log("Before function:" + animal);
    //validateInput(animal);
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
      console.log("\nStarts found:\n" + arrayOfStarts);

     //console.log(myString);
      var myContent = "";
      console.log(arrayOfKeys.length);
      for ( var i=0; i < arrayOfKeys.length; i++) {
        myContent = myContent + arrayOfKeys[i] + "\n";
      }
      console.log(myContent);
      document.getElementById("textarea").textContent = myContent; 
      $searchField.prop("disabled", false);
      $submitButton.attr("disabled", false).val("Search");
    }); // end getJSON

  }); // end click

}); // end ready