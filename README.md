# WS File Watcher
A lean node.js app that monitors for changes of files, and sends the changed file via websocket. 

## Getting Started

### Prerequesities
node 8.9.3 (could work with earlier version, but untested)

### Installing
```
git clone https://github.com/xgui3783/ws_filewatcher
```

```
cd ws_filewatcher
```

```
npm i
```

### Running 

```
npm start
```

By default, *ws_filewatcher* listens to a websocket connection at port *5080*. 

A sample code that utilises ws_filewatcher may look like the following:

```javascript
const ws = new WebSocket('ws://localhost:5080')

ws.onerror = (e) => {
  console.log('error connecting to websocket')
}

ws.onclose = (ev) => {
  console.log('web socket connection closed')
}

ws.onopen = (ev) => {
  console.log('web socket connection opened')

  ws.onmessage = (ev) => {
    try{
      const json = JSON.stringify(ev)
      console.log(json.event) //'on connection' || 'change'

      console.log(json.mimetype)
      console.log(json.filename)
      console.log(json.data)
      /* mime types that contains words such as text, javascript and json will be encoded in utf-8, mimetypes that include the word image will be encoded as base64 */
    }catch(e){
      console.log('parsing ev error')
    }
  }
}

```

## License
MIT
