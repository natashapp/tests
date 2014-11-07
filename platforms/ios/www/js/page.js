/* Notes:
 * - History management is currently done using window.location.hash.  This could easily be changed to use Push State instead.
 * - jQuery dependency for now. This could also be easily removed.
 */

function PageSlider() {

    var container,
        currentPage,
        dump,
        stateHistory = [];

    this.setContainer = function (c) {
        container = c;
    }
//    this.setDump = function (d) {
//        dump = d;
//    }
//  

    this.setCurrentPage = function(page){
        page.attr("class", "page center");
        container.append(page);
        currentPage = page;
    }
    // Use this function directly if you want to control the sliding direction outside PageSlider
    this.slidePageFrom = function (page, from) {
        page.attr("class","page right");
        container.append(page);
       
        if (!currentPage || !from) {
            return ;
        } else {
            currentPage.on('webkitTransitionEnd', function (e) {
            var tmp =  $(e.target).remove();
            //dump.append(tmp);
            });

            // Force reflow. More information here: http://www.phpied.com/rendering-repaint-reflowrelayout-restyle/
        //    container[0].offsetWidth;

            // Position the new page and the current page at the ending position of their animation with a transition class indicating the duration of the animation
            page.attr("class", "page  transition center");
            currentPage.attr("class", "page transition left");
            currentPage = page;
        }
    };

}



$(window).on('hashchange', route);

function route() {
    var hash1 = window.location.hash;

    if (hash1) {
        var pageId = window.location.hash.substring(1);
        var page = pages[pageId];
        slider.slidePageFrom(page, "left");

    } else {

        var page = $("#center");
        slider.slidePageFrom(page);
    }
}
var slider = new PageSlider();
 var pages = new Object(); 

window.onload = function () {
    pages["center"] = $("#center");
    pages["left"] = $("#left");
    pages["right"] = $("#right");
    
    slider.setContainer($("#pageContainer"));
    
    slider.setCurrentPage(pages["center"]);
    //route();
}