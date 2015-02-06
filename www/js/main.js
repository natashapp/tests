var app = {
    templates: undefined,
    containers: undefined,
    pages: undefined,
    tests: undefined
};

app.templates = {
    allTestPage: {
        id: "#allTestPage"
    },
    testStartPage: {
        id: "#testStartPage"
    },
    questionPage: {
        id: "#questionPage"
    },
    resultPage: {
        id: "#resultPage"
    },
    savedTestList: {
        id: "#savedTestList"
    },
    toolbox: {
        id: "#toolbox"
    },
    footer: {
        id: "#footer"
    },
    commentsPage: {
        id: "#commentsPage"
    }
};

var toolboxButtons = {
    home: {
        id: "toolboxHome",
        class: "home",
        action: "goHome();"
    },
    facebook: {
        id: "facbookButton",
        class: "facebook",
        action: "goHome();"
    },
    about: {
        id: "aboutButton",
        value: "About",
        action: "showAboutPage();"
    },
    contextMenu: {
        id: "contextMenuButton",
        class: "contextMenu",
        action: "showContextMenu();"
    },
    back: {
        id: "toolboxBack",
        value: "< Previous",
        action: "showPreviousQuestion();"
    },
    forward: {
        id: "toolboxForward",
        value: "Next >",
        action: "showNextQuestion()"
    },
    startTest: {
        id: "toolboxForward",
        value: "Start Test",
        action: "showNextQuestion()"
    },
    showResults: {
        id: "toolboxForward",
        value: "Show Results",
        action: "showNextQuestion()"
    },
    showCommentsPage: {
        id: "toolboxForward",
        value: "Next",
        action: "showCommentsPage()"
    }
};

var activeResults;
var activeTest;
var activeQuestion;
var savedTests = new Array();


function startApp() {

    initTemplates();
    app.tests = getEnTests();
    showTests();
}

function initTemplates() {
    for (var obj in app.templates) {
        var htmlStr = $(app.templates[obj + ""].id).html();
        if (htmlStr)
            app.templates[obj + ""].template = Handlebars.compile(htmlStr);
        else
            alert("mising element with id " + app.templates[obj + ""].id);
    }
    $("#templateContainer").remove();
}

function showQuestion(testId, questionId, direction) {
    testId = testId ? testId : activeQuestion;
    questionId = questionId ? questionId : activeTest;

    activeTest = testId;
    activeQuestion = questionId;

    var context = getQuestion(testId, questionId);
    var htmlStr = app.templates.questionPage.template(context);

    var footerContext = context.toolboxContext;
    footerContext.title = context.number + " of " + context.testLength
    var toolboxContext = getToolboxContextForActiveTest();

    showPage(htmlStr, toolboxContext, footerContext, direction);

    //    if (activeResults[questionId]) {
    //        setQuestionResult();
    //    }
}


function showTest(testId) {
    activeResults = new Object();

    activeTest = testId;
    activeQuestion = undefined;

    var test = getTest(testId);

    var toolboxContex = getToolboxContextForActiveTest(test);


    var htmlStr = app.templates.testStartPage.template(test);

    var footerContext = getToolboxObj();
    footerContext.rightButton.push(toolboxButtons.startTest);
    showPage(htmlStr, toolboxContex, footerContext, "right");
}

function selectItem(optionId) {
    var question = getQuestion(activeTest, activeQuestion);
    var options = question.answers.answer;
    for (i in options) {
        var o = options[i];
        var s = o.id == optionId;
        document.getElementById("option_" + o.id).className = s ? "selected" : "unselected";
    }
    //selected();
}

/* function selected() {
    var q = getQuestion(activeTest, activeQuestion);
    var res = validateQuestion();
   if (res) {
        var butt = $("#toolboxForward");
        butt.html(q.end ? toolboxButtons.showResults.value : toolboxButtons.forward.value);
        butt.click(showNextQuestion);
    }
}*/

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

            //toolboxContext.leftButton.push(toolboxButtons.home);
            if (i != 0)
                toolboxContext.leftButton.push(toolboxButtons.back);

            if (!q.end)
                toolboxContext.rightButton.push(toolboxButtons.forward);
            else
                toolboxContext.rightButton.push(toolboxButtons.showResults);

            toolboxContext.title = test.name;
            q.toolboxContext = toolboxContext;
            // prepare for display
            for (var j = 0; j < q.answers.answer.length; j++) {
                var a = q.answers.answer[j];
                a.class = (a.id == activeResults[q.id]) ? "selected" : "unselected";
            }

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
        if ($("#option_" + a.id).hasClass("selected")) {
            activeResults[question.id] = a.id;
            return a.id;
        }
    }
    alert("Please select option first");
    return undefined;
}



function clearPage() {
    $(app.containers.pageContainer).empty();
    $(app.containers.toolboxContainer).empty();
}

