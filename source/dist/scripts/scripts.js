'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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
        $('html').addClass('ie11');
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
// crumbs functions
var $msg = $('.message'),
    $crumbs = $('.crumbs'),
    $emailForm = $('#email-form'),
    $emailInput = $('#email-form-input'),
    messageTimeout = false;

function showMessage(msg, error) {
    clearMessageTimeout();
    $crumbs.addClass('active').removeClass('form');
    $msg.html(msg).toggleClass('error', error);
}

function hideMessage() {
    clearMessageTimeout();
    $crumbs.removeClass('active').removeClass('form');
}

function showEmailForm() {
    $crumbs.removeClass('active').addClass('form');
    setEmailVisualLoadingState(false);
    setTimeout(function () {
        $emailInput.focus();
    }, settings.animationTime);
}

function clearMessageTimeout() {
    if (messageTimeout) {
        clearTimeout(messageTimeout);
        messageTimeout = false;
    }
}

function showMessageWithTimeout(msg, error, timeout) {
    showMessage(msg, error);
    messageTimeout = setTimeout(hideMessage, timeout);
}

function setActiveCrumb(idx) {
    // console.log('[setActiveCrumb] idx = ', idx);
    $crumbs.find('li').removeClass('active');
    var realIdx = idx * 2 + 1;
    for (var i = 1; i <= realIdx; i++) {
        $crumbs.find('li:nth-child(' + i + ')').addClass('active');
    }
}

function setCrumbsHandlers() {
    $emailForm.on('submit', onEmailSubmit);
}

var emailXhr = void 0,
    mockEmailRequest = true;

function onEmailSubmit() {
    var emptyValidator = function emptyValidator(elem) {
        return !elem.value;
    };

    var fields = [{ elem: 'email', validator: emptyValidator }];

    var validated = true,
        frm = document.forms['sendEmail'];
    _.forEach(fields, function (f) {
        var elem = frm.elements[f.elem];
        if (f.validator(elem)) {
            $(elem).focus();
            validated = false;
        }
    });
    if (!validated) return false;

    var data = {};
    _.forEach(fields, function (f) {
        data[f.elem] = frm.elements[f.elem].value;
    });

    if (mockEmailRequest) {
        mockEmailFormSend();
        return false;
    }

    if (emailXhr) {
        emailXhr.abort();
        emailXhr = false;
    }
    setEmailVisualLoadingState(true);

    setTimeout(function () {
        emailXhr = $.ajax({
            success: onEmailSuccess,
            error: onEmailError,
            data: data,
            dataType: 'json',
            method: settings.emailMethod,
            timeout: settings.connectionTimeout,
            url: settings.url,
            async: true
        });
    }, 50);
    return false;
}

function setEmailVisualLoadingState(state) {
    if (state) {
        $frm.find('input.submit').addClass('hidden');
        $frm.find('.loader').removeClass('hidden');
    } else {
        $frm.find('input.submit').removeClass('hidden');
        $frm.find('.loader').addClass('hidden');
    }
}

function onEmailSuccess(data) {
    console.log('[onEmailSuccess] data = ', data);
    showEmailMsg(data.err, data.text);
}

function onEmailError(data) {
    console.log('[onEmailError]');
    showEmailMsg(true, settings.failedMessage);
}

function showEmailMsg(err, txt) {
    setVisualLoadingState(false);
    showMessageWithTimeout(txt, err, settings.messageTimeout, function () {
        setEmailVisualLoadingState(false);
    });
}

function mockEmailFormSend() {
    setEmailVisualLoadingState(true);
    setTimeout(function () {
        if (Math.random() > 0.8) {
            onEmailError({});
            return;
        }
        var data = {};
        if (Math.random() > 0.8) {
            data.err = true;
            data.text = 'new-yorkers-only understandable xtra long 3rr0r messag3';
        } else {
            data.err = false;
            data.text = 'Email is sent and you will receive it shortly';
        }
        onEmailSuccess(data);
    }, settings.animationTime);
}

function setEmailVisualLoadingState(state) {
    if (state) {
        $emailForm.find('input').addClass('hidden');
        $emailForm.find('.loader').removeClass('hidden');
    } else {
        $emailForm.find('input').removeClass('hidden');
        $emailForm.find('.loader').addClass('hidden');
    }
}

function crumbsOnScroll(scroll) {
    return false;
}

function copyTextToClipboard(text) {
    var textArea = document.createElement("textarea");

    //
    // *** This styling is an extra step which is likely not required. ***
    //
    // Why is it here? To ensure:
    // 1. the element is able to have focus and selection.
    // 2. if element was to flash render it has minimal visual impact.
    // 3. less flakyness with selection and copying which **might** occur if
    //    the textarea element is not visible.
    //
    // The likelihood is the element won't even render, not even a flash,
    // so some of these are just precautions. However in IE the element
    // is visible whilst the popup box asking the user for permission for
    // the web page to copy to the clipboard.
    //

    // Place in top-left corner of screen regardless of scroll position.
    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;

    // Ensure it has a small width and height. Setting to 1px / 1em
    // doesn't work as this gives a negative w/h on some browsers.
    textArea.style.width = '2em';
    textArea.style.height = '2em';

    // We don't need padding, reducing the size if it does flash render.
    textArea.style.padding = 0;

    // Clean up any borders.
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';

    // Avoid flash of white box if rendered for any reason.
    textArea.style.background = 'transparent';

    textArea.value = text;

    document.body.appendChild(textArea);

    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        showMessageWithTimeout('Link copied successfully', false, settings.messageTimeout);
    } catch (err) {
        showMessageWithTimeout('Link failed to copy', true, settings.messageTimeout);
        console.log('Oops, unable to copy');
    } finally {
        document.body.removeChild(textArea);
    }
}
// form
var phs = {},
    frm = document.forms['details'],
    $frm = $('#details-form'),
    formValidated = false,
    $formSubmit = $('#form-submit'),
    userData = {};

