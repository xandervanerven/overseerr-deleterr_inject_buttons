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
                    if (!isFirstFetch) {
                        data.messages.forEach(message => {
                            console.log("Gotify Message:", message.message);
                        });
                    } else {
                        isFirstFetch = false;
                    }
                }
            })
            .catch(error => {
                console.log("There was a problem with the fetch operation:", error.message);
            });
    }

    setInterval(fetchGotifyMessages, 1000);
})();
