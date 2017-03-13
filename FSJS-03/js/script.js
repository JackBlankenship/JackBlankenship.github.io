//* change log 03/10/2017
//* 1. reset all the valid fields on submit. validName, emailValid, activityValid, paymentValid, formValid
//* 2. Name and Email validation improvement. fixed logic error check on @.com
//* 3. change to the html to support JavaScript being disabled or unavailable.
//* 4. validate all payment fields at once and improve error message to support this feature. Massive changes here.
//     these include a field validation refactor and change to error messaging.
//* 5. added indicator (*) on which fields are required. (not part of the project requirements).
//* 6. logic change for prevent duplicate times on Activities checkbox event.

//* --------------------- *//
//* Global variables      *//
//* --------------------- *//
var activityShortName = "";
var activityFullName = "";
var activityTime = "";
var activityCost = 0.0;
var activity = {};
var activityArray = [];
var totalCost = 0.0;
var validName = false, emailValid = false, activityValid = false, paymentValid = false, formValid = false;
var shirtsArray = []; 
var shirtsPunsColors = ""; 
var shirtsHeartsColors = "";
var propertyArray;
var paymentErrorAll = "";

//* error messages.
const lNameError = '<p id="nameError">Please enter your first and last name</p>';
const lPaymentErrorSelect = "<p>Please select a payment method</p>";
const lPaymentErrorNoCard = "<p>Missing credit card number.</p>";
const lPaymentErrorCardNumber = "<p.Please enter a valid credit card number.</p>";
const lPaymentErrorZip = "<p>Please enter a valid zip code</p>";
const lPaymentErrorCVV = "<p>Please enter a 3 digit CVV</p>";
const lOtherTitle = '<input type="text" id="other-title" name="user_role" placeholder="Your Job Role">';
const lOtherTitleError = '<p id="other-titleError">Please enter your Job Role</p>';
const lEmailError = '<p id="emailError">Please enter an Email like me@home.com</p>';
const lTotalCost = '<p id="totalcost"> Your total is 0</p>';
const lActivityError = '<p id="activityError">Please sign up for Activities</p>';

// div id and class
const idName = "#name";
const idTitle = "#title";
const idCreditCard = "#credit-card";
const idZip = "#zip";
const idCVV = "#cvv";
const idPaypal = "#paypal";
const idBitcoin = "#bitcoin";
const idCCNum = "#cc-num";
const idPaymentError = "#paymentError";
const idPayment = "#payment";
const idOtherTitle = "#other-title";
const idOtherTitleError = "#other-titleError";
const idEMail = "#mail";
const idTotalCost = '#totalcost';
const classActivities = '.activities';
const paymentDomExclusion = [idCreditCard, idPaypal, idBitcoin, idPaymentError];
 
//* --------------------- *//
//* DOM variables         *//
//* --------------------- *//
const form = document.getElementsByTagName('form')[0];
const dElementIdColor = document.getElementById("color");
const $eMail = $(idEMail);
const $activities = $(".activities label");
var $inputChecked = "";

$(idName).focus();				// requirement 1. 
// append name error message. set color to maroon
const $idNameError = domAppendAndHide($(idName), lNameError, "#nameError", "maroon");

$("#colors-js-puns").hide();

// get all the shirt colors and put them either into puns or hearts.
// this is used in #design change event for filtering.
shirtsArray = $("#color > option");						
for (var iShirts = 0; iShirts < shirtsArray.length; iShirts++) {
	if ( (shirtsArray[iShirts].innerHTML).toLowerCase().indexOf("js puns") > 0)  {
		shirtsPunsColors += shirtsArray[iShirts].outerHTML;
	} else {
	 	shirtsHeartsColors += shirtsArray[iShirts].outerHTML;	
	}
}

const inputCssBorder = $( "input").css("border");
const inputCssBorderError = '2px solid red';
const labelColor = $('label').css("color");
const labelColorDisable = "grey";

var lPaymentError = '<div id="paymentError">' + lPaymentErrorSelect + '</div>';
$(idBitcoin).after(lPaymentError);
setCssProperty($(idPaymentError), "color", "maroon");

// append the user "other role" text box after title dropdown.
//const $otherTitle = domAppendAndHide($(idTitle), lOtherTitle, idOtherTitle, false);
const $otherTitle = $(idOtherTitle);
$otherTitle.hide();