function prepareForm() {
    $frm.on('submit', onSubmit);

    $frm.find('input, textarea').on('change', validateForm).on('keyup', validateForm);
    $('#page4-back').on('click', function () {
        setActivePage(2);
    });
}

function setPlaceHolder(cls, val) {
    var $inp = $('input.' + cls),
        inp = $inp[0],
        ph = true,
        phV = val;
    phs[cls] = ph;

    function onKeyUp(e) {
        ph = e.target.value == '';
        phs[cls] = ph;
    }

    function onBlur(e) {
        if (ph) {
            if (isDevice()) {
                e.target.value = phV;
                return;
            }
            $inp.addClass('transit').css('color', 'rgba(0,0,0,0)');
            e.target.value = phV;
            setTimeout(function () {
                $inp.css('color', '');
                setTimeout(function () {
                    $inp.removeClass('transit');
                }, 100);
            }, 10);
        }
    }

    function onFocus(e) {
        if (ph) {
            if (isDevice()) {
                e.target.value = '';
                return;
            }
            $inp.addClass('transit');
            setTimeout(function () {
                $inp.css('color', 'rgba(0,0,0,0)');
                setTimeout(function () {
                    e.target.value = '';
                    $inp.removeClass('transit');
                    setTimeout(function () {
                        $inp.css('color', '');
                    }, 0);
                }, 100);
            }, 0);
        }
        // e.target.value = '';
    }

    $inp.on('keyup', onKeyUp);
    $inp.on('blur', onBlur);
    $inp.on('focus', onFocus);
    onBlur({ target: inp });
    $inp.on('change', onKeyUp);
}

function showMsg(err, msg) {
    setVisualLoadingState(false);
    $frm.addClass('hidden');
    showMessage(msg, err);
    // emoveClass('hidden').html(msg).toggleClass('error', !!err);
}

function mockFormSend() {
    setVisualLoadingState(true);
    setTimeout(function () {
        if (Math.random() > 0.5) {
            onError({});
            return;
        }
        var data = {};
        if (Math.random() > 0.5) {
            data.err = true;
            data.text = 'new-yorkers-only understandable xtra long 3rr0r messag3';
        } else {
            data.err = false;
            data.text = 'Thank you!';
        }
        onSuccess(data);
    }, settings.animationTime);
}

var xhr = void 0,
    mockRequest = true;
var emptyValidator = function emptyValidator(elem) {
    return !elem.value;
};
var cbxValidator = function cbxValidator(elem) {
    return !elem.checked;
};
var cbxValue = function cbxValue(elem) {
    return elem.checked;
};
var fields = [{ elem: 'email', validator: emptyValidator }, { elem: 'name', validator: emptyValidator }, { elem: 'surname', validator: emptyValidator }, { elem: 'address', validator: emptyValidator }, { elem: 'legalname', validator: emptyValidator }, { elem: 'affirm_use_right', validator: cbxValidator, value: cbxValue }, { elem: 'affirm_grant_right', validator: cbxValidator, value: cbxValue }, { elem: 'affirm_people', validator: cbxValidator, value: cbxValue }];

function validateForm() {
    var validated = true;
    _.forEach(fields, function (f) {
        var elem = frm.elements[f.elem];
        if (f.validator(elem)) {
            // $(elem).focus();
            validated = false;
        }
    });
    formValidated = validated;

    $formSubmit.toggleClass('disabled', !formValidated);
}

function onSubmit() {
    if (!formValidated) return false;

    var data = {};
    _.forEach(fields, function (f) {
        data[f.elem] = f.value ? f.value(frm.elements[f.elem]) : frm.elements[f.elem].value;
    });

    userData = data;
    setActivePage(4);
    // if (mockRequest) {
    //     mockFormSend();
    //     return false;
    // }

    // if (xhr) {
    //     xhr.abort();
    //     xhr = false;
    // }
    // setVisualLoadingState(true);

    // setTimeout(function() {
    //     xhr = $.ajax({
    //         success: onSuccess,
    //         error: onError,
    //         data,
    //         dataType: 'json',
    //         method: settings.method,
    //         timeout: settings.connectionTimeout,
    //         url: settings.url,
    //         async: true
    //     });
    // }, 50);
    return false;
}

function setVisualLoadingState(state) {
    if (state) {
        $frm.find('input.submit').addClass('hidden');
        $frm.find('.loader').removeClass('hidden');
    } else {
        $frm.find('input.submit').removeClass('hidden');
        $frm.find('.loader').addClass('hidden');
    }
}

function onSuccess(data) {
    console.log('[onSuccess] data = ', data);
    showMsg(data.err, data.text);
}

function onError(data) {
    console.log('[onError]');
    showMsg(true, settings.failedMessage);
}
/**
 * Copyright (c) 2007-2015 Ariel Flesler - aflesler ○ gmail • com | http://flesler.blogspot.com
 * Licensed under MIT
 * @author Ariel Flesler
 * @version 2.1.3
 */
