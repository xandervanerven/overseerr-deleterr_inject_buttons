// De CSS die je wilt toepassen
const customCSS = `
    .max-w-8xl.mx-auto.px-4 {
        display: grid;
        grid-template-columns: repeat(auto-fill,minmax(33rem,1fr));
        gap: 1rem;
        align-items: center;
    }
    
    .relative.z-10.flex.w-full.items-center.overflow-hidden.pl-4.pr-4.sm\:pr-0.xl\:w-7\/12` + 
    '.32' +
    `xl\:w-2\/3 {
        width: 50%;
    }
    
    .z-10.mt-4.flex.w-full.flex-col.justify-center.space-y-2.pl-4.pr-4.xl\:mt-0.xl\:w-96.xl\:items-end.xl\:pl-0 {
        display: none;
    }
`;

let styleElement; // Dit element zal de custom CSS bevatten

const applyStyles = () => {
    if (window.location.href.includes('/requests')) {
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.type = 'text/css';
            styleElement.innerHTML = customCSS;
            document.head.appendChild(styleElement);
        }
    } else {
        if (styleElement) {
            styleElement.remove();
            styleElement = null;
        }
    }
};

// Voer de functie een keer uit bij het laden van de pagina
applyStyles();

// Voeg de MutationObserver toe
const cssObserver = new MutationObserver(() => {
    applyStyles();
});

cssObserver.observe(document.body, { childList: true, subtree: true });