function showPreviousQuestion() {
    if (activeQuestion && activeTest) {

        var test = getTest(activeTest);
        for (var i = 1; i < test.question.length; i++) {
            var selQ = i;
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

function getActiveTest() {
    var test = getTest(activeTest);
    return test;
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
                        "means": question.means,
                        "answer": a.text
                    });
                }
            }
        }
    }
    if (test.type == "combination") {
        for (var i = 0; i < test.results.result.length; i++) {
            if (test.results.result[i].value == resultStr) {
                result.push({
                    "means": test.decription,
                    "answer": test.results.result[i].text
                });
            }
        }
    }

    var toolbarContext = getToolboxObj();
    if (savedResults) {
        toolbarContext.title = "Saved " + test.name;
    } else {
        toolbarContext.title = test.name;
    }
    //toolbarContext.leftButton.push(toolboxButtons.home);


    var html = app.templates.resultPage.template({
        "item": result
    });
    var footerContext = getToolboxObj();
    footerContext.rightButton.push(toolboxButtons.showCommentsPage);

    showPage(html, toolbarContext, footerContext, "right");
}


function showCommentsPage() {
    var toolbarContext = getToolboxObj();
    var footerContext = getToolboxObj();
    var html = app.templates.commentsPage.template();

    toolbarContext.title = getActiveTest().name;

    showPage(html, toolbarContext, footerContext, "right");
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
            toolboxContext.title = "Saved tests";
            toolboxContext.leftButton.push(toolboxButtons.home);

            var htmlString = app.templates.savedTestList.template({
                "item": savedTest
            });
            var footerContext;
            showPage(htmlString, toolboxContext, footerContext);

        } catch (e) {
            alert(e);
        }
    }
}

function showSavedTest(orderNumber) {
    var results = savedTest[orderNumber];
    var activeTest = results.id;
    var activeResults = results;
    showResults();
}

function test() {
    var a = new Array();
    a.push({
        "date": 99,
        "testName": "name",
        "testId": 9
    });
    a.push({
        "date": 33,
        "testName": "name 33",
        "testId": 9
    });
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
        rightButton: [],
        leftButton: [],
        title: undefined
    };
}

function getToolboxContextForActiveTest(test) {
    var toolboxContex = getToolboxObj();
    if (!test) {
        test = getTest(activeTest);
    }

    if (test)
        toolboxContex.title = test.name;

    toolboxContex.leftButton.push(toolboxButtons.home);
    toolboxContex.rightButton.push(toolboxButtons.contextMenu);
    return toolboxContex;
}

app.containers = {
    pageContainer: ".pageT",
    pageLeft: ".pageLeft",
    pageLeft: ".pageRight",
};

var firstPage = true;

function showPage(htmlString, toolboxContext, footerContext, fromDirection) {

    var toDirection = fromDirection == "right" ? "left" : "right";

    var currentPage = $("div.centerT");

    if (!currentPage) {
        alert("can not find current page");
        return;
    }

    var htmlStr = getPageHtml(htmlString, toolboxContext, footerContext);
    if (firstPage) {
        firstPage = false;
        currentPage.html(htmlStr);

    } else {
        var newPage = "<div class='pageT " + fromDirection + "T'>" + htmlStr + "</div>";
        newPage = $(newPage);
        $("body").append(newPage);

        newPage.offset().left;
        currentPage.attr("class", "pageT " + toDirection + "T transitionT");
        newPage.attr("class", "pageT centerT transitionT");

        currentPage.on("transitionend", function (e) {
            e.target.remove();
        });
        currentPage.on('webkitTransitionEnd', function (e) {
            e.target.remove();
        });

    }
}

function getPageHtml(htmlString, toolboxContext, footerContext) {
    var html = toolboxContext ? app.templates.toolbox.template(toolboxContext) : "";

    html += "<div  class=\"pageContainer\">" + htmlString + "</div>";
    html += app.templates.footer.template(footerContext);


    return html;
}

function showTests(direction) {

    var toolboxContext = getToolboxObj();
    toolboxContext.title = "Personality Tests";
    toolboxContext.rightButton.push(toolboxButtons.contextMenu);
    toolboxContext.leftButton.push(toolboxButtons.facebook);

    var footerContext = getToolboxObj();
    footerContext.leftButton.push(toolboxButtons.about);

    var context = {
        test: new Array()
    };

    var pageTemplate = app.templates.allTestPage.template;

    var tests = app.tests.all;

    for (var i = 0; i < tests.length; i++) {
        context.test.push(tests[i]);
    }
    var htmlStr = pageTemplate(context);
    showPage(htmlStr, toolboxContext, footerContext, direction);
}

function goHome() {
    showTests("left");
}

function showContextMenu() {
    alert("todo showContextMenu");
}

function showAboutPage() {
    alert("todo about page");
}

function postComment() {
    var msg = $("#commentInput").val();
    msg = "test so ajax  ghaggs";
    if (msg) {
        msg = msg.trim();
        var testId = activeTest ? activeTest : 10;
        var userId = 10;
        var replayTo = undefined;

        app.conn.postComment(msg, testId, userId, replayTo, function (comment) {
            alert("Coment was saved succesfuly");
        }, function (errCode) {
            alert(errCode);
        });
    } else {
        alert("Please provide text for comment");
    }
}

window.setTimeout(function () {
    postComment();
}, 2000)
window.onload = startApp;