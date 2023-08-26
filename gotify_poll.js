let gotifyInterval;

function stopGotifyPolling() {
    clearInterval(gotifyInterval);
}

function startGotifyPolling() {
    stopGotifyPolling();  // Stop de huidige polling, indien actief

    const seenMessageIds = new Set();
    let isFirstRun = true;
    let alertifyDialog;

    function showPopupMessage(message) {
        if (!alertifyDialog) {
            alertifyDialog = alertify.alert("Gotify Messages", message).set({ autoReset: false });
        } else {
            const currentContent = alertifyDialog.content;
            alertifyDialog.setContent(currentContent + "<br>" + message);
        }
    }    

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
                            showPopupMessage(messageText);  // Toon het bericht in de popup
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