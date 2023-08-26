let gotifyInterval;
let alertifyDialog = null;  
let messagesContent = ""; 

function showPopupMessage(message) {
    messagesContent += message + "<br>";  

    if (!alertifyDialog) {
        alertifyDialog = alertify.alert("Overseerr deleterr", messagesContent).set({transition:'zoom'}).show();
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
    messagesContent = "";  // Reset de opgebouwde berichten.

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
                if (!document.querySelector('button.bg-yellow-500')) {
                    stopGotifyPolling();
                }
            });
    }

    gotifyInterval = setInterval(fetchGotifyMessages, 1000);
}