(()=>{
    const button = document.getElementById('fzj.xg.test.testbutton')
    
    button.addEventListener('click',()=>{
        console.log('test2345') 
    })

    const viewerMousePositionSubscriber = window.nehubaViewer.mousePosition.inRealSpace
        .subscribe(function(ev){
            if(ev){
                button.innerHTML = ev.map(el=>Math.round(el/1000)).join(' ')
            }else{
                button.innerHTML = 'null'
            }
            // button.innerHTML = ev?ev.join(' '):'null')
        })

    const shutdownHandler = window.pluginControl
        .filter(evPk=>evPk.target=='AFFLIATION.AUTHOR.PACKAGE'&&evPk.body.shutdown)
        .subscribe(evPk=>{
              /* shutdown sequence */
              shutdownHandler.unsubscribe()
        })
    
})()