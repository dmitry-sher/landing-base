// compat
var compat = {};

function detectBrowsers() {
    if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
        $('html').addClass('safari');
        compat.safari = true;
    }

    if (!!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/) && (navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPhone/i))) {
        $('html').addClass('mobileSafari');
        compat.mobileSafari = true;
    }

    if (navigator.userAgent.match(/iPad/i)) {
        $('html').addClass('iPad');
        compat.ipad = true;
    }

    if (navigator.userAgent.match(/iPhone/i)) {
        $('html').addClass('iPhone');
        compat.iphone = true;
    }

    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
        $('html').addClass('firefox');
        compat.firefox = true;
    }

    if (navigator.userAgent.toLowerCase().indexOf('android') > -1) {
        $('html').addClass('android');
        compat.android = true;
    }

    if (!!window.chrome && !!window.chrome.webstore) {
        $('html').addClass('chrome');
        compat.chrome = true;
    }

    if (Function('/*@cc_on return document.documentMode===10@*/')()) {
        $('html').addClass('ie10');
        compat.ie = true;
        compat.ie10 = true;
    }

    if (!!window.MSInputMethodContext && !!document.documentMode) {
        $('html').addClass('ie11')
        compat.ie = true;
        compat.ie11 = true;
    }
}

function isDevice() {
    return isIpad() || isIphone() || isAndroid();
}

function isIpad() {
    return compat.ipad;
}

function isAndroid() {
    return compat.android;
}

function isIphone() {
    return compat.iphone;
}

function isApple() {
    return compat.ipad || compat.iphone;
}

function windowHeight() {
    return isApple() ? window.innerHeight : $w.height();
}