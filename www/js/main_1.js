var texts = {
	allTestPageTitle : "Avalible Test",
	resultPageTitle : "Result from test %1",
	starTestPageTitle : "Start test ",

};

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
	toolbox : {
		id : "#toolbox"
	}
};
var defaultPageId = "AllTests";

app.pages = {
	AllTests : {
		constructor : getPageAllTests,
		id : "AllTests",
		def : true
	},
	Question : {
		constructor : getPageQuestion,
		id : "Question",
		params : [ "testId", "questionId" ]
	},
	Results : {
		constructor : getPageResults,
		id : "Results",
		params : [ "testId" ]
	},
	TestIntro : {
		constructor : getPageTestIntro,
		id : "TestIntro",
		params : [ "testId" ]
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

app.containers = {
	pageContainer : "#pageContainer",
	toolboxContainer : "#toolboxContainer",
};

var activeResults;
var activeTest;
var activeQuestion;

function route() {
	var pageId;
	var params = undefined;

	var hash = window.location.hash;
	if (hash && hash.trim() != "") {
		var arr = hash.split(".");
		pageId = arr[0].substring(1);
		if (app.pages[pageId]) {
			if (arr.length > 1)
				params = arr.splice(1);
		} else {
			debugMsg("page " + pageId + " does not exists ");
		}
	} else
		pageId = defaultPageId;

	showPage(pageId, params);
}

$(window).on('hashchange', route);

function showPage(pageId, params) {
	var pageContext = getPage(pageId, params);

	if (pageContext && pageContext.html) {

		clearPage();

		var html = pageContext.toolboxContext ? app.templates.toolbox
				.template(pageContext.toolboxContext) : "";
		var toolboxContainer = $(app.containers.toolboxContainer);
		toolboxContainer.html(html);

		var container = $(app.containers.pageContainer);
		container.html(pageContext.html);

	} else {
		alert("problem in add to page container ");
	}

}

function getPage(pageId, params) {
	pageId = pageId ? pageId : defaultPageId;
	var p = app.pages[pageId];
	if (p) {
		var pageContext = p.constructor(params);
		return pageContext;
	} else {
		debugMsg("page with id " + pageId + " does not exist");
	}
}

function debugMsg(msg) {
	window.alert(msg);
}

function initTemplates() {
	for ( var obj in app.templates) {
		var htmlStr = $(app.templates[obj + ""].id).html();
		if (htmlStr)
			app.templates[obj + ""].template = Handlebars.compile(htmlStr);
		else
			alert("mising element with id " + app.templates[obj + ""].id);
	}
}
require([ "resources/test.en.js" ], function(tests) {
	initTemplates();
	app.tests = tests;
	route();
});

function checkItem(optionId) {
	var question = getQuestion(activeTest, activeQuestion);
	question.hasAnswer = false;
	var options = question.answers.answer;
	for (i in options) {
		var o = options[i];
		o.selected = false;
		var sel = o.id == optionId;
		$("#option_" + o.id).prop("checked", sel);
		if (sel) {
			o.selected = true;
			activeResults[question.id] = o.id;
			question.hasAnswer = true;
		}
	}
	if (question.hasAnswer) {
		var butt = $("#showNextQuestion");
		butt.html(question.end ? "[ Finish test ]" : "[ Next question ]");
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
function getTestFirstQuestionId(testId) {
	var t = getTest(testId);
	if (t) {
		return t.question[0].id;
	}
}

function getTest(testId) {
	var tests = app.tests.all;
	for ( var i in tests) {
		var test = tests[i];
		if (testId == test.id)
			return test;
	}
	debugMsg("test with id = " + testId + " is undefined ");
}

function selectedAnswer() {
	var question = getQuestion(activeTest, activeQuestion);
	activeResults[question.id] = undefined;
	for ( var i in question.answers.answer) {
		var a = question.answers.answer[i];
		a.selected = false;
		if ($("#option_" + a.id).prop("checked")) {
			a.selected = true;
			activeResults[question.id] = a.id;
		}
	}
	return activeResults[question.id];
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
				showQuestion(activeTest, test.question[--i].id);
				return;
			}
		}
	}
}

function showNextQuestion() {

	var toolboxContext = getToolboxObj();
	var test = getTest(activeTest);

	// if (!activeQuestion) { // start of the test
	// activeQuestion = test.question[0].id;
	//
	// showQuestion(activeTest, activeQuestion);
	// return;
	// }
	if (activeQuestion) {
		var question = getQuestion(activeTest, activeQuestion);
		var result = validateQuestion();
		if (result) {

			for (var i = 0; i < test.question.length - 1; i++) {
				var q = test.question[i];
				if (q.id == activeQuestion) {
					showQuestion(activeTest, test.question[++i].id);
					return;
				}
			}
			showResults();
		}
	} else {
		debugMsg("no active question");
	}
}

function showQuestion(testId, questionId) {
	var params = new Array();
	params[0] = testId;
	params[1] = questionId;
	showPage(app.pages.Question.id, params);
}

function validateQuestion() {
	var question = getQuestion(activeTest, activeQuestion);
	for (var i = 0; i < question.answers.answer; i++) {
		if (question.answers.answer[i].selected)
			return question.answers.answer[i];
	}
	;
}
function getToolboxObj() {
	return {
		rightButton : [],
		leftButton : [],
		title : undefined
	};
}

function getPageObj() {
	return {
		html : undefined,
		toolboxContext : undefined,
		nextPage : false,
		previousPage : false
	};
}

function getPageAllTests() {

	var toolboxContext = getToolboxObj();
	toolboxContext.title = "Avaliable tests";

	var context = {
		test : new Array()
	};

	var pageTemplate = app.templates.allTestPage.template;

	var tests = app.tests.all;

	for (var i = 0; i < tests.length; i++) {
		context.test.push(tests[i]);
	}
	var htmlStr = pageTemplate(context);

	var pageObj = getPageObj();

	pageObj.html = htmlStr;
	pageObj.toolboxContext = toolboxContext;

	return pageObj;
}

function getPageQuestion(params) {
	var testId = undefined;
	var questionId = undefined;
	if (params) {
		testId = params[0];
		if (testId && params.length == 1) {
			questionId = getTestFirstQuestionId(testId);
		} else {
			questionId = params[1];
		}
	} else { // not sure if needed
		testId = activeTest;
		questionId = activeQuestion;
	}
	if (testIsValid(testId, questionId)) {
		activeTest = testId;
		activeQuestion = questionId;

		var p = getPageObj();

		var context = getQuestion(testId, questionId);
		var htmlStr = app.templates.questionPage.template(context);

		p.html = htmlStr;
		p.toolboxContext = context.toolboxContext;

		return p;
	} else {
		return getPageTestIntro(testId);
	}
}

function testIsValid() {
	return true;
}

function getPageTestIntro(params) {
	var testId;
	if (params) {
		testId = params[0];
	} else {
		testId = activeTest;
	}

	activeResults = new Object();

	activeTest = testId;
	activeQuestion = undefined;
	var test = getTest(testId);

	var toolboxContex = getToolboxObj();
	toolboxContex.title = texts.starTestPageTitle;

	toolboxContex.leftButton.push({
		value : "<",
		action : "goHome();"
	});

	var htmlStr = app.templates.testStartPage.template(test);

	var pageContext = getPageObj();
	pageContext.html = htmlStr;
	pageContext.toolboxContext = toolboxContex;
	return pageContext;

}

function appHref(hrefStr) {
	document.location.href = "#" + hrefStr;
}
function getPageResults(params) {
	var testId = undefined;
	if (params) {
		testId = param[0];
	} else {
		testId = activeTest;
	}

	var test = getTest(testId);
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
	toolbarContext.title = "Results for " + test.name;
	toolbarContext.leftButton.push(toolboxButtons.home);

	var html = app.templates.resultPage.template({
		"item" : result
	});
	generatePage(html, toolbarContext);

}
function getTestIsValid(testId, questionId) {
	return true;
	// todo return true if all previous question has been answered
}

function goHome() {
	appHref(app.pages.AllTests.id);
}