(function($) {
    $(function() {
        for(var i = 0; i < 15; i++) {
            $("#jarvis-container").append('<div class="point">'+i+'</div>');
        }
        $(".point").map(function() {
            $(this).css("left", Math.random() * 400);
            $(this).css("top", Math.random() * 10);
        });
        $(".point").draggable({
            containment: "#jarvis-container",
            scroll: false,
            drag: function(event, ui) {
                recalc();
            },
        });
    });
})(jQuery);

function angle(ar, br) {
    var a = $(ar); var b = $(br);
    var result = Math.atan2(
            b.offset().top - a.offset().top,
            b.offset().left - a.offset().left);
    if(result < 0) result += 2*3.14159265358979;
    return result;
}

// This version of compare fails at the turning point.
function compare(o, a, b) {
    return angle(o, a) < angle(o, b);
}

// This version uses the cross-product trick to compare coordinates.
function compare2(or, ar, br) {
    var a = $(ar); var b = $(br); var o = $(or);
    var x1 = a.offset().left - o.offset().left;
    var y1 = a.offset().top - o.offset().top;
    var x2 = b.offset().left - o.offset().left;
    var y2 = b.offset().top - o.offset().top;
    return x1 * y2 > y1 * x2;
}

function recalc() {
    var points = $(".point");
    var minPoint = points[0];
    for(var i = 0; i < points.length; i++) {
        var x = $(points[i]).offset().top;
        var xMin = $(minPoint).offset().top;
        if(x < xMin) minPoint = points[i];
    }
    points.removeClass("min").removeClass("edge");
    $(minPoint).addClass("min");

    var point = minPoint;
    do {
        var smallest = points[0];
        if(smallest == point) smallest = points[1];
        for(var i = 0; i < points.length; i++) {
            if(points[i] == point) continue;
            if(compare2(point, points[i], smallest))
                smallest = points[i];
        }
        $(smallest).addClass("edge");
        point = smallest;
    } while(point != minPoint);
}