// append the error message. set color to maroon
const $idOtherTitleError = domAppendAndHide($otherTitle, lOtherTitleError, idOtherTitleError, "maroon");
// append the email error. leave default color				
const $eMailError = domAppendAndHide($eMail, lEmailError, "#emailError", false);

$(classActivities).after(lTotalCost);
const $totalCost = $(idTotalCost);
$totalCost.hide();
// append the activity error message. set color to maroon
const $activityError = domAppendAndHide($(classActivities), lActivityError, "#activityError", "maroon");

setPaymentDomExclusion(idCreditCard);			// show idCreditCard, hide idPaypal, idBitcoin, idPaymentError
$('[name=user_payment]').val('credit card');	// set credit card as default payment selection.

setConflictTimes();

//* --------------------- *//
//* Function section      *//
//* --------------------- *//
// removed countChecked because the back button logic does not trap all paths back to the submit form.
//var countChecked = function () {
//	totalCost = 0;
//	$inputChecked = $("input:checked");		// should return an array?
//	for (let i = 0; i<$inputChecked.length; i++) {
//		$(".activities :checkbox").index($inputChecked[i]);	
//		 parseActivitiesData($inputChecked[i].parentElement.textContent);
//		 totalCost += activityCost;
//	};
//	setActivityValidFields();
//};

function setActivityValidFields() {
    if (totalCost > 0) {
    	$totalCost.text('Your total is $' + totalCost);
    	$totalCost.show();
    	activityValid = true;
    	$activityError.hide();
    } else {
    	$totalCost.hide();
    	activityValid = false;
    	$activityError.show();
    }
};
function domAppendAndHide(sourceDom, newDomElement, newDomID, color) {
	sourceDom.after(newDomElement);
	var $tempDom = $(newDomID);
	$tempDom.hide();
	if (color) {
		setCssProperty($tempDom, "color", color);
	}
	return $tempDom;
}
// const setConflictTimes = () => {
function setConflictTimes() {

	for (var i=0; i < $activities.length; i++) {						// grab all the activities from page
		parseActivitiesData($activities[i].textContent);				// get this entries information and build object
		propertyArray = Object.getOwnPropertyNames(activity);			// get property names
		if ( hasDateTime(activity) ) {									// if you have a date time
			activity['conflict'] = [];									// create the conflit property
		}
		activityArray.push(activity);									// add to the activityArray
		activity = {};													// reset the object for next activity
	}

	for (var k=0; k < activityArray.length; k++) {						// loop through activity array
		propertyArray = Object.getOwnPropertyNames(activityArray[k]);	// get the property names
		if ( hasDateTime( activityArray[k]) ) {							// if primary has a datetime
			for (var l = k+1; l < activityArray.length; l++) {			// check rest of array
				if ( hasDateTime( activityArray[l] ) ) {				// if sub activity has datetime
					if ( timeConflict(activityArray[k], activityArray[l]) ) {		// call function to detect time collision
						activityArray[k]['conflict'].push(l);			// set conflict array source to target
						activityArray[l]['conflict'].push(k);			// set conflict array target to source so both events know about each other.
					}
				}
			}
		}
	}
}; 

function hasDateTime(thisActivity) {
	var propertyArray = Object.getOwnPropertyNames(thisActivity);	// load all the object property names to an array

	if (propertyArray.indexOf('day') < 0) {			// if no day found, return false
		return false;
	} else {										// otherwise true
		return true;
	}
}
function timeConflict(activity1, activity2) {

	if (activity1['day'] === activity2['day']) {			// occurs the same day
		if (activity1['begin'] < activity2['end']) {			
			if (activity1['end'] > activity2['begin']) {	// both begin before either ends
				return true;								// we have a conflict
			}												// otherwise begin/end times either match 
		}													// or they are outside each other.
	}
	return false;											// no conflict found.
}
// const parseActivitiesData = (thisInfo) => {
function parseActivitiesData(thisInfo) {
	var currIndex, beginIndex, endIndex;

	thisInfo = thisInfo.trim();										// strip out leading and trailing spaces.
	beginIndex = 0;													// start at the begging of the string
	endIndex = thisInfo.indexOf('—');								// Warning, that is not a - dash character.
	activityFullName = thisInfo.substr(beginIndex, endIndex - 1);	// get the activity name.
	activity['name'] = activityFullName;							// add name to object
	beginIndex = endIndex + 1;										// move index past the string terminator
	endIndex = thisInfo.indexOf('$', beginIndex);					// position to the dollar sign.

	if (endIndex > (beginIndex + 2)) {								// check for no date time information
		currIndex = thisInfo.indexOf(',', (endIndex - 3));			// move back in the string and find the date time terminator.
		activityTime = thisInfo.substr(beginIndex, (currIndex - beginIndex)).trim();
		getDateTimeData(activityTime);								// call getDateTimeDate function for this activity
		beginIndex = endIndex + 1;
	} else {
		activityTime = "";
	}	
	activityCost = Number(thisInfo.substr(endIndex + 1));			// find the activity cost
	activity['cost'] = activityCost;								// set cost into the object.
};

