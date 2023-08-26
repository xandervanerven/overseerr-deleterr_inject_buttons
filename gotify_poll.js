(function() {
    const seenMessageIds = new Set(); // Houdt bij welke bericht-ID's al zijn gezien.
    const scriptLoadTime = new Date(); // De huidige tijd wanneer het script wordt geladen.

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
                        const messageDate = new Date(message.date);
                        // Controleer of het bericht nieuw is en of de datum van het bericht na het laden van het script ligt
                        if (!seenMessageIds.has(message.id) && messageDate > scriptLoadTime) {
                            console.log("Gotify Message:", message.message);
                            seenMessageIds.add(message.id);
                            
                            // Als de set te groot wordt (bijv. meer dan 100), maak het dan leeg om geheugengebruik te minimaliseren
                            if (seenMessageIds.size > 100) {
                                seenMessageIds.clear();
                            }
                        }
                    });
                }
            })
            .catch(error => {
                console.log("There was a problem with the fetch operation:", error.message);
            });
    }

    // Roep de functie om de zoveel seconden aan. Hier is het ingesteld op 1 seconde (1000 milliseconden).
    setInterval(fetchGotifyMessages, 1000);
})();
