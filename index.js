const WebSocketServer = require('ws').Server
const wss = new WebSocketServer({port:5080})
const chokidar = require('chokidar')
const fs = require('fs')
const mime = require('mime-types')

wss.on('connection',(ws)=>{

    fs.readdir('data',(err,files)=>{
        if(err){
            console.log('fs.readdir err',err)
            return
        }
        files.forEach(file=>{
            readFile('data/'+file)
                .then(data=>ws.send(JSON.stringify({event:'on connection',filename:file,data:data}),err=>{
                    if(err){
                        console.log('ws.sendmessage error',err)
                    }
                }))
                .catch(e=>{
                    console.log('readfile error',e)
                })
        })
    })
    const watcher = chokidar.watch('data',{persistent:true})

    watcher.on('change',(path,stat)=>{
        readFile(path)
            .then(data=>ws.send(JSON.stringify({event:'change',filename:path.replace(/data\\|data\//,''),mimetype : mime.lookup(path),data:data}),err=>{
                if(err){
                    console.log('ws.sendmessage error',err)
                }
            }))
            .catch(e=>{
                console.log('readfile error',e)
            })
    })

    const readFile = (path)=> new Promise((resolve,reject) =>{
        const mimetype = mime.lookup(path)
        if(/text|javascript|json/.test(mimetype)){
            fs.readFile(path,'utf-8',(err,data)=>{
                if(err){
                    console.log('reading file error ...', err)
                    reject(err)
                }else{
                    resolve(data)
                }
            })
        }else if(/image/.test(mimetype)){
            fs.readFile(path,(err,data)=>{
                if(err){
                    console.log('reading file error...',err)
                    reject(err)
                }else{
                    resolve((new Buffer(data)).toString('base64'))
                }
            })
        }else{
            /* what other kind of mime types are there? */
            fs.readFile(path,(err,data)=>{
                if(err){
                    console.log('reading file error...',err)
                    reject(err)
                }else{
                    resolve((new Buffer(data)).toString('base64'))
                }
            })
        }
    })
})