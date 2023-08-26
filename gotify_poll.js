let gotifyInterval;
let pollingTimeout;
let alertifyDialog = null;
let messagesContent = "";

const currentURL = window.location.pathname;

function showPopupMessage(message) {
    messagesContent += message + "<br>";

    if (!alertifyDialog) {
        alertifyDialog = alertify.alert("Overseerr deleterr", messagesContent).set({
            transition: 'zoom'
        }).show();

        // Pas hier de stijl van de dialog toe
        styleAlertifyDialog();

        alertifyDialog.setting('onclose', function() {
            alertifyDialog = null;
        });
    } else {
        alertifyDialog.setContent(messagesContent);
    }
}

function styleAlertifyDialog() {
    let dialogElem = document.querySelector('.alertify .ajs-dialog');
    let dialogHeader = document.querySelector('.alertify .ajs-header');
    let dialogContent = document.querySelector('.alertify .ajs-content');
    let dialogFooter = document.querySelector('.alertify .ajs-footer');
    let dialogDimmer = document.querySelector('.alertify .ajs-dimmer');

    if (dialogElem) {
        dialogElem.classList.add('ring-1', 'shadow-xl', 'sm:rounded-lg', 'bg-gray-800', 'text-gray-200');
        dialogElem.style.cssText += 'border: 0px !important; border-radius: 0.5rem !important; background-color: rgb(31 41 55/var(--tw-bg-opacity)) !important;';
        dialogElem.style.cssText += 'box-shadow: var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0 0 #0000)!important; --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) rgb(158 158 158 / 10%)!important;'
    }
    if (dialogHeader) {
        dialogHeader.classList.add('text-white');
        dialogHeader.style.cssText += 'background-color: rgb(31 41 55/var(--tw-bg-opacity)) !important; color: rgb(255 255 255/var(--tw-text-opacity)) !important;';
    }
    if (dialogContent) {
        dialogContent.classList.add('text-gray-200', 'sm:rounded-lg');
        dialogContent.style.cssText += 'background-color: rgb(55 65 81/var(--tw-bg-opacity)) !important; --tw-border-opacity: 1 !important; border-color: rgb(107 114 128/var(--tw-border-opacity)) !important;';
    }
    if (dialogFooter) {
        dialogFooter.style.cssText += 'background-color: rgb(31 41 55/var(--tw-bg-opacity)) !important;';
    }
    if (dialogDimmer) {
        dialogDimmer.style.cssText += '--tw-bg-opacity: 0.7 !important; background-color: rgb(31 41 55/var(--tw-bg-opacity)) !important;';
    }
}

function stopGotifyPolling() {
    clearInterval(gotifyInterval);
    clearTimeout(pollingTimeout);  // Annuleer de 30-seconden timer
}

function startGotifyPolling() {
    stopGotifyPolling();
    messagesContent = "";

    const initialURL = window.location.pathname;
    const seenMessageIds = new Set();
    let isFirstRun = true;

    function fetchGotifyMessages() {
        const proxyEndpoint = "/get_messages";

        fetch(proxyEndpoint)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                processGotifyData(data);
            })
            .catch(error => {
                console.log("There was a problem with the fetch operation:", error.message);
            })
            .finally(() => {
                if (window.location.pathname !== initialURL || !document.querySelector('button.bg-yellow-500') || (!currentURL.includes('/movie/') && !currentURL.includes('/tv/'))) {
                    stopGotifyPolling();
                    console.log("stop polling");
                }
            });
    }

    function processGotifyData(data) {
        if (data && data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
            data.messages.reverse().forEach(message => {
                const messageText = message.message;

                if (isFirstRun && (messageText.includes("Verzoek om") || messageText.includes("Request to"))) {
                    isFirstRun = false;
                }

                if (!isFirstRun && !seenMessageIds.has(message.id)) {
                    console.log("Gotify Message:", message.message);
                    showPopupMessage(message.message);
                    seenMessageIds.add(message.id);

                    if (seenMessageIds.size > 100) {
                        seenMessageIds.clear();
                    }
                } else if (isFirstRun) {
                    seenMessageIds.add(message.id);
                }
            });
        }
    }

    gotifyInterval = setInterval(fetchGotifyMessages, 1000);

    // Start de 30-seconden timer
    pollingTimeout = setTimeout(() => {
        stopGotifyPolling();
        console.log("30 seconds over, stop polling");
    }, 30000);
}

// Event listener om het pollen te stoppen wanneer de URL van de pagina verandert
window.addEventListener('popstate', function(event) {
    stopGotifyPolling();
    console.log("stop polling, popstate");
});