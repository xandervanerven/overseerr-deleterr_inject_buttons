let gotifyInterval;

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

                        // Als dit de eerste run is en het bericht bevat "Verzoek om" of "Request to", markeer dan de bericht-ID's als 'gezien'.
                        // En begin met het weergeven van de berichten.
                        if (isFirstRun && (messageText.includes("Verzoek om") || messageText.includes("Request to"))) {
                            isFirstRun = false;
                        }

                        if (!isFirstRun && !seenMessageIds.has(message.id)) {
                            console.log("Gotify Message:", message.message);
                            seenMessageIds.add(message.id);

                            // Als de set te groot wordt (bijv. meer dan 100), maak het dan leeg om geheugengebruik te minimaliseren
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
                // Controleer of de gele button nog steeds bestaat na elke fetch
                if (!document.querySelector('button.bg-yellow-500')) {
                    stopGotifyPolling();
                }
            });
    }

    // Roep de functie om de zoveel seconden aan. Hier is het ingesteld op 1 seconde (1000 milliseconden).
    gotifyInterval = setInterval(fetchGotifyMessages, 1000);
}