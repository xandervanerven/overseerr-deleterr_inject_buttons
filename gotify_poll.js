let gotifyInterval;
let alertifyDialog;
let messagesContent = "";  // Deze variabele zal alle berichten bijhouden voor de pop-up.

function stopGotifyPolling() {
    clearInterval(gotifyInterval);
}

function showPopupMessage(message) {
    messagesContent += message + "<br><br>";  // Voeg een nieuw bericht toe aan de huidige berichten.

    if (!alertifyDialog) {
        alertifyDialog = alertify.alert("Gotify Messages", messagesContent).set({transition:'zoom'}).show();
    } else {
        alertifyDialog.setContent(messagesContent);
    }
}

function startGotifyPolling() {
    stopGotifyPolling();  // Stop de huidige polling, indien actief

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
                            showPopupMessage(message.message);  // Update de pop-up met het nieuwe bericht.
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