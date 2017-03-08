// event listener to respond to "Show another quote" button clicks
// when user clicks anywhere on the button, the "printQuote" function is called
document.getElementById('loadQuote').addEventListener("click", clickPrintQuote, false);

// Project code follows.

//* Global variables  *//
var quotes  = [];
var bgColors = ["blue", "red", "green", "maroon", "mediumblue", "#a1c1ff", "#b0d0ff", "firebrick", "royalblue"];
var lCitation = "citation";
var lQuote = "quote";
var lSource = "source";
var lYear = "year";
var lTags = "tags";
var lBgColors = "bgColors";

var nInterval = setInterval(printQuote, 10000); // force call printQuote every 10 seconds.

function clickPrintQuote (){					// user clicked next quote so...
	clearInterval(nInterval); 					// stop the autoload
	printQuote();								// print next quote.
}
function printQuote() {

	var currentQuote = getRandomQuote();							// call to the random quote function to get a new one.

	var propertyArray = Object.getOwnPropertyNames(currentQuote);	// load all the object property names to an array

	var innerHTML = '<p class="quote"> ' + currentQuote[lQuote] + ' </p>';
	innerHTML += '<p class="source"> ' + currentQuote[lSource];

	if (propertyArray.indexOf(lCitation) < 0) {						// no entry for citations? do nothing
		//do nothing
	} else {														// otherwise load the citation html by concatenating.
		innerHTML += '<span class="citation"> ' + currentQuote[lCitation] + ' </span>';
	};

	if (propertyArray.indexOf(lYear) < 0) {							// no entry for the year? do nothing
		//do nothing
	} else {														// otherwise load the year html by concatenating.
		innerHTML += '<span class="year"> ' + currentQuote[lYear] + ' </span>';
	};

	if (propertyArray.indexOf(lTags) < 0) {							// no entry for the tags? do nothing
		//do nothing
	} else {														// otherwise load the tags html by concatenating.
		innerHTML += '<br><span class="tags"> Tags - ' + currentQuote[lTags] + ' </span>';
	};

	innerHTML += '</p>';											// closing </p> for the quote class entry.
	document.getElementById('quote-box').innerHTML = innerHTML;

	// template for what our html should look like follows
	// <p class="quote"> [quote here] </p>
	// <p class="source"> [source here]
  	// 		<span class="citation"> [citation here] </span>
  	// 		<span class="year"> [year here] </span>
	// </p>
	if (propertyArray.indexOf(lBgColors) < 0) {
		setBackgroundColor(bgColors);
	} else {
		setBackgroundColor(currentQuote[lBgColors]);
	}
	
}

function setBackgroundColor(colorsArray) {
	var colorInt = arrayRandomInt(colorsArray);						// randomly return a background color from an array.
	document.body.style.backgroundColor = colorsArray[colorInt];	// change the CSS
	console.log(colorsArray[colorInt]);
}

function getRandomQuote() {
	var returnQuote = "";
	if (quotes.length === 0) {
		loadQuoteArray();
	}
	// Completed the need to replace old repeated code with an arrayRandomInt function.
	var tempIndex = arrayRandomInt(quotes);							// call function to get random integer base upon array size.
	returnQuote = quotes[tempIndex];								// store off the quote from our array.
	quotes[tempIndex] = quotes[quotes.length - 1];					// take last entry off array and put into the quote we selected. this still works when we return last entry.
	quotes.pop();													// remove the last array entry. We now have a smaller array to chose from and no duplicates until depleted.
	console.log("getRandomQuote " + returnQuote);
	return returnQuote;												// return quote object for processing.
}

function loadQuoteArray() {
	// currently hardcoded. Optimally, call to a API and load data.
	//console.log("loadQuoteArray");
	var newQuote = { quote:"Nearly all men can stand adversity, but if you want to test a man's character, give him power.", source:"Abraham Lincoln", tags: "adversity, character"
	, bgColors: ["#ca302b", "#a9260c", "#bf1945", "#f2a839", "#db901f"]};
	quotes.push(newQuote);

	newQuote = { quote:"America will never be destroyed from the outside. If we falter and lose our freedoms, it will be because we destroyed ourselves.", source:"Abraham Lincoln"
	, bgColors: ["#b1afea", "#9693dc", "#7f7be8", "605cd5", "#406de9"]};
	quotes.push(newQuote);

	newQuote = { quote:"Those who deny freedom to others, deserve it not for themselves.", source:"Abraham Lincoln", citation:"Complete Works - Volume XII", tags: "freedom"};
	quotes.push(newQuote);

	newQuote = { quote:"They who can give up essential liberty to obtain a little temporary safety deserve neither liberty nor safety.", source:"Benjamin Franklin", 
	citation:"Memoirs of the life and writings of Benjamin Franklin"};
	quotes.push(newQuote);

	newQuote = { quote:"Reader, suppose you were an idiot. And suppose you were a member of Congress. But I repeat myself.", source:"Mark Twain", tags: "political, humor"};
	quotes.push(newQuote);

	newQuote = { quote:"Don't blindly follow your leaders", source:"Prince Farondis", citation: "World of Warcraft", year: "2016"};
	quotes.push(newQuote);
}

// while this seems insignificant on a single line of code, DRY is a really great practice to remember.
function arrayRandomInt(thisArray) {
	return Math.floor(Math.random() * thisArray.length);
}