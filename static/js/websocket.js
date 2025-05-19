const logBox = document.getElementById("log");     // div dove scriverai i log
const ws = new WebSocket(`ws://${location.host}/ws/log`);

ws.onmessage = (event) => {
    const p = document.createElement("p");
    p.textContent = event.data;
    logBox.appendChild(p);
    // scroll automatico
    logBox.scrollTop = logBox.scrollHeight;
};

ws.onclose = () => {
    console.warn("WebSocket chiuso");
};