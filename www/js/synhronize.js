app.user;
app.comments = {};
app.sync = new Object();

app.sync.hasInternet = function () {
    return true;
}

app.sync.loadComments = function (next, testId) {
    if (app.sync.hasInternet()) {
        var page = 0;
        if (next) {
            page = app.comments[testId].page + 1;
        }
        if (activeTest) {
            app.conn.getComments(testId, page, function (data) {
                if (!app.comments[testId])
                    app.comments[testId] = new Object();
                app.comments[testId].page = data.page;
                app.comments[testId].numPages = data.numPages;
                app.comments[testId].hasNext = data.numPages - data.page > 1;
                app.comments[testId].hasPrevious = data.page > 0;
                app.comments[testId].pageSize = data.pageSize;

                if (!app.comments[testId].results) {
                    app.comments[testId].results = new Array();
                    app.comments.maxId = 0;
                }
                for (var el in data.results) {
                    app.comments[testId].results.push(data.results[el]);
                }
                return app.comments[testId];
            });
        }
    } else {
        alert("TODO internet is not avaliable");
    }
}



_saveComments() {

    }
    /*
    todo 
    ako internet konekcija se citaat poslednite pageSize commentari ;
    ako ima internet konekcija se rabote so serverot celo vreme 
    na sekoe load na comments se ispituva dali maximalnoto Id e pogolemo od maximalnoto snimeno Id ako e pogolemo se snimaat poslednite komentari 

    */