;(function (f) {
    "use strict";
    "function" === typeof define && define.amd ? define(["jquery"], f) : "undefined" !== typeof module && module.exports ? module.exports = f(require("jquery")) : f(jQuery);
})(function ($) {
    "use strict";
    function n(a) {
        return !a.nodeName || -1 !== $.inArray(a.nodeName.toLowerCase(), ["iframe", "#document", "html", "body"]);
    }function h(a) {
        return $.isFunction(a) || $.isPlainObject(a) ? a : { top: a, left: a };
    }var p = $.scrollTo = function (a, d, b) {
        return $(window).scrollTo(a, d, b);
    };p.defaults = { axis: "xy", duration: 0, limit: !0 };$.fn.scrollTo = function (a, d, b) {
        "object" === (typeof d === 'undefined' ? 'undefined' : _typeof(d)) && (b = d, d = 0);"function" === typeof b && (b = { onAfter: b });"max" === a && (a = 9E9);b = $.extend({}, p.defaults, b);d = d || b.duration;var u = b.queue && 1 < b.axis.length;u && (d /= 2);b.offset = h(b.offset);b.over = h(b.over);return this.each(function () {
            function k(a) {
                var k = $.extend({}, b, { queue: !0, duration: d, complete: a && function () {
                        a.call(q, e, b);
                    } });r.animate(f, k);
            }if (null !== a) {
                var l = n(this),
                    q = l ? this.contentWindow || window : this,
                    r = $(q),
                    e = a,
                    f = {},
                    t;switch (typeof e === 'undefined' ? 'undefined' : _typeof(e)) {case "number":case "string":
                        if (/^([+-]=?)?\d+(\.\d+)?(px|%)?$/.test(e)) {
                            e = h(e);break;
                        }e = l ? $(e) : $(e, q);case "object":
                        if (e.length === 0) return;if (e.is || e.style) t = (e = $(e)).offset();}var v = $.isFunction(b.offset) && b.offset(q, e) || b.offset;$.each(b.axis.split(""), function (a, c) {
                    var d = "x" === c ? "Left" : "Top",
                        m = d.toLowerCase(),
                        g = "scroll" + d,
                        h = r[g](),
                        n = p.max(q, c);t ? (f[g] = t[m] + (l ? 0 : h - r.offset()[m]), b.margin && (f[g] -= parseInt(e.css("margin" + d), 10) || 0, f[g] -= parseInt(e.css("border" + d + "Width"), 10) || 0), f[g] += v[m] || 0, b.over[m] && (f[g] += e["x" === c ? "width" : "height"]() * b.over[m])) : (d = e[m], f[g] = d.slice && "%" === d.slice(-1) ? parseFloat(d) / 100 * n : d);b.limit && /^\d+$/.test(f[g]) && (f[g] = 0 >= f[g] ? 0 : Math.min(f[g], n));!a && 1 < b.axis.length && (h === f[g] ? f = {} : u && (k(b.onAfterFirst), f = {}));
                });k(b.onAfter);
            }
        });
    };p.max = function (a, d) {
        var b = "x" === d ? "Width" : "Height",
            h = "scroll" + b;if (!n(a)) return a[h] - $(a)[b.toLowerCase()]();var b = "client" + b,
            k = a.ownerDocument || a.document,
            l = k.documentElement,
            k = k.body;return Math.max(l[h], k[h]) - Math.min(l[b], k[b]);
    };$.Tween.propHooks.scrollLeft = $.Tween.propHooks.scrollTop = { get: function get(a) {
            return $(a.elem)[a.prop]();
        }, set: function set(a) {
            var d = this.get(a);if (a.options.interrupt && a._last && a._last !== d) return $(a.elem).stop();var b = Math.round(a.now);d !== b && ($(a.elem)[a.prop](b), a._last = this.get(a));
        } };return p;
});
var currentPage = 0,
    pages = ['.page1', '.page2', '.page3', '.page4', '.page5'];

function setActivePage(idx) {
    if (currentPage == idx) return;
    $('.pages div').removeClass('active');
    $(pages[idx]).addClass('active');
    currentPage = idx;
    hideMessage();
    setActiveCrumb(idx);
}
// place form

var uploadStatus = {
    New: 0,
    Clicked: 1,
    Success: 2,
    Fail: 3,
    Uploading: 4,
    UploadSuccess: 5,
    UploadFail: 6
};

var placePageStates = {
    New: 0,
    Loading: 1,
    Success: 2,
    Fail: 3
};

var place = false,
    fromPermLink = false,
    $placeForm = $('#place-data'),
    $uploads = $('#upload-list'),
    $placeErr = $('#place-error'),
    $placeLoader = $('#place-loader'),
    $uploadEl = $('#upload-el'),
    placePageState = placePageStates.New,
    mockPlaceLoad = window.location.href.match(/localhost/),
    placeConnectionTimeout = false,
    uploads = [{
    id: '-1',
    status: uploadStatus.New
}];

function getPlaceIdFromParams() {
    var m = false;
    if (m = window.location.search.match(/id=(\d+)/)) {
        return +m[1];
    }
    return false;
}

function setPlacePageOnclicks() {
    // console.log('[setPlacePageOnclicks]');
    $('#page2-notyour, #page2-back').on('click', function (e) {
        console.log('[setPlacePageOnclicks] clicked');
        $('#page2-notyour').addClass('hidden');
        $('#page2-back').removeClass('hidden');
        History.pushState({}, false, '/');
        setActivePage(0);
    });

    $('#page2-next').on('click', function (e) {
        setActivePage(2);
    });
}

function openPlacepageFromPermalink(cb) {
    var placeId = getPlaceIdFromParams();
    if (!placeId) {
        if (cb) cb();
        setPlacePageState(placePageStates.Fail);
        showMessage('Wrong parameteres', true);
        return;
    }

    setActivePage(1);
    setPlacePageState(placePageStates.Loading);
    clearTimeout(placeConnectionTimeout);
    hideMessage();
    if (cb) cb();

    $('#page2-notyour').removeClass('hidden');
    $('#page2-back').addClass('hidden');

    if (mockPlaceLoad) {
        mockPlaceLoading(placeId);
        return;
    }

    var requestId = Math.floor(Math.random() * 1e6);
    $.ajax(settings.placeUrl + placeId + '/', {
        dataType: 'json',
        method: 'GET'
    }).done(function (res) {
        if (requestId != currentRequestId) return;
        clearTimeout(searchDataTimeout);
        populatePlaceForm(res);
    }).fail(function (a, b, c) {
        if (requestId != currentRequestId) return;
        clearTimeout(searchDataTimeout);
        showPlaceFail(a, b, c);
    });

    searchDataTimeout = setTimeout(function () {
        showPlaceFail(false, 'connection timeouted!', false);
    }, settings.connectionTimeout);

    currentRequestId = requestId;
}

