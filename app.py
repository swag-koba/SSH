import os
import json
import tornado.ioloop
import tornado.web
import tornado.websocket
import tornado.template

# Il tuo codice originale qui...

paragraphs = []


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        # Usiamo render_string invece di render per evitare il templating
        html_content = ""
        try:
            with open(os.path.join(os.path.dirname(__file__), "templates", "index.html"), "r", encoding="utf-8") as f:
                html_content = f.read()
        except Exception as e:
            print(f"Errore nella lettura del file HTML: {e}")
            html_content = "<html><body><h1>Errore nel caricamento della pagina</h1></body></html>"

        # Sostituiamo manualmente il tag static_url
        html_content = html_content.replace('{{ static_url(\'js/inquiro-app.js\') }}', '/static/js/inquiro-app.js')

        self.write(html_content)
        self.finish()


class LogSocket(tornado.websocket.WebSocketHandler):
    def open(self):
        register(self)

    def on_close(self):
        unregister(self)

    def on_message(self, msg):
        pass


class QueryHandler(tornado.web.RequestHandler):
    def post(self):
        data = json.loads(self.request.body)
        query = data.get("query", "")
        toggle = data.get("toggle", False)
        print(f"Richiesta ricevuta: '{query}', toggle attivo: {toggle}")

        # Qui inserisci il tuo codice per elaborare la query
        # ...


def register(client):
    # Registra un client WebSocket
    print("Client WebSocket registrato")


def unregister(client):
    # Rimuovi un client WebSocket
    print("Client WebSocket rimosso")


def make_app():
    return tornado.web.Application(
        [
            (r"/", MainHandler),
            (r"/query", QueryHandler),
            (r"/ws/log", LogSocket),
        ],
        static_path=os.path.join(os.path.dirname(__file__), "static"),
        debug=True
    )


if __name__ == "__main__":
    try:
        app = make_app()
        app.listen(8888)
        print("Server avviato su http://localhost:8888")
        tornado.ioloop.IOLoop.current().start()
    except KeyboardInterrupt:
        print("Programma interrotto!")