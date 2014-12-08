var app = {
	templates : undefined,
	containers : undefined,
	pages : undefined,
	tests : undefined
};

app.templates = {
	allTestPage : {
		id : "#allTestPage"
	},
	testStartPage : {
		id : "#testStartPage"
	},
	questionPage : {
		id : "#questionPage"
	},
	resultPage : {
		id : "#resultPage"
	},
	savedTestList : {
		id : "#savedTestList"
	},
	toolbox : {
		id : "#toolbox"
	}
};

var toolboxButtons = {
	home : {
		id : "toolboxHome",
		value : "<",
		action : "goHome();"
	},
	back : {
		id : "toolboxBack",
		value : "<<",
		action : "showPreviousQuestion();"
	},
	forward : {
		id : "toolboxForward",
		value : ">>",
		action : "showNextQuestion()"
	}
};

var activeResults;
var activeTest;
var activeQuestion;
var savedTests = new Array();

function initTemplates() {
	for ( var obj in app.templates) {
		var htmlStr = $(app.templates[obj + ""].id).html();
		if (htmlStr)
			app.templates[obj + ""].template = Handlebars.compile(htmlStr);
		else
			alert("mising element with id " + app.templates[obj + ""].id);
	}
	$("#templateContainer").remove();
}
require([ "resources/test.en.js" ], function(tests) {
	initTemplates();
	app.tests = tests;
	showAllTests();
});

function showQuestion(testId, questionId, direction) {
	testId = testId ? testId : activeQuestion;
	questionId = questionId ? questionId : activeTest;

	activeTest = testId;
	activeQuestion = questionId;

	var context = getQuestion(testId, questionId);
	var htmlStr = app.templates.questionPage.template(context);

	showPage(htmlStr, context.toolboxContext, direction);

	if (activeResults[questionId]) {
		setQuestionResult();
	}
}

function startTest(testId) {
	activeResults = new Object();

	activeTest = testId;
	activeQuestion = undefined;
	var test = getTest(testId);

	var toolboxContex = getToolboxObj();
	toolboxContex.title = "Start test ";

	toolboxContex.leftButton.push({
		value : "<",
		action : "goHome();"
	});

	var htmlStr = app.templates.testStartPage.template(test);

	showPage(htmlStr, toolboxContex, "right");
}

function checkItem(optionId) {
	var question = getQuestion(activeTest, activeQuestion);
	var options = question.answers.answer;
	for (i in options) {
		var o = options[i];
		var s = o.id == optionId;
		$("#option_" + o.id).prop("checked", s);
	}
	selected();
}
function selected() {
	var q = getQuestion(activeTest, activeQuestion);
	var res = validateQuestion();
	if (res) {
		var butt = $("#showNextQuestion");
		butt.html(q.end ? "[ Finish test ]" : "[ Next question ]");
		butt.click(showNextQuestion);
	}
}

function getQuestion(testId, questionId) {

	var test = getTest(testId);
	var questions = test.question;

	for (var i = 0; i < questions.length; i++) {
		var q = questions[i];
		if (q.id == questionId) {
			q.number = (i + 1);
			q.testLength = questions.length;

			q.end = (questions.length - 1 == i);

			var toolboxContext = getToolboxObj();

			toolboxContext.leftButton.push(toolboxButtons.home);
			if (i != 0)
				toolboxContext.leftButton.push(toolboxButtons.back);

			if (!q.end)
				toolboxContext.rightButton.push(toolboxButtons.forward);

			toolboxContext.title = test.name;
			q.toolboxContext = toolboxContext;

			return q;
		}
	}
}

function getTest(testId) {
	var tests = app.tests.all;
	for ( var i in tests) {
		var test = tests[i];
		if (testId == test.id)
			return test;
	}
}

function validateQuestion() {
	var question = getQuestion(activeTest, activeQuestion);
	for ( var i in question.answers.answer) {
		var a = question.answers.answer[i];
		if ($("#option_" + a.id).prop("checked")) {
			activeResults[question.id] = a.id;
			return a.id;
		}

	}
	return undefined;
}

function setQuestionResult() {
	if (activeQuestion && activeTest) {
		var aId = activeResults[activeQuestion];
		if (aId) {
			var question = getQuestion(activeTest, activeQuestion);
			for ( var i in question.answers.answer) {
				var a = question.answers.answer[i];
				if (a.id == aId)
					$("#option_" + a.id).prop("checked", "checked");
			}
		}
	}
}

function clearPage() {
	$(app.containers.pageContainer).empty();
	$(app.containers.toolboxContainer).empty();
}

function showPreviousQuestion() {
	if (activeQuestion && activeTest) {

		var test = getTest(activeTest);
		for (var i = 1; i < test.question.length; i++) {
			var q = test.question[i];
			if (q.id == activeQuestion) {
				showQuestion(activeTest, test.question[--i].id, "left");
				return;
			}
		}
	}
}