function mockPlaceLoading(placeId) {
    setTimeout(function () {
        if (Math.random() > 0.8) showPlaceFail(false, 'connection fail!', false);else {
            if (Math.random() > 0.8) showPlaceFail(false, 'failed to find place', false);else {
                if (Math.random() > 0.8) searchDataTimeout = setTimeout(function () {
                    showFail(false, 'connection timeouted!', false);
                }, settings.connectionTimeout);else populatePlaceForm(mockData.places[0]);
            }
        }
    }, 1000);
}

function showPlaceFail(jqXHR, textStatus, errorThrown) {
    setPlacePageState(placePageStates.Fail);
    showMessage(textStatus, true);
}

function setPlacePageState(state) {
    if (state == placePageState) return;

    if (state == placePageStates.New) {
        $placeForm.addClass('hidden');
        $uploads.addClass('hidden');
        $placeErr.addClass('hidden');
        $placeLoader.addClass('hidden');
        $uploadEl.addClass('hidden');
    }

    if (state == placePageStates.Loading) {
        $placeForm.addClass('hidden');
        $uploads.addClass('hidden');
        $placeErr.addClass('hidden');
        $placeLoader.removeClass('hidden');
        $uploadEl.addClass('hidden');
    }

    if (state == placePageStates.Success) {
        $placeForm.removeClass('hidden');
        $uploads.removeClass('hidden');
        $placeErr.addClass('hidden');
        $placeLoader.addClass('hidden');
        $uploadEl.removeClass('hidden');
    }

    if (state == placePageStates.Fail) {
        $placeForm.addClass('hidden');
        $uploads.addClass('hidden');
        $placeErr.removeClass('hidden');
        $placeLoader.addClass('hidden');
        $uploadEl.addClass('hidden');
    }

    placePageState = state;
}

function populatePlaceForm(place) {
    setPlacePageState(placePageStates.Success);
    var latLng = place.latitude + ',' + place.longitude;
    var rows = ['<div class="name">', place.name, '</div><div class="vicinity">', place.vicinity, '</div><div class="map">', '<img src="https://maps.googleapis.com/maps/api/staticmap?center=', latLng, '&zoom=17&size=640x400&maptype=roadmap&markers=color:blue%7Clabel:S%7C', latLng, '&key=AIzaSyAaxX4qaJSSBzsIH0VzDYbMjKuT0wKlSn8" /></div>'];
    $placeForm.html(rows.join(''));

    populateUploads();
}

function populateUploads() {
    var rows = [];
    _.forEach(uploads, function (upload) {
        return rows.push(renderUpload(upload));
    });
    $uploads.html(rows.join(''));

    // give DOM some time
    setTimeout(setPlaceHandlers, 50);
}

function renderUpload(upload) {
    var classes = ['one'];
    var contents = '';

    if (upload.status == uploadStatus.New) {
        classes.push('fresh');
        contents = '<input id="fileupload" type="file" name="files[]" multiple />';
    }

    if (upload.status == uploadStatus.Clicked) classes.push('loading');

    if (upload.status == uploadStatus.Success) classes.push('ready');

    var style = upload.bg ? ' style="background-image: url(\'' + upload.bg + '\')' : '';

    var item = ['<div class="', classes.join(' '), '"', style, ' data-id="', upload.id, '">', contents, '</div>'];
    return item.join('');
}

function setPlaceHandlers() {
    // initUpload2();
    // $uploads.find('.one').off('click').on('click', getOnClick(uploads, (id, upload) => {
    //     if (upload.status == uploadStatus.New) {
    //         // open file input
    //         // set upload status
    //         // rerender it
    //     }
    // }));
}

function getOnClick(arr, cb) {
    return function (e) {
        e.stopPropagation();
        e.preventDefault();

        var id = $(e.currentTarget).data('id');
        console.log('[onUploadClick] id = ', id);
        if (!id) return false;

        var filteredArray = _.filter(arr, function (u) {
            return u.id == id;
        });
        if (!filteredArray || filteredArray.length == 0) return false;

        var item = filteredArray[0];
        if (cb) cb(id, item);

        return false;
    };
}

