const setupCustomButtons = () => {
    const currentURL = window.location.href;
    if (!currentURL.includes('/movie/') && !currentURL.includes('/tv/')) {
        return; // Stop de uitvoering als de URL niet de vereiste strings bevat
    }

    const geleButton = document.querySelector('button.bg-yellow-500');

    // Controleer of de gele knop niet bestaat, maar de rode wel. Als dat het geval is, verwijder de rode knop.
    if (!geleButton) {
        const rodeButton = document.querySelector('.bg-red-500');
        if (rodeButton) {
            rodeButton.remove();
        }
        return; // Verlaat de functie
    }

    if (geleButton && !document.querySelector('.bg-red-500')) {
        const trashIcon = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="16" height="16" class="mr-2">
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/>
            </svg>
        `;

        const setButtonStyles = (button) => {
            button.style.border = 'none';
            button.style.color = 'white';
            button.style.display = 'flex';
            button.style.alignItems = 'center';
            button.style.padding = '0.5rem 1rem';
            button.style.cursor = 'pointer';
            button.style.borderRadius = '0.25rem';

            // Hover effect
            button.onmouseover = function() {
                this.style.backgroundColor = '#fa7878';
            };
            button.onmouseout = function() {
                this.style.backgroundColor = '#EF4444';
            };
        };

        const setActionAndSubmit = (button, message) => {
            button.addEventListener('click', function() {
                const textarea = document.getElementById('message');
                textarea.innerHTML = message;

                // Trigger een input event
                const event = new Event('input', { 'bubbles': true });
                textarea.dispatchEvent(event);
                
                setTimeout(() => {
                    const submitButton = document.querySelector('button[data-testid="modal-ok-button"]');
                    submitButton.click();
                }, 10); 
            });
        };

        const nieuweRodeButton = document.createElement('button');
        nieuweRodeButton.classList.add('bg-red-500');
        nieuweRodeButton.innerHTML = trashIcon + '<span class="font-semibold">Delete</span>';
        setButtonStyles(nieuweRodeButton);
        nieuweRodeButton.style.marginLeft = '0.5rem';

        geleButton.parentNode.insertBefore(nieuweRodeButton, geleButton.nextSibling);

        nieuweRodeButton.addEventListener('click', function() {
            geleButton.click();
        });

        nieuweRodeButton.addEventListener('click', function() {
            setTimeout(function() {
                const closeButton = document.querySelector('button[data-testid="modal-cancel-button"]');
                if (closeButton) {
                    const delete4KBtn = closeButton.cloneNode(true);
                    delete4KBtn.querySelector('span').textContent = 'Delete 4K';
                    delete4KBtn.querySelector('span').classList.add('font-semibold');
                    delete4KBtn.style.backgroundColor = '#f56565';
                    delete4KBtn.insertAdjacentHTML('afterbegin', trashIcon);
                    setButtonStyles(delete4KBtn);
                    delete4KBtn.style.marginLeft = '0.5rem';
                    setActionAndSubmit(delete4KBtn, 'delete 4k');
                    delete4KBtn.addEventListener('click', startGotifyPolling);

                    const deleteBtn = closeButton.cloneNode(true);
                    deleteBtn.querySelector('span').textContent = 'Delete';
                    deleteBtn.querySelector('span').classList.add('font-semibold');
                    deleteBtn.style.backgroundColor = '#f56565';
                    deleteBtn.insertAdjacentHTML('afterbegin', trashIcon);
                    setButtonStyles(deleteBtn);
                    deleteBtn.style.marginLeft = '0.5rem';
                    setActionAndSubmit(deleteBtn, 'delete');
                    deleteBtn.addEventListener('click', startGotifyPolling);

                    closeButton.parentNode.insertBefore(delete4KBtn, closeButton);
                    closeButton.parentNode.insertBefore(deleteBtn, delete4KBtn.nextSibling);
                }
            }, 100);
        });
    }
};

// Voer de functie uit bij het laden van de pagina
setupCustomButtons();

// Voeg de MutationObserver toe
const observer = new MutationObserver(function() {
    setupCustomButtons();
});

observer.observe(document.body, { childList: true, subtree: true });