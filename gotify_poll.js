let gotifyInterval;

function startGotifyPolling() {
    const seenMessageIds = new Set();
    let isFirstRun = true;  // Deze vlag wordt gebruikt om te controleren of dit de eerste keer is dat de functie wordt uitgevoerd.

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
                        // Als dit de eerste run is, markeer dan gewoon de bericht-ID's als 'gezien'.
                        if (isFirstRun) {
                            seenMessageIds.add(message.id);
                        } else if (!seenMessageIds.has(message.id)) {
                            console.log("Gotify Message:", message.message);
                            seenMessageIds.add(message.id);

                            // Als de set te groot wordt (bijv. meer dan 100), maak het dan leeg om geheugengebruik te minimaliseren
                            if (seenMessageIds.size > 100) {
                                seenMessageIds.clear();
                            }
                        }
                    });
                    if (isFirstRun) {
                        isFirstRun = false;  // Markeer dat de eerste run is voltooid.
                    }
                }
            })
            .catch(error => {
                console.log("There was a problem with the fetch operation:", error.message);
            });
    }

    // Roep de functie om de zoveel seconden aan. Hier is het ingesteld op 1 seconde (1000 milliseconden).
    gotifyInterval = setInterval(fetchGotifyMessages, 1000);
}

function stopGotifyPolling() {
    clearInterval(gotifyInterval);
}
