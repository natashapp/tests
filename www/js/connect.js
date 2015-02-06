app.user;

app.conn = {
    url: "http://localhost:8080/PersonalityWeb/rest/service/",
    isConnected: _isConnected,
    getUser: _getUser,
    isFacebookLogged: _isFacebookLoged,
    postComment: _postComment,
    saveResults: _saveResults,
    getUsageStats: _getUsageStats,
}

function _isConnected() {
    return true;
}

function _getUser(id) {
    if (!id)
        id = 10;
    var user = new User();
    $.ajax({
        url: app.conn.url + "user?id=" + id,
        success: function (res) {
            user.fromResponse(res);
            app.user = user;
        }
    });
}

function _getUsageStats() {

}

function _saveResults() {

}

function _postComment(msg, testId, userId, replayTo, succCallback, errCalback) {
    if (!msg)
        msg = "Some comment";
    if (!userId)
        userId = 10;
    if (!testId)
        testId = 9;

    var comment = getCommentObj();
    comment.user = {
        id: userId
    }
    comment.testId = testId;
    comment.msg = msg;
    comment.replayTo = replayTo;

     
    $.ajax({
        "type":"POST",
        "url": app.conn.url + "comment",
        "data": JSON.stringify(comment),
        "dataType":"json", 
        contentType:"application/json; charset=utf-8",
        "success" : function () {
            alert("sucess");
            succCallback();
        }
    })

}

function _getComments() {

}

function _getRattings() {

}

function _isFacebookLoged() {

}

function getCommentObj() {
    var comment = {
        user: undefined,
        id: undefined,
        replayTo: undefined,
        test: undefined,
        msg: ""
    }
    return comment;
}

function User() {
    var _this = this;

    _this.id = undefined;
    _this.email = undefined;
    _this.creDate = undefined;
    _this.facebookId = undefined;
    _this.imgLink = undefined;
    _this.name = undefined;

    _this.fromResponse = function (res) {
        _this.id = res.id;
        _this.email = res.email;
        _this.creDate = res.creDate;
        _this.facebookId = res.facebookId;
        _this.imgLink = res.imgLink;
        _this.name = res.name;
    }
    return _this;
}