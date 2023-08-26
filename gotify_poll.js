let gotifyInterval;
let alertifyDialog = null;  
let messagesContent = ""; 

const currentURL = window.location.pathname;

function showPopupMessage(message) {
    messagesContent += message + "<br>";  

    if (!alertifyDialog) {
        alertifyDialog = alertify.alert("Overseerr deleterr", messagesContent).set({transition:'zoom'}).show();
        
        // Pas hier de stijl van de dialog toe
        let dialogElem = document.querySelector('.alertify .ajs-dialog');
        let dialogHeader = document.querySelector('.alertify .ajs-header');
        let dialogContent = document.querySelector('.alertify .ajs-content');
        let dialogFooter = document.querySelector('.alertify .ajs-footer');

        if (dialogElem) {
            dialogElem.classList.add('ring-1','shadow-xl', 'sm:rounded-lg', 'bg-gray-800', 'text-gray-200');
            dialogElem.style.cssText += 'border-radius: 0.5rem !important; background-color: rgb(31 41 55/var(--tw-bg-opacity)) !important;';
        }        
        if (dialogHeader) {
            dialogHeader.classList.add('text-white');
            dialogHeader.style.cssText += 'background-color: rgb(31 41 55/var(--tw-bg-opacity)) !important; color: rgb(255 255 255/var(--tw-text-opacity)) !important;';
        }
        if (dialogContent) {
            dialogContent.classList.add('text-gray-200');
            dialogContent.style.cssText += 'background-color: rgb(31 41 55/var(--tw-bg-opacity)) !important;';
        }
        if (dialogFooter) {
            dialogFooter.style.cssText += 'background-color: rgb(31 41 55/var(--tw-bg-opacity)) !important;';
        }            
        
        alertifyDialog.setting('onclose', function() { 
            alertifyDialog = null;  
        });
    } else {
        alertifyDialog.setContent(messagesContent);
    }
}

function stopGotifyPolling() {
    clearInterval(gotifyInterval);
}

function startGotifyPolling() {
    stopGotifyPolling();
    messagesContent = "";  

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
            })
            .catch(error => {
                console.log("There was a problem with the fetch operation:", error.message);
            })
            .finally(() => {
                if (!document.querySelector('button.bg-yellow-500') || (!currentURL.includes('/movie/') && !currentURL.includes('/tv/'))) {
                    stopGotifyPolling();
                }                
            });
    }

    gotifyInterval = setInterval(fetchGotifyMessages, 1000);

    // Stop het pollen na 30 seconden
    setTimeout(stopGotifyPolling, 30000);
}