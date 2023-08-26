(function() {
    const seenMessageIds = new Set(); 
    const scriptLoadTime = new Date(); 
    console.log("Script loaded at:", scriptLoadTime);

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
                console.log("Received data:", data);
                if (data && data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
                    data.messages.reverse().forEach(message => {
                        const messageDate = new Date(message.date);
                        console.log("Comparing dates:", messageDate, ">", scriptLoadTime);
                        if (!seenMessageIds.has(message.id) && messageDate > scriptLoadTime) {
                            console.log("Gotify Message:", message.message);
                            seenMessageIds.add(message.id);
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

    setInterval(fetchGotifyMessages, 1000);
})();