function initUpload() {
    var url = '/api/legacy/photo/?id=1';
    var uploadButton = $('<button/>').addClass('btn btn-primary').prop('disabled', true).text('Processing...').on('click', function () {
        var $this = $(this),
            data = $this.data();
        $this.off('click').text('Abort').on('click', function () {
            $this.remove();
            data.abort();
        });
        calculate_md5(data.files[0], 100000); // Again, chunks of 100 kB
        console.log('md5 = ', md5);
        // data.submit();
        data.submit().always(function () {
            $this.remove();
        });
    });
    $('#fileupload').fileupload({
        url: url,
        dataType: 'json',
        autoUpload: false,
        acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
        maxFileSize: 10 * 1024 * 1024,
        // Enable image resizing, except for Android and Opera,
        // which actually support image resizing, but fail to
        // send Blob objects via XHR requests:
        disableImageResize: true,
        maxChunkSize: 1e5,
        previewMaxWidth: 100,
        previewMaxHeight: 100,
        previewCrop: true
    }).on('fileuploadadd', function (e, data) {
        data.context = $('<div/>').appendTo('#files');
        $.each(data.files, function (index, file) {
            // file starts uploading -- we do nothing yet
            var node = $('<p/>').append($('<span/>').text(file.name));
            if (!index) {
                node.append('<br>').append(uploadButton.clone(true).data(data));
            }
            node.appendTo(data.context);
        });
    }).on('fileuploadprocessalways', function (e, data) {
        // file is processed.
        var index = data.index,
            file = data.files[index],
            node = $(data.context.children()[index]);
        if (file.preview) {
            node.prepend('<br>').prepend(file.preview);
        }
        if (file.error) {
            node.append('<br>').append($('<span class="text-danger"/>').text(file.error));
        }
        if (index + 1 === data.files.length) {
            data.context.find('button').text('Upload').prop('disabled', !!data.files.error);
        }
    }).on('fileuploadprogressall', function (e, data) {
        var progress = parseInt(data.loaded / data.total * 100, 10);
        $('#progress .progress-bar').css('width', progress + '%');
    }).on('fileuploaddone', function (e, data) {
        $.each(data.result.files, function (index, file) {
            if (file.url) {
                var link = $('<a>').attr('target', '_blank').prop('href', file.url);
                $(data.context.children()[index]).wrap(link);
            } else if (file.error) {
                var error = $('<span class="text-danger"/>').text(file.error);
                $(data.context.children()[index]).append('<br>').append(error);
            }
        });
        $.ajax({
            type: "POST",
            url: "/api/legacy/upload_completed/?id=1",
            data: {
                upload_id: data.result.upload_id,
                md5: md5
            },
            dataType: "json",
            success: function success(data) {
                console.log('[success] data = ', data);
            }
        });
    }).on('fileuploadfail', function (e, data) {
        $.each(data.files, function (index) {
            var error = $('<span class="text-danger"/>').text('File upload failed.');
            $(data.context.children()[index]).append('<br>').append(error);
        });
    }).prop('disabled', !$.support.fileInput).parent().addClass($.support.fileInput ? undefined : 'disabled');
}

initUpload();

function initUpload2() {
    var url = '/api/legacy/photo/?id=1';
    // let uploadButton = $('<button/>')
    //     .addClass('btn btn-primary')
    //     .prop('disabled', true)
    //     .text('Processing...')
    //     .on('click', function() {
    //         let $this = $(this),
    //             data = $this.data();
    //         $this
    //             .off('click')
    //             .text('Abort')
    //             .on('click', function() {
    //                 $this.remove();
    //                 data.abort();
    //             });
    //         data.submit().always(function() {
    //             $this.remove();
    //         });
    //     });
    var $uploadEl = $('.one.loading');
    $('#fileupload').fileupload({
        url: url,
        dataType: 'json',
        autoUpload: false,
        acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
        maxFileSize: 10 * 1024 * 1024,
        // Enable image resizing, except for Android and Opera,
        // which actually support image resizing, but fail to
        // send Blob objects via XHR requests:
        disableImageResize: true,
        maxChunkSize: 500 * 1024,
        previewMaxWidth: 300,
        previewMaxHeight: 300,
        previewCrop: false
    }).on('fileuploadadd', function (e, data) {
        // data.context = $('<div/>').appendTo('#files');
        $.each(data.files, function (index, file) {
            // file starts uploading -- we do nothing yet
            // let node = $()
            // let node = $('<p/>')
            //     .append($('<span/>').text(file.name));
            // if (!index) {
            //     node
            //         .append('<br>')
            //         .append(uploadButton.clone(true).data(data));
            // }
            // node.appendTo(data.context);
        });
    }).on('fileuploadprocessalways', function (e, data) {
        // file is processed. we can create upload object
        var index = data.index,
            file = data.files[index];
        var upload = {
            id: Math.floor(Math.random() * 1e6),
            status: file.error ? uploadStatus.Fail : uploadStatus.Success,
            data: data,
            error: file.error,
            preview: file.preview
        };
        uploads.splice(-1, 0, upload);
        var html = renderUpload(upload);
        $uploadEl.removeClass('loading').addClass('fresh').before(html);
    })
    // .on('fileuploadprogressall', function(e, data) {
    //     let progress = parseInt(data.loaded / data.total * 100, 10);
    //     $('#progress .progress-bar').css(
    //         'width',
    //         progress + '%'
    //     );
    // }).on('fileuploaddone', function(e, data) {
    //     $.each(data.result.files, function(index, file) {
    //         if (file.url) {
    //             let link = $('<a>')
    //                 .attr('target', '_blank')
    //                 .prop('href', file.url);
    //             $(data.context.children()[index])
    //                 .wrap(link);
    //         } else if (file.error) {
    //             let error = $('<span class="text-danger"/>').text(file.error);
    //             $(data.context.children()[index])
    //                 .append('<br>')
    //                 .append(error);
    //         }
    //     });
    // }).on('fileuploadfail', function(e, data) {
    //     $.each(data.files, function(index) {
    //         let error = $('<span class="text-danger"/>').text('File upload failed.');
    //         $(data.context.children()[index])
    //             .append('<br>')
    //             .append(error);
    //     });
    // }).prop('disabled', !$.support.fileInput)
    .parent().addClass($.support.fileInput ? undefined : 'disabled');
}

var md5 = "",
    form_data = [],
    chunks = 0;

function calculate_md5(file, chunk_size) {
    var slice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
        chunks = Math.ceil(file.size / chunk_size),
        current_chunk = 0,
        spark = new SparkMD5.ArrayBuffer();

    function onload(e) {
        spark.append(e.target.result); // append chunk
        current_chunk++;
        if (current_chunk < chunks) {
            read_next_chunk();
        } else {
            md5 = spark.end();
        }
    };

    function read_next_chunk() {
        var reader = new FileReader();
        reader.onload = onload;
        var start = current_chunk * chunk_size,
            end = Math.min(start + chunk_size, file.size);
        reader.readAsArrayBuffer(slice.call(file, start, end));
    };
    read_next_chunk();
}
var searchState = {
    Initial: 0,
    Loading: 1,
    Success: 2,
    Error: 3
};

