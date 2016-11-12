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
}