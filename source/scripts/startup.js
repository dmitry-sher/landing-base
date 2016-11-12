// onXX and behavioral functions
function ipadOrient() {
    $(document).ready(function() {
        window.addEventListener('orientationchange', function(e) {
            onOrient();
        });
    });
}

function onOrient(initial) {
    let wdth = $w.width(),
        hght = $w.height();
    if (window.orientation == 90 || window.orientation == -90 || wdth >= hght)
        $('html').addClass('landscape').removeClass('portrait');
    else
        $('html').removeClass('landscape').addClass('portrait');
}

function prepareBrowsers() {
    if (isDevice()) {
        return;
    }
}

function setProgrammScroll(height, time) {
    if (programmScrollInProgress)
        return;
    programmScrollInProgress = true;
    time = time || settings.animationTime;
    $w.scrollTo(height, time, { easing: settings.programmScrollEasing });
    setTimeout(function() {
        programmScrollInProgress = false;
    }, time);
}

let scrollTimeout = false;

function clearScrollTimeout() {
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
        scrollTimeout = false;
    }
}

function setScrollTimeout() {
    scrollTimeout = setTimeout(onSlide1Click, settings.scrollTimeout);
}

function onScrollEnd() {
    // console.log('[onScrollEnd]');
    let wh = windowHeight();
    let skipScroll = ((dlt < settings.deviceIgnoreDelta) && isDevice());

    clearTimeout(throttle);
    throttle = false;
}

var
    $w = $(window),
    slideState = 0,
    previousScroll = 0,
    programmScrollInProgress = false,
    sl1,
    sl2,
    throttle = false,
    topDelta,
    bottomDelta,
    d = 0,
    dlt = 0;

function onScroll(e) {
    let h = $w.scrollTop();
    d = h > previousScroll ? 1 : -1; //1 is scrolling bottom, -1 is scrolling top
    if (Math.abs(h - previousScroll) < settings.ignoreScrollSize) { //ok we're goin' down slow
        if (!throttle) {
            throttle = setTimeout(onScrollEnd, 50);
        }
    }
    clearScrollTimeout();
    previousScroll = h;
    crumbsOnScroll(h);
}

function startup() {
    addEasings();
    detectBrowsers();
    ipadOrient();
    prepareBrowsers();
    prepareForm();
    prepareSearch();
    onOrient(true);
    onResize();
    onScroll();

    if (!isDevice()) {
        $w.on('resize', onResize);
        $w.on('scroll', onScroll);
    } else {
        $w.on('resize', onDeviceResize);
        $w.on('scroll', onScroll);
    }
}

function onResize() {
    if (isDevice())
        return;

    recalcViewerParameters();
}

function onDeviceResize() {
    return;
}

function addEasings() {
    $.extend($.easing, {
        easeInOutQuad: function(x, t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t + b;
            return -c / 2 * ((--t) * (t - 2) - 1) + b;
        }
    });
}

$(startup);