function getDateTimeData(thisDayTime) {
	var splitIndex = thisDayTime.search(" ");				// split the day and time by the space character.
	var thisDay = thisDayTime.substr(0, splitIndex);		// zero based math 
	var beginTime, endTime;
	endTime = thisDayTime.indexOf('-', splitIndex);			// lazy use of endTime as an index.		
	beginTime = thisDayTime.substr(splitIndex + 1, endTime - splitIndex - 1);
	splitIndex = endTime;
	endTime = thisDayTime.substr(splitIndex + 1);			// offset for the -
	beginTime = getTwentyFourHour(beginTime);				// get 24 hour clock on beginTime.
	endTime = getTwentyFourHour(endTime);					// get 24 hour clock on endTime.
	activity['day'] = thisDay;								// set all three to the activity object.
	activity['begin'] = beginTime;
	activity['end'] = endTime;
}

function getTwentyFourHour(twelveHour) {
	var amOrPM;
	var twentyFour;
	if (twelveHour.length == 4) {						// we have a 2 digit hour
		amOrPM = twelveHour.substr(2,2);
		twentyFour = Number(twelveHour.substr(0,2));	// cast to a Number.
	} else {
		amOrPM = twelveHour.substr(1,2);
		twentyFour = Number(twelveHour.substr(0,1));	// cast to a Number
	};	

	if (twentyFour < 12) {
		if (amOrPM.toLowerCase() == "pm") {
			twentyFour += 12;							// adjust 1-11 pm to 13-23
		}
	} else {
		if (amOrPM.toLowerCase() == "am") {				// 12 am is 24.
			twentyFour += 12;
		}
	}
	 return twentyFour;
};


function validateCardInfo () {

 	paymentValid = true;
 	var nCCnum = Number($(idCCNum).val()).toString();
 	var nZip = Number($(idZip).val()).toString();
 	var nCVV = Number($(idCVV).val()).toString();

// 	function validateCvv () {
//		console.log("validateCvv");
//		
// 		if (nCVV.length === 3) {
//			$(idPaymentError).hide();
//			setInputBorder( $(idCVV), inputCssBorder);	
//		} else {
//			paymentValid = false;
//			paymentErrorAll += lPaymentErrorCVV;
//			setInputBorder( $(idCVV), inputCssBorderError);
//			$(idCVV).focus();
//		}
//	};

//	function validateZip () {
//		console.log("validateZip");
//		if (nZip.length === 5) {
//			setInputBorder( $(idZip), inputCssBorder);
//		} else {
//			paymentErrorAll += lPaymentErrorZip;
//		}
//		$(idPaymentError).show();
//		setInputBorder( $(idZip), inputCssBorderError);
//		paymentValid = false;
//		$(idZip).focus();
//	};

//	function validateCard () {
//		console.log("validateCard length:"+ nCCnum.length + " credit-card:" + nCCnum +":");
//		if ( (nCCnum.length >= 13) && (nCCnum.length <= 16) ) {
// 			setInputBorder( $(idCCNum), inputCssBorder);
//		} else {
//	 		if ( (nCCnum.length < 1) || (nCCnum === "0") )  {
//				paymentErrorAll += lPaymentErrorNoCard;
//			} else {
//				paymentErrorAll += lPaymentErrorCardNumber;
//			}
//			setInputBorder( $(idCCNum), inputCssBorderError);
//			$(idCCNum).focus();
//			paymentValid  = false;
//		}
//	};
	function validateCardField(source, minLength, maxLength, domElement, errorMessage, zeroInvalid, errorMessage2) {

		if ((source.length < minLength) || (source.length > maxLength)) {
			setInputBorder( domElement, inputCssBorderError);
			if (zeroInvalid && source < 1) {
				paymentErrorAll += errorMessage2;
			} else {
				paymentErrorAll += errorMessage;
			}
			paymentValid = false;
			return false;
		} else {
			setInputBorder( domElement, inputCssBorder);
			return true;
		};

	};

	paymentErrorAll = "<p>Please correct the following errors.</p>";
// 	validateCard();
//	validateZip();
// 	validateCvv();
	var validCard = validateCardField( nCCnum, 13, 16, $(idCCNum), lPaymentErrorCardNumber, true, lPaymentErrorNoCard);
	if (validCard) {
		$(idZip).focus();
	}
	var validZip = validateCardField( nZip, 5, 5, $(idZip), lPaymentErrorZip, false, null);
	if (validZip) {
		$(idCVV).focus();
	};
	var validCVV = validateCardField( nCVV, 3, 3, $(idCVV), lPaymentErrorCVV, false, null);

	if(!validCard) {
		$(idCCNum).focus();
	}

	if (paymentValid) {
		$('button').focus();
		$(idPaymentError).hide();
		ReadyForSubmit();
	} else {
		$(idPaymentError).html(paymentErrorAll);
		$(idPaymentError).show();
		formValid = false;
	};

};

