(function() {
    let isFirstFetch = true;

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
                    // Als het de eerste fetch is, sla dan de berichten over en zet de vlag uit
                    if (isFirstFetch) {
                        isFirstFetch = false;
                        return; // Vroegtijdig beëindigen van deze callback-functie
                    }

                    // Toon de berichten
                    data.messages.forEach(message => {
                        console.log("Gotify Message:", message.message);
                    });
                }
            })
            .catch(error => {
                console.log("There was a problem with the fetch operation:", error.message);
            });
    }

    setInterval(fetchGotifyMessages, 1000);
})();