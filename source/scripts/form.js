// form
let phs = {},
    frm = document.forms['details'],
    $frm = $('#details-form'),
    formValidated = false,
    $formSubmit = $('#form-submit'),
    userData = {};

function prepareForm() {
    $frm.on('submit', onSubmit);

    $frm.find('input, textarea')
        .on('change', validateForm)
        .on('keyup', validateForm);
    $('#page4-back').on('click', () => {
        setActivePage(2);
    })
}

function setPlaceHolder(cls, val) {
    let $inp = $('input.' + cls),
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
            setTimeout(function() {
                $inp.css('color', '');
                setTimeout(function() {
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
            setTimeout(function() {
                $inp.css('color', 'rgba(0,0,0,0)');
                setTimeout(function() {
                    e.target.value = '';
                    $inp.removeClass('transit');
                    setTimeout(function() {
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
    setTimeout(function() {
        if (Math.random() > 0.5) {
            onError({});
            return;
        }
        let data = {};
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

let xhr, mockRequest = true;
const emptyValidator = (elem) => !elem.value;
const cbxValidator = (elem) => !elem.checked;
const cbxValue = (elem) => elem.checked;
const fields = [
    { elem: 'email', validator: emptyValidator },
    { elem: 'name', validator: emptyValidator },
    { elem: 'surname', validator: emptyValidator },
    { elem: 'address', validator: emptyValidator },
    { elem: 'legalname', validator: emptyValidator },
    { elem: 'affirm_use_right', validator: cbxValidator, value: cbxValue },
    { elem: 'affirm_grant_right', validator: cbxValidator, value: cbxValue },
    { elem: 'affirm_people', validator: cbxValidator, value: cbxValue }
];

function validateForm() {
    let validated = true;
    _.forEach(fields, (f) => {
        let elem = frm.elements[f.elem];
        if (f.validator(elem)) {
            // $(elem).focus();
            validated = false;
        }
    });
    formValidated = validated;

    $formSubmit.toggleClass('disabled', !formValidated);
}

function onSubmit() {
    if (!formValidated)
        return false;

    let data = {};
    _.forEach(fields, (f) => {
        data[f.elem] = f.value ? f.value(frm.elements[f.elem]) : frm.elements[f.elem].value;
    })

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