function ReadyForSubmit() {		// yeah, need a better function name.

	validName = verifyName();	// forgot why i force this function fire here. 
	formValid = true;			// set formValid to true. check required fields below to error.

	if (!paymentValid) {
		if ( $(idPayment).val() == "credit card") {
			validateCardInfo();
		} else {
			validatePaymentType();
		};
		formValid = false;
	};

	if (!emailValid || !activityValid || !validName || !paymentValid) {
		formValid = false;
	};

	if (activityValid) {
		$activityError.hide();
	} else {
		//countChecked();					// due to back button // actually it still wont work and cant fix all situations.
		//if (!activityValid) {
		$activities[0].focus();
		$activityError.show();	
		//}
	};

	if (!emailValid) {
		$eMailError.show();
		setInputBorder($eMail, inputCssBorderError);
		$eMail.focus();
	};

	if (!validName) {
		$(idName).focus();
		$idNameError.show();
	};

	if (formValid) {
		$('button').focus();
		$("#submitready").hide();
	};
	
};

function verifyName() {

	if( $(idName).val() > "" ) {
		var nameArray = $(idName).val().split(" ");
		if (nameArray.length > 1) {
			setInputBorder($(idName), inputCssBorder);
			$idNameError.hide();
			return true;
		}
	};
	setInputBorder( $(idName), inputCssBorderError);
	return false;
};
// next refactor change to setCssProperty(domElement, property, value)
function setInputBorder(domElement, style) {
	setCssProperty(domElement, "border", style);
}
function setCssProperty(domElement, property, value) {
	domElement.css(property, value);
}
function setPaymentDomExclusion (showDom) {
	for (let i=0; i< paymentDomExclusion.length; i++) {
		if (showDom === paymentDomExclusion[i]) {
			$(paymentDomExclusion[i]).show();
		} else {
			$(paymentDomExclusion[i]).hide();
		}
	}
};
function validateEmail () {				// this function gets called on change and keyup events.
	if ($eMail.val().length > 0) {
		$eMailError.show();
		// so, according to the standards, you can have multiple @ within "". However, some browsers block that and error our BEFORE your code runs.
		var atSignIdx = $eMail.val().indexOf('@');

		if (atSignIdx > 0)	{
			atSignIdx = $eMail.val().indexOf(".", (atSignIdx + 2));
			if ( (atSignIdx  > 0) && $eMail.val().length > atSignIdx + 2 ) {
				$eMailError.hide();
				emailValid = true;
				setInputBorder($eMail, inputCssBorder);
			}
		}
	}
};
function validatePaymentType () {
	if ($(idPayment).val() == "credit card") {
		setPaymentDomExclusion(idCreditCard);
		$(idCCNum).focus();
		validateCardInfo();
	} else 	if ($(idPayment).val() == "paypal") {
		setPaymentDomExclusion(idPaypal);
		paymentValid = true;
	} else 	if ($(idPayment).val() == "bitcoin") {
		setPaymentDomExclusion(idBitcoin);
		paymentValid = true;
	} else {
		$(idPaymentError).html(lPaymentErrorSelect);
		$(idPaymentError).show();
		paymentValid = false;
	};
};
//* --------------------- *//
//*  Events  section      *//
//* --------------------- *//
$(idName).keyup( function () {
	validName = verifyName();
});
$(idName).change( function () {
	validName = verifyName();
});

