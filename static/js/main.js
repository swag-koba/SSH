/* static/js/main.js */
document.addEventListener('DOMContentLoaded', () => {
    const input   = document.getElementById('inputBox');
    const toggle  = document.getElementById('toggleButton');
    const search  = document.getElementById('searchButton');

    let toggleOn = false;

    /* 1. Gestione del toggle: cambia solo stato e UI,
          NON registra altri listener. */
    toggle.addEventListener('click', () => {
        toggleOn = !toggleOn;
        toggle.classList.toggle('active', toggleOn);   // animazione visiva
        if (toggleOn) {
            toggle.style.backgroundColor = "#8fc9ff";  // colore acceso
        } else {
            toggle.style.backgroundColor = "";  // colore spento
        }
    });


    /* 2. Funzione condivisa per l’invio */
    function sendQuery () {
        const query = input.value.trim();
        if (!query) return;

        fetch('/query', {
            method : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body   : JSON.stringify({ query, toggle: toggleOn })
        }).catch(console.error);
    }

    /* 3. Invio con INVIO nella casella */
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();          // evita comportamenti impliciti
            sendQuery();
        }
    });

    /* 4. Invio con click sull’icona */
    search.addEventListener('click', (e) => {
        e.preventDefault();              // sicurezza extra
        e.stopPropagation();             // blocca bubbling
        sendQuery();
    }, { once: false });                 // un solo listener per sempre
});