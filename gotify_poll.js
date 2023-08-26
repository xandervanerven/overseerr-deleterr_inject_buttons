let gotifyInterval;
let alertifyDialog = null;  // Definieer deze variabele buiten de functie, zodat we de dialoog gedurende meerdere aanroepen kunnen bijhouden.
let messagesContent = "";  // Hier bewaren we de opgebouwde berichtcontent.

function showPopupMessage(message) {
    messagesContent += message + "<br>";  // Voeg het nieuwe bericht toe aan de bestaande content.

    if (!alertifyDialog) {
        alertifyDialog = alertify.alert("Gotify Messages", messagesContent).set({transition:'zoom'}).show();
        alertifyDialog.setting('onclose', function() { 
            alertifyDialog = null;  // Reset de variabele wanneer de pop-up wordt gesloten.
        });
    } else {
        alertifyDialog.setContent(messagesContent);
    }
}

function stopGotifyPolling() {
    clearInterval(gotifyInterval);
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
                            showPopupMessage(message.message);  // Toon het bericht in de pop-up.
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