$(idTitle).change( function() {
	if ($(idTitle).val() == "other") {
		$otherTitle.show(); 
		$otherTitle.focus();
	} else {
		$otherTitle.hide();
		$idOtherTitleError.hide();

	}
});
$(idOtherTitle).blur( function(){
	setInputBorder( $otherTitle, inputCssBorder);
	if ($(idTitle).val() == "other") {
		if ( $(idOtherTitle)[0].value > "") {
			$idOtherTitleError.hide();
		} else {
			$otherTitle.focus();
			setInputBorder( $otherTitle, inputCssBorderError);
			$idOtherTitleError.show();
		}
	} else {
		$idOtherTitleError.hide();	// really odd event firing this blur on a title change.
	}
});

 
$("#design").change( function(){
	$("#colors-js-puns").show();

	if ($(this).val() == "js puns") {
		dElementIdColor.innerHTML = shirtsPunsColors; 
	} else {
		if ($(this).val() == "heart js") {
			dElementIdColor.innerHTML = shirtsHeartsColors; 
		} else {	
			$("#colors-js-puns").hide();
		}
	}
});

$('.activities').on('change', ':checkbox', function () {

	function toggleEventAvailability(array, value) {
		for (var i = 0; i < array.length ; i++) {
			$activities[ array[i]].firstElementChild.disabled = value;
// the following did not work....			
//			setCssProperty($activities[ array[i]].firstElementChild, "color", labelColorDisable);
// so we check to see if disabled value = true, then add class ONLY when the index matches the activity to grey out
// otherwise we remove disabled class. This came about during testing on Microsoft Edge browser as visually the checkbox
// grey out was really hard to see.
			if (value) {
				$activities.addClass(function(index) {
					if (index === array[i]) {
						return "disabled";
					}
				});

			 } else {
			 	$activities.removeClass(function(index) {
			 		if (index === array[i]) {
			 			return "disabled"; 
			 		}
			 	}); 
			}
		}
	}

	activity = {};								// reset the object for next activity
    parseActivitiesData($(this).parent().text());
    //var activityIndex = 0; 											// not really happy with this setting an index and then
    //for (var i=0; i<activityArray.length; i++) {					// search through the array to find matching name on Object
    //	if ( activityArray[i]['name'] === activity['name'] ) {
    //		activityIndex = i;
    //	}
    //};
    var activityIndex = $(".activities :checkbox").index(this);

    propertyArray = Object.getOwnPropertyNames(activityArray[activityIndex]);	// get property names

    if ($(this).is(':checked')) {												// check activities add to cost
        totalCost += activityCost;
        if (propertyArray.indexOf('conflict') < 0) {				        	// nothing to toggle. else
        } else if ( activityArray[activityIndex]['conflict'].length > 0) {		// prevent duplicate times from being selected.
        	toggleEventAvailability( activityArray[activityIndex]['conflict'], true);
        }
    } else {																	// this activity has been deselected
        if (propertyArray.indexOf('conflict') < 0) {
        } else if ( activityArray[activityIndex]['conflict'].length > 0) {		// enable those that were prior disabled
        	toggleEventAvailability( activityArray[activityIndex]['conflict'], false);
        }
        totalCost -= activityCost;												// subtract from total cost.
    }
    setActivityValidFields();

});

$(idPayment).change( function() {
	validatePaymentType();
});

$(idCCNum).change( function () {
	validateCardInfo();
});

$(idZip).change( function () {
	validateCardInfo();
});

$(idCVV).keyup( function(){
	validateCardInfo();
})

$eMail.keyup( function () { validateEmail(); });
$eMail.change( function () {validateEmail(); });

form.addEventListener('submit', (e) => {
	if (!formValid) {
		e.preventDefault();
		console.log("form submit not valid yet");
		ReadyForSubmit();
	} else {
		console.log("submit");
		validName = false, emailValid = false, activityValid = false, paymentValid = false, formValid = false;
		totalCost = 0;
	}
});