var input = document.getElementById('search-term'),
    $input = $(input),
    form = document.forms['search'],
    $form = $(form),
    mockSearch = window.location.href.match(/localhost/i),
    searchTimeout = false,
    searchDataTimeout = false,
    currentRequestId = false,
    $res = $('.results'),
    $resList = $('.results .list'),
    $more = $('.results .more'),
    $loader = $('#search-loader'),
    $nores = $('.results .nores'),
    state = searchState.Initial,
    currentSearchPage = 0,
    currentData = {},
    currentTerm = '',
    selectedSearchChoice = void 0;

var mockData = {
    places: [{
        id: 112,
        name: 'momofuku noodle bar',
        vicinity: '171 1st Avenue, New York',
        latitude: '55.761414',
        longitude: '37.617823'
    }, {
        id: 81,
        name: 'DBGB Kitchen and Bar',
        vicinity: '299 Bowery, New York',
        latitude: '55.761414',
        longitude: '37.617823'
    }, {
        id: 81,
        name: 'Grand Central Oyster Bar & Restaurant',
        vicinity: '89 East 42nd Street, New York',
        latitude: '55.761414',
        longitude: '37.617823'
    }, {
        id: 442,
        name: 'Gotham Bar & Grill',
        vicinity: '12 East 12th Street, New York',
        latitude: '55.761414',
        longitude: '37.617823'
    }, {
        id: 112,
        name: 'momofuku noodle bar 2',
        vicinity: '171 1st Avenue, New York',
        latitude: '55.761414',
        longitude: '37.617823'
    }, {
        id: 81,
        name: 'DBGB Kitchen and Bar 2',
        vicinity: '299 Bowery, New York',
        latitude: '55.761414',
        longitude: '37.617823'
    }, {
        id: 81,
        name: 'Grand Central Oyster Bar & Restaurant 2',
        vicinity: '89 East 42nd Street, New York',
        latitude: '55.761414',
        longitude: '37.617823'
    }, {
        id: 442,
        name: 'Gotham Bar & Grill 2',
        vicinity: '12 East 12th Street, New York',
        latitude: '55.761414',
        longitude: '37.617823'
    }]
};

function prepareSearch() {
    $input.on('keyup', onKeyUp).on('change', onKeyUp);
    $form.on('submit', onImmediateSearch);
    $more.on('click', showMore);
}

function showMore() {
    showResults(currentData, currentSearchPage + 1);
}

function onImmediateSearch(e) {
    e.preventDefault();
    e.stopPropagation();

    clearTimeout(searchTimeout);
    makeSearch();
    return false;
}

function onKeyUp(e) {
    if (e.target.value == currentTerm) return;

    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(makeSearch, settings.searchThrottle);

    currentTerm = e.target.value;
    setState(searchState.Initial);
}

function makeSearch() {
    setState(searchState.Loading);
    clearTimeout(searchDataTimeout);
    hideMessage();

    if (mockSearch) {
        makeMockedSearch();
        return;
    }

    var requestId = Math.floor(Math.random() * 1e6);
    $.ajax(settings.searchUrl, {
        dataType: 'json',
        method: 'GET',
        data: {
            search: $input.val()
        }
    }).done(function (res) {
        if (requestId != currentRequestId) return;
        showResults(res);
    }).fail(function (a, b, c) {
        if (requestId != currentRequestId) return;
        showFail(a, b, c);
    });

    searchDataTimeout = setTimeout(function () {
        showFail(false, 'connection timeouted!', false);
    }, settings.connectionTimeout);

    currentRequestId = requestId;
}

function makeMockedSearch() {
    setTimeout(function () {
        if (Math.random() > 0.8) showFail(false, 'connection fail!', false);else {
            if (Math.random() > 0.8) showResults({ places: [] });else {
                if (Math.random() > 0.8) searchDataTimeout = setTimeout(function () {
                    showFail(false, 'connection timeouted!', false);
                }, settings.connectionTimeout);else showResults(mockData);
            }
        }
    }, 1000);
}

function showEmptyResults() {
    setState(searchState.Success);
    $resList.html('');
    $more.addClass('hidden');
    $nores.removeClass('hidden');
}

function showResults(data, page) {
    currentSearchPage = page || 0;
    currentData = data;
    if (!data || !data.places || !data.places.length) {
        showEmptyResults();
        return;
    }
    var items = [],
        places = data.places,
        to = Math.min((currentSearchPage + 1) * settings.searchPerPage, places.length);

    for (var i = 0; i < to; i++) {
        items.push(renderItem(places[i]));
    }

    $resList.html(items.join(''));
    $more.toggleClass('hidden', to >= places.length);
    $nores.addClass('hidden');

    // give DOM some time
    setTimeout(setHandlers, 50);

    setState(searchState.Success);
}

function setHandlers() {
    $res.find('a').off('click').on('click', getOnClick(currentData.places, function (id, place) {
        selectedSearchChoice = id;
        populatePlaceForm(place);
        setActivePage(1);
        History.pushState({ place: place }, false, '/?id=' + id);
        // $w.scrollTo($('#anchor-step2'));
    }));
}

function renderItem(item) {
    var rows = ['<a href="/?id=', item.id, '#step2" data-id="', item.id, '"><div class="name">', item.name, '<div class="vicinity">', item.vicinity, '</div></div><div class="select">Select</div></a>'];
    return rows.join('');
}

