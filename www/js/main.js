var app = {
    templates: undefined,
    containers: undefined,
    pages: undefined,
    tests: undefined
}

app.templates = {
    allTestPage: {
        id: "#allTestPage",
        template: undefined
    },
    testStartPage: {
        id: "#testStartPage",
        template: undefined
    },
    questionPage: {
        id: "#questionPage",
        template: undefined
    },
    resultPage: {
        id: "#resultPage",
        template: undefined
    },
    innerTestMenu: {
        id: "#innerTestsMenu",
        template: undefined
    }

}

app.containers = {
    pageContainer: "#pageContainer"
}


var activeResults;
var activeTest;
var activeQuestion;

require(["resources/test.en.js"], function (tests) {
    app.templates.questionPage.template = Handlebars.compile($(app.templates.questionPage.id).html());
    app.templates.resultPage.template = Handlebars.compile($(app.templates.resultPage.id).html());
    app.templates.testStartPage.template = Handlebars.compile($(app.templates.testStartPage.id).html());
    app.templates.innerTestMenu.template = Handlebars.compile($(app.templates.innerTestMenu.id).html());
    app.tests = tests;
    showAllTests();
});

function showQuestion(testId, questionId) {
    testId = testId ? testId : activeQuestion;
    questionId = questionId ? questionId : activeTest;

    activeTest = testId;
    activeQuestion = questionId;

    var context = getQuestion(testId, questionId);
    var htmlStr = app.templates.questionPage.template(context);
    var container = $(app.containers.pageContainer);
    container.empty();
    var menuString = getInnerTestMenu();
    container.html(htmlStr + menuString);
    if (activeResults[questionId]) {
        setQuestionResult();
    }
}

function startTest(testId) {
    activeResults = new Object();

    activeTest = testId;
    activeQuestion = undefined;
    var test = getTest(testId);

    var htmlStr = app.templates.testStartPage.template(test);
    showPage(htmlStr);
}

function selectItem(optionId) {
    var question = getQuestion(activeTest, activeQuestion);
    var options = question.answers.answer;
    for (i in options) {
        var o = options[i];
        $("#option_" + o.id).prop("checked", o.id == optionId);
    }
}

function getQuestion(testId, questionId) {

    var test = getTest(testId);
    var questions = test.question;

    for (var i = 0; i < questions.length; i++) {
        var q = questions[i];
        if (q.id == questionId) {
            q.end = questions.length == i + 1;
            return q;
        }
    }
}

function getTest(testId) {
    var tests = app.tests.all;
    for (var i in tests) {
        var test = tests[i];
        if (testId == test.id)
            return test;
    }
}

function validateQuestion() {
    var question = getQuestion(activeTest, activeQuestion);
    for (var i in question.answers.answer) {
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
            for (var i in question.answers.answer) {
                var a = question.answers.answer[i];
                if (a.id == aId)
                    $("#option_" + a.id).prop("checked", "checked");
            }
        }
    }
}

function clearPage() {
    $(app.containers.pageContainer).empty();
}

function showPreviousQuestion() {
    if (activeQuestion && activeTest) {

        var test = getTest(activeTest);
        for (var i = 1; i < test.question.length; i++) {
            q = test.question[i];
            if (q.id == activeQuestion) {
                showQuestion(activeTest, test.question[--i].id);
                return;
            }
        }
    }
}

function showNextQuestion() {

    var test = getTest(activeTest);

    if (!activeQuestion) { //start of the test
        activeQuestion = test.question[0].id;
        showQuestion(activeTest, activeQuestion);
        return;
    }

    var result = validateQuestion();

    if (result) {
        activeResults[activeQuestion] = result;

        for (var i = 0; i < test.question.length - 1; i++) {
            q = test.question[i];
            if (q.id == activeQuestion) {
                showQuestion(activeTest, test.question[++i].id);
                return;
            }
        }
        showResults();
    }
}

function showResults() {
    var test = getTest(activeTest);
    var result = [];
    var  resultStr = ""; // used for combination type
    
    for (var i = 0; i < test.question.length; i++) {
        var question = test.question[i];
        var qId = question.id;
        var aId = activeResults[qId];

        for (var j = 0; j < question.answers.answer.length; j++) {
            var a = question.answers.answer[j];
            if (a.id == aId) {
                if (test.type == "combination") {
                    resultStr+=a.id;
                } else {
                    result.push({
                        "means": question.means,
                        "answer": a.text
                    });
                }
            }
        }
    }
    if(test.type == "combination"){
        for(var i= 0;i<test.results.result.length;i++){
            if(test.results.result[i].value==resultStr){
                result.push({"means":test.decription, "answer":test.results.result[i].text})
            }  
        }
    }

    showPage(app.templates.resultPage.template({
        "item": result
    }));

}

function showPage(htmlString) {

    if (htmlString) {
        clearPage();
        var container = $(app.containers.pageContainer);
        container.html(htmlString);
    } else {
        alert("problem in add to page container ")
    }
}

function showAllTests() {

    var context = {
        test: new Array()
    };

    var htmlStr = "";
    var pageTemplate = Handlebars.compile($(app.templates.allTestPage.id).html());

    var tests = app.tests.all;

    for (var i = 0; i < tests.length; i++) {
        context.test.push(tests[i]);
    }
    var htmlStr = pageTemplate(context);
    var container = $(app.containers.pageContainer);
    container.html(htmlStr);
}

function goHome() {
    showAllTests();
}

function getInnerTestMenu() {
    if (activeTest && activeQuestion) {
        var context = {
            first: false,
            last: false
        };
        var test = getTest(activeTest);
        for (var i = 0; i < test.question.length; i++) {
            var q = test.question[i];
            if (q.id == activeQuestion) {
                context.first = (i == 0);
                context.last = (i == (test.question.length - 1));
                return app.templates.innerTestMenu.template(context);
            }
        }
    }
    return "";
}