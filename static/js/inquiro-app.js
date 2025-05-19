// Utilizziamo React Hooks
const { useState, useRef, useEffect } = React;

// Componente principale
const InquiroApp = () => {
  // Stati per gestire l'app
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState(() => {
    // Carica i file dal localStorage, se esistono
    const savedFiles = localStorage.getItem('inquiro-files');
    return savedFiles ? JSON.parse(savedFiles) : [];
  });
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showFilePanel, setShowFilePanel] = useState(true);  // Mostra il pannello dei file per default
  const [chats, setChats] = useState(() => {
    // Carica le chat dal localStorage, se esistono
    const savedChats = localStorage.getItem('inquiro-chats');
    return savedChats ? JSON.parse(savedChats) : [{ id: 1, name: 'Chat principale', active: true, messages: [] }];
  });
  const [activeChatId, setActiveChatId] = useState(() => {
    // Trova l'ID della chat attiva
    const savedChats = localStorage.getItem('inquiro-chats');
    if (savedChats) {
      const parsedChats = JSON.parse(savedChats);
      const activeChat = parsedChats.find(chat => chat.active);
      return activeChat ? activeChat.id : 1;
    }
    return 1;
  });
  const [toggleMode, setToggleMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);  // Per il file selezionato da visualizzare

  const chatContainerRef = useRef(null);
  const wsRef = useRef(null);

  // Icone personalizzate da Flaticon
  const icons = {
    search: 'https://cdn-icons-png.flaticon.com/512/149/149852.png',
    upload: 'https://cdn-icons-png.flaticon.com/512/568/568717.png',
    file: 'https://cdn-icons-png.flaticon.com/512/281/281760.png',
    filePdf: 'https://cdn-icons-png.flaticon.com/512/337/337946.png',
    fileDoc: 'https://cdn-icons-png.flaticon.com/512/281/281760.png',
    fileExcel: 'https://cdn-icons-png.flaticon.com/512/281/281761.png',
    filePpt: 'https://cdn-icons-png.flaticon.com/512/136/136543.png',
    fileImage: 'https://cdn-icons-png.flaticon.com/512/337/337948.png',
    close: 'https://cdn-icons-png.flaticon.com/512/59/59836.png',
    chat: 'https://cdn-icons-png.flaticon.com/512/134/134914.png',
    plus: 'https://cdn-icons-png.flaticon.com/512/32/32339.png',
    folder: 'https://cdn-icons-png.flaticon.com/512/148/148825.png',
    download: 'https://cdn-icons-png.flaticon.com/512/109/109609.png',
    settings: 'https://cdn-icons-png.flaticon.com/512/126/126472.png',
    chevronDown: 'https://cdn-icons-png.flaticon.com/512/32/32195.png',
    trash: 'https://cdn-icons-png.flaticon.com/512/3096/3096673.png',
    ai: 'https://cdn-icons-png.flaticon.com/512/18140/18140141.png',
    robot: 'https://cdn-icons-png.flaticon.com/512/2021/2021646.png',
    brain: 'https://cdn-icons-png.flaticon.com/512/1261/1261143.png'
  };

  // Componente icona personalizzata
  const Icon = ({ name, size = 16, className = "" }) => {
    const iconSrc = icons[name] || icons.file;
    return (
      <img
        src={iconSrc}
        alt={name}
        className={className}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          display: 'inline-block',
          objectFit: 'contain',
          verticalAlign: 'middle'
        }}
      />
    );
  };

  // Funzione per ottenere l'icona corretta per ogni tipo di file
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();

    switch(extension) {
      case 'pdf':
        return 'filePdf';
      case 'doc':
      case 'docx':
        return 'fileDoc';
      case 'xls':
      case 'xlsx':
        return 'fileExcel';
      case 'ppt':
      case 'pptx':
        return 'filePpt';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
        return 'fileImage';
      default:
        return 'file';
    }
  };

  // Simulazione lettura file da server/filesystem
  const readFileContent = async (file) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const extension = file.name.split('.').pop().toLowerCase();
        let content = '';

        switch(extension) {
          case 'pdf':
            content = 'Contenuto PDF visualizzato direttamente nel visualizzatore integrato';
            break;
          case 'docx':
          case 'doc':
            content = `# Documento Word: ${file.name}\n\nQuesto è un esempio di contenuto di un documento Word. In un'implementazione reale, il contenuto verrebbe estratto dal file.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit.`;
            break;
          case 'xlsx':
          case 'xls':
            content = `# Foglio Excel: ${file.name}\n\nQuesto è un esempio di contenuto di un foglio Excel. In un'implementazione reale, verrebbe mostrata una tabella con i dati.\n\nA1: Valore 1\nB1: Valore 2\nA2: 42\nB2: 73`;
            break;
          case 'txt':
            content = `Contenuto del file di testo: ${file.name}\n\nQuesto è il contenuto effettivo del file di testo.`;
            break;
          default:
            content = `Il contenuto di questo tipo di file (${extension}) non può essere visualizzato direttamente.`;
        }

        resolve(content);
      }, 500);
    });
  };

  // Carica i messaggi della chat attiva
  useEffect(() => {
    const activeChat = chats.find(chat => chat.id === activeChatId);
    if (activeChat && activeChat.messages) {
      setMessages(activeChat.messages);
    } else {
      setMessages([]);
    }
  }, [activeChatId, chats]);

  // Salva le chat nel localStorage quando cambiano
  useEffect(() => {
    localStorage.setItem('inquiro-chats', JSON.stringify(chats));
  }, [chats]);

  // Salva i file nel localStorage quando cambiano
  useEffect(() => {
    localStorage.setItem('inquiro-files', JSON.stringify(uploadedFiles));
  }, [uploadedFiles]);

  // Connessione WebSocket per i log
  useEffect(() => {
    try {
      const ws = new WebSocket(`ws://${window.location.host}/ws/log`);

      ws.onopen = () => {
        console.log('WebSocket connesso');
      };

      ws.onmessage = (event) => {
        console.log('Messaggio ricevuto:', event.data);

        // Aggiorna i messaggi della chat attiva
        const newMessage = { sender: 'bot', text: event.data };

        // Aggiorna sia lo stato locale che lo stato globale delle chat
        setMessages(prev => [...prev, newMessage]);

        setChats(prevChats => {
          return prevChats.map(chat => {
            if (chat.id === activeChatId) {
              return {
                ...chat,
                messages: [...(chat.messages || []), newMessage]
              };
            }
            return chat;
          });
        });
      };

      ws.onclose = () => {
        console.log('WebSocket disconnesso');
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Errore nella connessione WebSocket:', error);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [activeChatId]);

  // Scorrimento automatico ai messaggi più recenti
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Esempi di documenti trovati (simulati)
  const mockDocuments = [
    { id: 'doc1', name: 'Contratto_2023.pdf', match: 92, type: 'PDF', content: 'Contenuto del contratto 2023...' },
    { id: 'doc2', name: 'Preventivo_Cliente.xlsx', match: 85, type: 'Excel', content: 'Contenuto del preventivo cliente...' },
    { id: 'doc3', name: 'Relazione_Progetto.docx', match: 78, type: 'Word', content: 'Contenuto della relazione progetto...' },
    { id: 'doc4', name: 'Presentazione_Q4.pptx', match: 73, type: 'PowerPoint', content: 'Contenuto della presentazione Q4...' }
  ];

  // Funzione per aprire un file
  const openFile = (file) => {
    console.log('Apertura file:', file);
    setSelectedFile(file);
  };

  // Funzione per chiudere il visualizzatore di file
  const closeFileViewer = () => {
    setSelectedFile(null);
  };

  // Funzione per inviare un messaggio
  const sendMessage = () => {
    if (inputText.trim() === '') return;

    // Crea il messaggio dell'utente
    const userMessage = { sender: 'user', text: inputText };

    // Aggiorna i messaggi nella vista corrente
    setMessages(prev => [...prev, userMessage]);

    // Aggiorna i messaggi nella chat salvata
    setChats(prevChats => {
      return prevChats.map(chat => {
        if (chat.id === activeChatId) {
          return {
            ...chat,
            messages: [...(chat.messages || []), userMessage]
          };
        }
        return chat;
      });
    });

    // Inviamo la query al backend
    fetch('/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: inputText,
        toggle: toggleMode
      })
    }).catch(err => {
      console.error('Errore nell\'invio della query:', err);
    });

    // Simuliamo una risposta con risultati di ricerca
    setTimeout(() => {
      const botMessage = {
        sender: 'bot',
        text: `Ho trovato ${mockDocuments.length} documenti che corrispondono alla tua richiesta:`,
        documents: mockDocuments
      };

      // Aggiorna sia lo stato locale che lo stato globale delle chat
      setMessages(prev => [...prev, botMessage]);

      setChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.id === activeChatId) {
            return {
              ...chat,
              messages: [...(chat.messages || []), botMessage]
            };
          }
          return chat;
        });
      });

      // Aggiorna anche i documenti caricati
      setUploadedFiles(prev => {
        // Aggiungi solo i documenti che non sono già presenti
        const newDocs = mockDocuments.filter(doc =>
          !prev.some(existingDoc => existingDoc.id === doc.id)
        );
        return [...prev, ...newDocs];
      });

      // Assicurati che il pannello dei documenti sia visibile
      setShowFilePanel(true);
    }, 1000);

    setInputText('');
  };

  // Gestione invio con tasto Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Crea una nuova chat temporanea
  const createNewChat = () => {
    const newChatId = Date.now(); // Usa timestamp per ID unico
    const newChat = {
      id: newChatId,
      name: `Chat ${chats.length + 1}`,
      active: true,
      messages: []
    };

    // Disattiva tutte le chat esistenti e aggiungi la nuova
    setChats(prevChats => [
      ...prevChats.map(chat => ({...chat, active: false})),
      newChat
    ]);

    // Imposta la nuova chat come attiva
    setActiveChatId(newChatId);
    setMessages([]);
  };

  // Chiudi chat temporanea
  const closeChat = (id) => {
    if (chats.length === 1) return; // Mantieni almeno una chat

    const updatedChats = chats.filter(chat => chat.id !== id);

    // Se la chat che stiamo eliminando è quella attiva,
    // attiva l'ultima chat nella lista
    if (id === activeChatId) {
      const lastChatId = updatedChats[updatedChats.length - 1].id;

      setChats(updatedChats.map(chat =>
        chat.id === lastChatId ? {...chat, active: true} : chat
      ));

      setActiveChatId(lastChatId);
    } else {
      setChats(updatedChats);
    }
  };

  // Funzione per simulare upload di file
  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const newFiles = Array.from(files).map((file, index) => ({
          id: `upload-${Date.now()}-${index}`,
          name: file.name,
          match: Math.floor(Math.random() * 30) + 70, // Match casuale tra 70-100%
          type: file.name.split('.').pop().toUpperCase(),
          content: `Contenuto del file ${file.name}...`
        }));

        setUploadedFiles(prev => [...prev, ...newFiles]);

        // Assicurati che il pannello dei documenti sia visibile
        setShowFilePanel(true);
      }
    };
    input.click();
  };

  // Visualizzatore di file con supporto per PDF integrato
  const FileViewer = ({ file, onClose }) => {
    const [fileContent, setFileContent] = useState('Caricamento contenuto...');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      // Carica il contenuto del file quando il componente viene montato
      const loadContent = async () => {
        try {
          const content = await readFileContent(file);
          setFileContent(content);
        } catch (error) {
          setFileContent(`Errore nel caricamento del file: ${error.message}`);
        } finally {
          setIsLoading(false);
        }
      };

      loadContent();
    }, [file]);

    if (!file) return null;

    const getFileExtension = (filename) => {
      return filename.split('.').pop().toUpperCase();
    };

    const getFileTypeColor = (extension) => {
      const colors = {
        'PDF': 'bg-red-500',
        'DOCX': 'bg-blue-500',
        'DOC': 'bg-blue-500',
        'XLSX': 'bg-green-500',
        'XLS': 'bg-green-500',
        'PPTX': 'bg-orange-500',
        'PPT': 'bg-orange-500',
        'TXT': 'bg-gray-500',
        'JPG': 'bg-purple-500',
        'JPEG': 'bg-purple-500',
        'PNG': 'bg-purple-500'
      };
      return colors[extension] || 'bg-gray-500';
    };

    const extension = getFileExtension(file.name);
    const typeColorClass = getFileTypeColor(extension);

    // Determina se il file è un PDF
    const isPdf = extension === 'PDF';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] mx-4 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <div className={`${typeColorClass} text-white text-xs uppercase font-bold px-2 py-1 rounded mr-3`}>
                {extension}
              </div>
              <h2 className="text-xl font-semibold text-gray-800">{file.name}</h2>
            </div>
            <button onClick={onClose} className="p-2 text-gray-600 hover:text-red-500">
              <img
                src="https://cdn-icons-png.flaticon.com/512/59/59836.png"
                alt="Close"
                style={{ width: '20px', height: '20px' }}
              />
            </button>
          </div>
          <div className="p-6 flex-1 overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : isPdf ? (
              // Visualizzatore PDF
              <div className="h-[70vh] w-full flex flex-col items-center">
                <div className="text-center text-gray-800 mb-4">
                  <p className="font-semibold">Visualizzazione PDF: {file.name}</p>
                </div>
                <div className="w-full bg-gray-100 border border-gray-300 rounded flex-1 p-4 flex flex-col items-center justify-center">
                  <div className="w-2/3 bg-white rounded shadow-lg p-6 mb-6">
                    <div className="border-b border-gray-200 pb-3 mb-3 flex justify-between items-center">
                      <p className="text-red-500 font-semibold">Documento PDF</p>
                      <p className="text-sm text-gray-500">Pagina 1 di 3</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-300 rounded w-full"></div>
                      <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                      <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                      <div className="h-3 bg-gray-300 rounded w-full"></div>
                      <div className="h-3 bg-gray-300 rounded w-4/5"></div>
                    </div>
                  </div>
                  <p className="text-center text-gray-600">
                    {file.name} - Documento PDF
                  </p>
                  <p className="text-center text-sm text-gray-500 mt-2">
                    Il contenuto è stato pre-renderizzato per visualizzazione rapida
                  </p>
                </div>
              </div>
            ) : (
              <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded border border-gray-300 font-mono text-sm text-gray-800 max-h-[500px] overflow-y-auto">
                {fileContent}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Renderizzazione dell'UI per un documento
  const DocumentItem = ({ doc, onClick }) => {
    const progressWidth = doc.match + "%";

    return (
      <div
        key={doc.id}
        className="flex bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 cursor-pointer"
        onClick={() => onClick(doc)}
      >
        <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center mr-3">
          <Icon name={getFileIcon(doc.name)} size={20} />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-sm truncate">{doc.name}</h4>
          <div className="flex items-center mt-1">
            <div className="h-1.5 w-24 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{width: progressWidth}}
              ></div>
            </div>
            <span className="text-xs text-gray-500 ml-2">Match: {doc.match}%</span>
          </div>
        </div>
        <button
          className="ml-2 text-gray-400 hover:text-blue-500"
          onClick={(e) => {
            e.stopPropagation();
            // Download del file
            console.log('Download del file:', doc.name);
          }}
        >
          <Icon name="download" size={16} />
        </button>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Visualizzatore di file (se un file è selezionato) */}
      {selectedFile &&
        <FileViewer file={selectedFile} onClose={closeFileViewer} />
      }

      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800">Inquiro</h1>
        </div>

        {/* Lista chat */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-medium text-gray-600">CHAT</h2>
            <button
              onClick={createNewChat}
              className="text-blue-600 hover:text-blue-800"
            >
              <Icon name="plus" size={16} />
            </button>
          </div>

          {chats.map(chat => (
            <div
              key={chat.id}
              className={`flex items-center justify-between p-2 mb-1 rounded cursor-pointer ${chat.active ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
              onClick={() => {
                // Attiva questa chat e disattiva tutte le altre
                setChats(chats.map(c => ({...c, active: c.id === chat.id})));
                setActiveChatId(chat.id);
              }}
            >
              <div className="flex items-center">
                <Icon name="chat" size={16} className="mr-2" />
                <span className="text-sm">{chat.name}</span>
              </div>
              {chats.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeChat(chat.id);
                  }}
                  className="opacity-50 hover:opacity-100"
                >
                  <Icon name="close" size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Controlli sidebar - Documenti caricati */}
        <div className="p-3 border-t border-gray-200">
          <button
            className={`flex items-center justify-between w-full p-2 text-sm rounded ${
              showFilePanel ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setShowFilePanel(!showFilePanel)}
          >
            <div className="flex items-center">
              <Icon name="folder" size={16} className="mr-2" />
              <span>Documenti caricati</span>
            </div>
            <Icon name="chevronDown" size={16} className={`${showFilePanel ? 'transform rotate-180' : ''}`} />
          </button>

          {/* Lista documenti espandibile */}
          {showFilePanel && (
            <div className="mt-2 ml-4">
              {uploadedFiles.length > 0 ? (
                <div className="space-y-1">
                  {uploadedFiles.map(file => (
                    <div
                      key={file.id}
                      className="flex items-center py-1 px-2 text-sm rounded hover:bg-gray-100 cursor-pointer group"
                      onClick={() => openFile(file)}
                    >
                      <Icon name={getFileIcon(file.name)} size={14} className="mr-2" />
                      <span className="truncate flex-1">{file.name}</span>
                      <button
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Rimuovi il file dalla lista
                          setUploadedFiles(prev => prev.filter(f => f.id !== file.id));
                        }}
                      >
                        <Icon name="trash" size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-500 py-1 px-2">
                  Nessun documento caricato
                </div>
              )}

              <button
                onClick={handleFileUpload}
                className="mt-2 flex items-center w-full justify-center py-1 px-2 text-xs border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
              >
                <Icon name="upload" size={12} className="mr-1" />
                Carica documenti
              </button>
            </div>
          )}

          <button className="flex items-center w-full p-2 text-sm text-gray-700 hover:bg-gray-100 rounded mt-1">
            <Icon name="settings" size={16} className="mr-2" />
            <span>Impostazioni</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Area chat */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              {/* Cerchio con lente di ingrandimento */}
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#60a5fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <img
                  src="https://cdn-icons-png.flaticon.com/512/149/149852.png"
                  alt="search"
                  style={{
                    width: '40px',
                    height: '40px'
                  }}
                />
              </div>
              <h2 className="text-xl font-medium text-gray-800 mb-2">Benvenuto in Inquiro</h2>
              <p className="text-gray-500 max-w-md">
                Descrivi il documento che stai cercando e ti aiuterò a trovarlo nel modo più veloce possibile.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message, idx) => (
                <div key={idx} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-3xl rounded-lg p-4 ${
                    message.sender === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p>{message.text}</p>

                    {/* Display document results */}
                    {message.documents && (
                      <div className="mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                          {message.documents.map(doc => (
                            <DocumentItem key={doc.id} doc={doc} onClick={openFile} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-gray-200 p-4 bg-white">
          {/* Advanced search controls (optional) */}
          {showAdvancedSearch && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Tipo documento</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm">
                    <option value="">Tutti i tipi</option>
                    <option value="pdf">PDF</option>
                    <option value="doc">Word</option>
                    <option value="xls">Excel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Data</label>
              <label className="block text-xs text-gray-500 mb-1">Data</label>
                 <select className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm">
                   <option value="">Qualsiasi data</option>
                   <option value="today">Oggi</option>
                   <option value="week">Ultima settimana</option>
                   <option value="month">Ultimo mese</option>
                 </select>
               </div>
               <div>
                 <label className="block text-xs text-gray-500 mb-1">Ordinamento</label>
                 <select className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm">
                   <option value="relevance">Rilevanza</option>
                   <option value="date">Data di modifica</option>
                   <option value="name">Nome file</option>
                 </select>
               </div>
             </div>
           </div>
         )}

         <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300">
           {/* Input principale */}
           <textarea
             value={inputText}
             onChange={(e) => setInputText(e.target.value)}
             onKeyDown={handleKeyPress}
             className="flex-1 py-3 px-4 bg-transparent outline-none resize-none text-gray-700"
             placeholder="Descrivi il documento che stai cercando..."
             rows={1}
             style={{maxHeight: '120px'}}
           />

           {/* Pulsanti azione */}
           <div className="flex items-center pr-2">
             <button
               onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
               className="p-2 text-gray-500 hover:text-blue-500"
               title="Ricerca avanzata"
             >
               <img
                 src="https://cdn-icons-png.flaticon.com/512/32/32195.png"
                 alt="Chevron Down"
                 style={{
                   width: '24px',
                   height: '24px',
                   transform: showAdvancedSearch ? 'rotate(180deg)' : 'none',
                   transition: 'transform 0.2s'
                 }}
               />
             </button>

             <button
               onClick={() => setToggleMode(!toggleMode)}
               className={`p-2 ${toggleMode ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
               title="Modalità ricerca avanzata (AI)"
             >
               <img
                 src="https://cdn-icons-png.flaticon.com/512/18140/18140141.png"
                 alt="AI Search"
                 style={{
                   width: '24px',
                   height: '24px'
                 }}
               />
             </button>

             <button
               onClick={handleFileUpload}
               className="p-2 text-gray-500 hover:text-blue-500"
               title="Carica documento"
             >
               <img
                 src="https://cdn-icons-png.flaticon.com/512/568/568717.png"
                 alt="Upload"
                 style={{
                   width: '24px',
                   height: '24px'
                 }}
               />
             </button>

             <button
               onClick={sendMessage}
               className="ml-1 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
               title="Invia"
             >
               <img
                 src="https://cdn-icons-png.flaticon.com/512/149/149852.png"
                 alt="Search"
                 style={{
                   width: '24px',
                   height: '24px'
                 }}
               />
             </button>
           </div>
         </div>
       </div>
     </div>
   </div>
 );
};

// Renderizziamo l'app React nel div root
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<InquiroApp />);