(function() {
    let lastSeenMessageId = 0; // Begin bij 0 zodat alle berichten initieel worden getoond

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
                    // Filter berichten die nieuw zijn (hun ID is groter dan de laatst gezien ID)
                    const newMessages = data.messages.filter(message => message.id > lastSeenMessageId);

                    // Update de laatst gezien ID
                    if (newMessages.length > 0) {
                        lastSeenMessageId = Math.max(...newMessages.map(message => message.id));
                    }

                    // Toon de nieuwe berichten
                    newMessages.forEach(message => {
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