function showFail(jqXHR, textStatus, errorThrown) {
    setState(searchState.Error);

    showMessage(textStatus, true);
    $resList.html('');
    $more.addClass('hidden');
    $nores.removeClass('hidden');
}

function setState(newState) {
    if (state == newState) return;

    if (newState == searchState.Initial) {
        $res.addClass('hidden');
        $loader.addClass('hidden');
    }

    if (newState == searchState.Loading) {
        $res.addClass('hidden');
        $loader.removeClass('hidden');
    }

    if (newState == searchState.Success) {
        $res.removeClass('hidden');
        $loader.addClass('hidden');
    }

    if (newState == searchState.Error) {
        $res.removeClass('hidden');
        $loader.addClass('hidden');
    }

    state = newState;
}
// settings
var settings = {
    connectionTimeout: 15000, // timeout to connect for form send
    animationTime: 500, // we need to know animation timeout for scroll control
    programmScrollTime: 300, // time for auto scroll
    programmScrollEasing: 'easeInOutQuad', // easing for auto scroll
    url: '/form', // url for form sending
    method: 'POST', // send method
    failedMessage: 'connection failed', // default message for send fail
    ignoreScrollSize: 10,

    searchThrottle: 250, //time to wait after keypress before search, ms
    searchUrl: '/api/places/web/', //search API url
    searchPerPage: 4, //items per search page

    placeUrl: '/api/web/places/', //url to load one place data
    pdfLink: '/test.pdf', //url to find agreement PDF
    emailFormUrl: '/api/legacy/email/', //url to send agreement to email
    emailMethod: 'GET', //email send form method

    messageTimeout: 10000 };
// onXX and behavioral functions
function ipadOrient() {
    $(document).ready(function () {
        window.addEventListener('orientationchange', function (e) {
            onOrient();
        });
    });
}

function onOrient(initial) {
    var wdth = $w.width(),
        hght = $w.height();
    if (window.orientation == 90 || window.orientation == -90 || wdth >= hght) $('html').addClass('landscape').removeClass('portrait');else $('html').removeClass('landscape').addClass('portrait');
}

function prepareBrowsers() {
    if (isDevice()) {
        return;
    }
}

function setProgrammScroll(height, time) {
    if (programmScrollInProgress) return;
    programmScrollInProgress = true;
    time = time || settings.animationTime;
    $w.scrollTo(height, time, { easing: settings.programmScrollEasing });
    setTimeout(function () {
        programmScrollInProgress = false;
    }, time);
}

var scrollTimeout = false;

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
    var wh = windowHeight();
    var skipScroll = dlt < settings.deviceIgnoreDelta && isDevice();

    clearTimeout(throttle);
    throttle = false;
}

var $w = $(window),
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
    var h = $w.scrollTop();
    d = h > previousScroll ? 1 : -1; //1 is scrolling bottom, -1 is scrolling top
    if (Math.abs(h - previousScroll) < settings.ignoreScrollSize) {
        //ok we're goin' down slow
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

    setPlacePageOnclicks();
    setViewerHandlers();
    setCrumbsHandlers();
    setUploadHandlers();

    if (getPlaceIdFromParams()) openPlacepageFromPermalink(function () {
        $('.main-loader').addClass('hidden');
    });
    $('.main-loader').addClass('hidden');

    // setActivePage(4);
}

function onResize() {
    if (isDevice()) return;

    recalcViewerParameters();
}

function onDeviceResize() {
    return;
}

function addEasings() {
    $.extend($.easing, {
        easeInOutQuad: function easeInOutQuad(x, t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t + b;
            return -c / 2 * (--t * (t - 2) - 1) + b;
        }
    });
}

$(startup);
var uploadFiles = [{
    preview: '<img src="http://www.randomkittengenerator.com/cats/rotator.php" />',
    status: uploadStatus.Success,
    size: Math.floor(Math.random() * 1e7)
}, {
    preview: '<img src="http://www.randomkittengenerator.com/cats/rotator.php" />',
    status: uploadStatus.Success,
    size: Math.floor(Math.random() * 1e7)
}, {
    preview: '<img src="http://www.randomkittengenerator.com/cats/rotator.php" />',
    status: uploadStatus.Success,
    size: Math.floor(Math.random() * 1e7)
}, {
    preview: '<img src="http://www.randomkittengenerator.com/cats/rotator.php" />',
    status: uploadStatus.Success,
    size: Math.floor(Math.random() * 1e7)
}, {
    preview: '<img src="http://www.randomkittengenerator.com/cats/rotator.php" />',
    status: uploadStatus.Success,
    size: Math.floor(Math.random() * 1e7)
}, {
    preview: '<img src="http://www.randomkittengenerator.com/cats/rotator.php" />',
    status: uploadStatus.Success,
    size: Math.floor(Math.random() * 1e7)
}, {
    preview: '<img src="http://www.randomkittengenerator.com/cats/rotator.php" />',
    status: uploadStatus.Success,
    size: Math.floor(Math.random() * 1e7)
}, {
    preview: '<img src="http://www.randomkittengenerator.com/cats/rotator.php" />',
    status: uploadStatus.Success,
    size: Math.floor(Math.random() * 1e7)
}],
    mockUpload = true,
    uploadIdx = 0,
    uploadBytes = 0,
    totalUploadBytes = 0,
    $uploadBar = $('#upload-bar'),
    $uploadProgress = $('#upload-progress'),
    $uploadCounter = $('#upload-counter'),
    $uploadTotalSize = $('#upload-totalSize');
var totalFiles = uploadFiles.length;
var totalSize = _.reduce(uploadFiles, function (memo, u) {
    return memo + u.size;
}, 0);
var chunk = 1e5;

