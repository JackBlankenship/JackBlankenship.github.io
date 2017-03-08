// Project code follows.
// Change log.
// Refactor 1. function getHTMLSection(pageNumber);
// Refactor 2. replace the student arrays with a single array loaded as a student object.
// Refactor 3. create a setPaginateButtons, rename getHTMLSection to setHTMLSection 

//* --------------------- *//
//* Global variables      *//
//* --------------------- *//


var fullStudentsArray = [];
var pageCount = 1;
var studentCount = 1;
var studentsPerPage = 10;
var pageinates = 0;

 					// .innerHTML;

//* --------------------- *//
//* DOM variables         *//
//* --------------------- *//

const classStudentList = '.student-list';
const dStudentList = document.getElementsByClassName("student-list");
const eStudentsTooMany = '<div class="error"> Too many students found. Please modify your search</div>';
const eStudentsNone = '<div class="error"> No student found with that name. Please modify your search</div>';
const searchHTML = '<div class="student-search"><input placeholder="Search for students..."><button>Search</button></div>';
var pageinateHTML = '<div class="pagination"> <ul> <li><a class="active" href="#">1</a> </li></ul></div>';

// get all the data from the html regarding students and put into an array;
var $studentsName = $(".student-details h3");		// create a Student name array to be used below.
var $student = $(classStudentList).children();		// studentsDetailsAll
var $studentsEmail = $('.email'); 

//* --------------------- *//
//* Function section      *//
//* --------------------- *//

//const setPaginateButtons = (thisStudentsArray) => {
function setPaginateButtons(thisStudentsArray) {
	pageinates = Math.ceil(thisStudentsArray.length / studentsPerPage);	// you have to account for partial page
																// use the array and students per page to build out the following template.
	pageinateHTML = "";
	pageCount = 1;
	for (var j = 1; j < pageinates; j++) {						// start at two because it (page 1) is included below.
		pageCount++;
		pageinateHTML += '<li><a href="#">' + pageCount + '</a> </li>';
	}

	$(".pagination ul").remove(); 				//remove the old page buttons
	pageinateHTML = '<ul><li><a class="active" href="#">1</a> '  + pageinateHTML + "</ul>";		// set page 1 as default active and insert the rest
	if (pageinates > 1) {
		$(".pagination").append(pageinateHTML);		// append to the end of pagination class
	}

}

//Given a starting page number build the corresponding HTML and load it.
// const setHTMLSection = (pageNumber, thisStudentsArray) => {
function setHTMLSection(pageNumber, thisStudentsArray) {		// to make the exceeds, I will need to pass in an array also. because the search feature will build a temp of matcing names.
	var startingStudent = (pageNumber - 1) * studentsPerPage;
	var endingStudent = startingStudent + studentsPerPage;
	var thisHTML = '';

	// account for a partial page.
	if (endingStudent > thisStudentsArray.length) {		// studentsArray replaces students Refactor 2.
		endingStudent = thisStudentsArray.length;		// studentsArray replaces students Refactor 2. 
	}  

	for ( var k = startingStudent; k < endingStudent; k++) {
		thisHTML += thisStudentsArray[k]['Html'];		// studentsArray replaces students Refactor 2.
	}
	dStudentList[0].innerHTML = thisHTML;				// because get getElementsByClassName returns an array. Personally, I would have made that an ID.

}

function realTimeSearch() {	
	var partialStudentsArray = [];										// empty out the array
	var studentName = $("input").val();									// get the student name search value
	for (var l = 0; l < fullStudentsArray.length; l++) {				// look at the entire array
		if (fullStudentsArray[l]["Name"].indexOf(studentName) >= 0) {	// if a match is found
			partialStudentsArray.push(fullStudentsArray[l]);			// add to this array
		} else  {														// else check the email value for a match.
			if (fullStudentsArray[l]["eMail"].indexOf(studentName) >= 0) {
				partialStudentsArray.push(fullStudentsArray[l]);
			}
		}
	}

	if (partialStudentsArray.length < 1) {						// no rows returned
		dStudentList[0].innerHTML = eStudentsNone;				// set error message and then focus on search field.
		document.querySelector(".student-search > input").focus();
		$(".error").css({ "color": "red"});
		$(".pagination ul").remove(); 							//remove the old page buttons
	} else {
		setHTMLSection(1, partialStudentsArray);					// call setHTMLSection to build the page.
		setPaginateButtons(partialStudentsArray);
	}
}
//* --------------------- *//
//* Main logic section    *//
//* --------------------- *//

$('.page-header > h2').after( searchHTML);			// target only the h2 element in the page-header class for the Search html.
// Build the students array. 
for (var i = 0; i < $student.length; i++) {
	fullStudentsArray.push( {Name: $studentsName[i].innerText, Html: $student[i].outerHTML, eMail: $studentsEmail[i].innerText});
}

setHTMLSection(1, fullStudentsArray);				// grab the student information from the main array.
$(classStudentList).after(pageinateHTML);			// append to the correct HTML area
setPaginateButtons(fullStudentsArray);				// create the buttons area from fullStudentArray.

//* --------------------- *//
//*  Events  section      *//
//* --------------------- *//

// event listener to respond to "Page" button clicks  change to  (event)
$('.pagination').click( function () {
	if (event.target.tagName == "A") { 
		$('.pagination li a').removeClass("active");						// remove the old class active from prior button
		setHTMLSection(event.target.innerHTML, fullStudentsArray);			// call setHTMLSection to build the page.
		$(event.target).addClass("active");									// set this button to class active to highlight.
	}
});

// event listener to respond to "Search" button clicks
$('.student-search button').click( function(){
	var partialStudentsArray = [];										// empty out the array
	var studentName = $("input").val();									// get the student name search value
	for (var l = 0; l < fullStudentsArray.length; l++) {				// look at the entire array
		if (fullStudentsArray[l]["Name"].indexOf(studentName) >= 0) {	// if a match is found
			partialStudentsArray.push(fullStudentsArray[l]);			// add to this array
		} else  {														// else check the email value for a match.
			if (fullStudentsArray[l]["eMail"].indexOf(studentName) >= 0) {
				partialStudentsArray.push(fullStudentsArray[l]);
			}
		}
	}

	if (partialStudentsArray.length < 1) {						// no rows returned
		dStudentList[0].innerHTML = eStudentsNone;				// set error message and then focus on search field.
		document.querySelector(".student-search > input").focus();
		$(".error").css({ "color": "red"});
		$(".pagination ul").remove(); 							//remove the old page buttons
	} else {
		setHTMLSection(1, partialStudentsArray);					// call setHTMLSection to build the page.
		setPaginateButtons(partialStudentsArray);
	}

});

// event listener to detect a change in the search value
$(".student-search input").keyup( function (){
	if ( $("input").val().length === 0) {		// when the search input field is blanked out
		setHTMLSection(1, fullStudentsArray);	// reset to the full student array.
		setPaginateButtons(fullStudentsArray);	// reset the page buttons.
	} else {
		realTimeSearch();
	}
});