function showNextQuestion() {

	var test = getTest(activeTest);

	if (!activeQuestion) { // start of the test
		activeQuestion = test.question[0].id;

		showQuestion(activeTest, activeQuestion, "right");
		return;
	}

	var result = validateQuestion();

	if (result) {
		activeResults[activeQuestion] = result;

		for (var i = 0; i < test.question.length - 1; i++) {
			var q = test.question[i];
			if (q.id == activeQuestion) {
				showQuestion(activeTest, test.question[++i].id, "right");
				return;
			}
		}
		showResults();
	}
}

function showResults(savedResults) {
	var test = getTest(activeTest);
	var result = [];
	var resultStr = ""; // used for combination type

	for (var i = 0; i < test.question.length; i++) {
		var question = test.question[i];
		var qId = question.id;
		var aId = activeResults[qId];

		for (var j = 0; j < question.answers.answer.length; j++) {
			var a = question.answers.answer[j];
			if (a.id == aId) {
				if (test.type == "combination") {
					resultStr += a.id;
				} else {
					result.push({
						"means" : question.means,
						"answer" : a.text
					});
				}
			}
		}
	}
	if (test.type == "combination") {
		for (var i = 0; i < test.results.result.length; i++) {
			if (test.results.result[i].value == resultStr) {
				result.push({
					"means" : test.decription,
					"answer" : test.results.result[i].text
				});
			}
		}
	}

	var toolbarContext = getToolboxObj();
	if(savedResults){
		toolbarContext.title = "Saved results for " + test.name;
	}
	else {
		toolbarContext.title = "Results for " + test.name;
	}
	toolbarContext.leftButton.push(toolboxButtons.home);

	var html = app.templates.resultPage.template({
		"item" : result
	});
	showPage(html, toolbarContext);
}

function showSavedTestList(arg) {
	if (arg == undefined) {

		loadSavedTests(showSavedTestList);
	} else {
		
		try {
			savedTest = arg;
			for (var i = 0; i < savedTest.length; i++) {
				savedTest[i].orderNumber = i; 
			}

			var toolboxContext = getToolboxObj();
			toolboxContext.title= "Saved tests";
			toolboxContext.leftButton.push(toolboxButtons.home);
			
			var htmlString = app.templates.savedTestList.template({
				"item" : savedTest
			});
			
			showPage(htmlString, toolboxContext);
			
		} catch (e) {
			alert(e);
		}
	}
}
function showSavedTest(orderNumber){
	var results = savedTest[orderNumber];
	var activeTest = results.id;
	var activeResults = results;
	showResults();
}
function test(){
	var a =  new Array();
	a.push({"date":99,"testName":"name", "testId":9});
	a.push({"date":33,"testName":"name 33", "testId":9});
	showSavedTestList(a);
}

function mainSaveTest() {

	activeResults.testId = activeTest;
	activeResults.testName = getTest(activeTest).name;
	activeResults.date = new Date().getTime();

	var str = JSON.stringify(activeResults);
	saveTestResults(str, succcesTestSave);
}
function succcesTestSave() {

	showSavedTestList();
}

function getToolboxObj() {
	return {
		rightButton : [],
		leftButton : [],
		title : undefined
	};
}

app.containers = {
	pageContainer : ".pageT",
	pageLeft : ".pageLeft",
	pageLeft : ".pageRight",
};

var firstPage = true;

function showPage(htmlString, toolboxContext, fromDirection) {

	var toDirection = fromDirection == "right" ? "left" : "right";

	var currentPage = $("div.centerT");

	if (!currentPage) {
		alert("can not find current page");
		return;
	}

	var htmlStr = getPageHtml(htmlString, toolboxContext);
	if (firstPage) {
		firstPage = false;
		currentPage.html(htmlStr);

	} else {
		var newPage = "<div class='pageT " + fromDirection + "T'>" + htmlStr
				+ "</div>";
		newPage = $(newPage);
		$("body").append(newPage);

		newPage.offset().left;
		currentPage.attr("class", "pageT " + toDirection + "T transitionT");
		newPage.attr("class", "pageT centerT transitionT");

		currentPage.on("transitionend", function(e) {
			e.target.remove();
		});
		currentPage.on('webkitTransitionEnd', function(e) {
			e.target.remove();
		});

	}
}
function getPageHtml(htmlString, toolboxContext) {
	var html = toolboxContext ? app.templates.toolbox.template(toolboxContext)
			: "";
	html = "<div  class=\"toolbox\">" + html + "</div>";
	html += "<div  class=\"pageContainer\">" + htmlString + "</div>";
	return html;
}

function showAllTests(direction) {

	var toolboxContext = getToolboxObj();
	toolboxContext.title = "Avaliable tests:";

	var context = {
		test : new Array()
	};

	var pageTemplate = app.templates.allTestPage.template;

	var tests = app.tests.all;

	for (var i = 0; i < tests.length; i++) {
		context.test.push(tests[i]);
	}
	var htmlStr = pageTemplate(context);
	showPage(htmlStr, toolboxContext, direction);
}

function goHome() {
	showAllTests("left");
}
