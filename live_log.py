# live_log.py
from tornado.ioloop import IOLoop

_clients: list = []          # websocket connessi

def register(ws):
    """Chiamato quando un nuovo websocket si apre."""
    _clients.append(ws)

def unregister(ws):
    """Chiamato alla chiusura del websocket."""
    try:
        _clients.remove(ws)
    except ValueError:
        pass

def emit(message: str):
    """
    Manda una stringa a tutti i client connessi.
    Se la chiamata arriva da un thread qualunque,
    la rimetti nell'IOLoop principale di Tornado.
    """
    loop = IOLoop.current()
    for ws in list(_clients):
        loop.add_callback(ws.write_message, str(message))
