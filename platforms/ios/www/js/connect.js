function getUser1(id) {
    console.log("here")
    var r = jQuery.get("http://localhost:8080/PersonalityWeb/rest/service/user?id=10");

    user.fromResponse(r.responseJSON);
    console.log(user.email);
    alert(user.email);


}

function getUser() {
    var user = new User();
    $.ajax({
        url: "http://localhost:8080/PersonalityWeb/rest/service/user?id=10",
        success :function (res){
            user.fromResponse(res);
            alert(user.email);
        }
    });
    
    
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