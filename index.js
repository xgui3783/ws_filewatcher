const WebSocketServer = require('ws').Server
const wss = new WebSocketServer({port:5080})
const fs = require('fs')

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

    fs.watch(
        'data', /* watch data folder */
        {persistent:true,recursive:false,encoding:'utf8'},
        (ev,fn)=>{
            if(ev!=='change') return
            readFile('data/'+fn)
                .then(data=>ws.send(JSON.stringify({event:ev,filename:fn,data:data}),err=>{
                    if(err){
                        console.log('ws.sendmessage error',err)
                    }
                }))
                .catch(e=>{
                    console.log('readfile error',e)
                })
        })

    const readFile = (path)=> new Promise((resolve,reject) =>{
        fs.readFile(path,'utf8',(err,data)=>{
            if(err){
                console.log('reading file error ...', err)
                reject(err)
            }else{
                resolve(data)
            }
        })
    })
})