function setUploadHandlers() {
    $('#page5-start').on('click', function () {
        $('#page5-start').remove();
        uploadNext();
    });
    $('#page5-back').on('click', function () {
        setActivePage(3);
    });
    $('#page5-close').on('click', function () {
        window.close();
    });

    $('#page5-retry').on('click', restartUpload);
    $uploadTotalSize.html(getSizeText(totalSize));
}

function restartUpload() {
    uploadIdx = 0;
    uploadBytes = 0;
    totalUploadBytes = 0;
    uploadNext();
    $('#page5-retry').addClass('hidden');
}

function uploadNext() {
    var upload = uploadFiles[uploadIdx];

    // set some async function with timeout
    if (mockUpload) uploadNextMock(upload);
}

function uploadNextMock() {
    var upload = uploadFiles[uploadIdx];
    if (!upload) {
        onUploadError('error', true);
        return;
    }
    if (uploadBytes < upload.size) {
        if (Math.random() > 0.999) {
            onUploadError('failed connection', true);
            return;
        }
        uploadBytes += chunk;
        totalUploadBytes += chunk;
        onUploadProgress();
        setTimeout(uploadNextMock, 100);
        return;
    }
    console.log('totalSize = ', totalSize, ', totalUploadBytes = ', totalUploadBytes, ', add = ', upload.size % chunk);
    // return;
    totalUploadBytes -= chunk - upload.size % chunk;
    uploadBytes = 0;
    uploadIdx++;

    if (uploadIdx >= totalFiles) {
        onUploadFinish('upload successfull', false);
        return;
    }

    onUploadProgress();
    setTimeout(uploadNextMock, 100);

    // setEmailVisualLoadingState(true);
    // setTimeout(function() {
    //     if (Math.random() > 0.8) {
    //         onEmailError({});
    //         return;
    //     }
    //     let data = {};
    //     if (Math.random() > 0.8) {
    //         data.err = true;
    //         data.text = 'new-yorkers-only understandable xtra long 3rr0r messag3';
    //     } else {
    //         data.err = false;
    //         data.text = 'Email is sent and you will receive it shortly';
    //     }
    //     onEmailSuccess(data);
    // }, settings.animationTime);
}

function onUploadProgress() {
    var prc = Math.floor(totalUploadBytes / totalSize * 100);
    setProgress(prc + '%', false, prc);
}

function onUploadError(msg, fatal) {
    showMessageWithTimeout(msg, true, settings.messageTimeout);
    if (fatal) {
        onUploadFinish('upload failed', true);
        return;
    }
    setTimeout(uploadNextMock, 100);
}

function onUploadFinish(msg, err) {
    $('#upload-info').addClass('hidden');
    if (err) {
        setProgress('Upload failed', true);
        // showMessageWithTimeout(msg, true, settings.messageTimeout);
        $('#page5-retry').removeClass('hidden');
        return;
    }
    setProgress('Finished!', false);
    showMessageWithTimeout('Thank you!', false, settings.messageTimeout);
    $('#page5-back').addClass('hidden');
    $('#page5-close').removeClass('hidden');
}

function setProgress(prc, err, bar) {
    $uploadProgress.html(prc).toggleClass('error', err).css('width', bar + '%');
    $uploadBar.css('width', bar + '%');
    $uploadCounter.html(Math.min(totalFiles, uploadIdx + 1) + '/' + totalFiles);
}

function getSizeText(size) {
    var sizes = ['b', 'kB', 'MB', 'GB', 'TB'];
    var bytes = size,
        idx = 0;
    while (bytes > 1e3) {
        bytes = bytes / 1e3;
        idx++;
    }
    return Math.floor(bytes) + sizes[idx];
}
var $viewer = $('.viewer'),
    $toolbar = $('.toolbar'),
    $viewerContent = $('.viewer .content');
var toolbarTimeout = false,
    toolbarTimeout2 = false;

function setViewerHandlers() {
    console.log('[setViewerHandlers]');
    $viewer.on('mouseover', showToolbar).on('mouseout', function (e) {
        toolbarTimeout = setTimeout(function () {
            $toolbar.addClass('hiding');
            toolbarTimeout2 = setTimeout(function () {
                $toolbar.removeClass('hiding').removeClass('active');
            }, 500);
        }, 500);
    }).on('scroll', onViewerScroll);
    $toolbar.on('mouseover', showToolbar);
    $('#legal-decline').on('click', function () {
        setActivePage(1);
    });

    $('#legal-accept').on('click', function () {
        if (viewerScrolled) setActivePage(3);
    });

    $('.icon.copy').on('click', function () {
        copyTextToClipboard(settings.pdfLink);
    });

    $('.icon.email').on('click', function () {
        // open form in breadcrumbs for email enter
        showEmailForm();
    });

    $('.icon.pdf').on('click', function () {
        window.open(settings.pdfLink, '_blank');
    });

    $('.icon.print').on('click', function () {
        window.print();
    });
}

function onViewerScroll() {
    if (viewerScrolled) return;
    if (!viewerHeight || !viewerContentHeight) recalcViewerParameters();
    var scroll = $viewer.scrollTop();
    if (scroll >= viewerMinScroll) {
        $('#legal-accept').removeClass('disabled');
        viewerScrolled = true;
    }
}

function showToolbar() {
    $toolbar.addClass('active').removeClass('hiding');
    clearTimeout(toolbarTimeout);
    clearTimeout(toolbarTimeout2);
}

var viewerHeight = void 0,
    viewerContentHeight = void 0,
    viewerMinScroll = void 0,
    viewerScrolled = false;

function recalcViewerParameters() {
    if (viewerScrolled) return;
    viewerHeight = $viewer.height();
    viewerContentHeight = $viewerContent.height();
    viewerMinScroll = viewerContentHeight - 1.1 * viewerHeight;
}