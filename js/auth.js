/**
 * Returns authorization token if user is logged in
 */
function getAuthToken() {
    return localStorage.getItem('token');
}

/**
 * Returns random string value. In real app should be crypto secure (unpredictable)
 * @param length
 * @returns {string} random string
 */
function randomString(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function authCheck() {
    if (getAuthToken() != null) {
        document.body.classList.add('auth-logged-in');
        document.body.classList.remove('auth-logged-out');
        return true;
    } else {
        document.body.classList.remove('auth-logged-in');
        document.body.classList.add('auth-logged-out');
        return false;
    }
}

let AuthPopupWindow;
function auth() {
    const clientId = $("#auth-app-id").val();
    const state = randomString(24); // random state to verify that response from server is not hijacked
    localStorage.setItem('state', state); // save it, so we can check it later

    var redirect_uri = location.href.substring(0, location.href.lastIndexOf('/')) + '/oauth-return.html';

    const url = `https://api.busstab.ru/oauth/authorize?response_type=token&client_id=${clientId}&redirect_uri=${redirect_uri}&scope=profile balance req.passport req.delta&state=${state}`;

    AuthPopupWindow = window.open(url, '_blank', 'location=yes,resizable=yes,scrollbars=yes,width=500,height=700')
}

function logout() {
    localStorage.removeItem('token');
    authCheck();
}

/**
 * Subscribe to messages from OAuth popup
 */
function subscribeToAuthWindow() {
    window.addEventListener('message', function (event) {
        if (event.origin === window.location.origin) {
            if (typeof event.data === 'object' && event.data.auth) {
                if (AuthPopupWindow) AuthPopupWindow.close();
                // Give time to popup to close
                setTimeout(function () {
                    switch (event.data.auth) {
                        case "done":
                            alert("Авторизация успешно завершена");
                            authCheck();
                            break;
                        case "fail-state":
                            alert("Не удалось авторизоваться: параметр state не совпадает, возможна подмена ответа от сервера, либо вы открыли два окна авторизации одновременно");
                            break;
                        default:
                            alert("Непредвиденная ошибка авторизации")
                    }
                }, 1);
            }
        }
    }, false)
}


jQuery(() => {
    $('#auth-login').on('click', auth);
    $('#auth-logout').on('click', logout);

    if (!authCheck()) {
        subscribeToAuthWindow();
    }
    document.querySelector('body').classList.add('loaded');
});