(()=>{

  /* components like this are reusable. */
  class HoverRegionSelectorComponent extends HTMLElement{

    constructor(){
      super()

      this.template = 
      `
      <div class = "input-group">
        <input class = "form-control" placeholder = "" readonly = "readonly" type = "text" region>
        <span class = "input-group-btn">
          <div class = "btn btn-default" id = "fzj.xg.factory.edit">
            <span class = "glyphicon glyphicon-edit"></span>
          </div>
        </span>
      </div>
      `
      this.listening = true
      this.selectedRegion = null
      this.shutdownHooks = []
    }

    connectNehubaHooks(){
      const mouseOverNehuba = window.viewerHandle.mouseOverNehuba
        .filter(()=>this.listening)
        .subscribe(ev=>{
          this.selectedRegion = ev.foundRegion
          this.render()
        })

      this.shutdownHooks.push(()=>mouseOverNehuba.unsubscribe())
    }

    disconnectedCallback(){
      this.shutdownHooks.forEach(fn=>fn())
    }

    connectedCallback(){
      // const shadowRoot = this.attachShadow({mode:'open'})
      this.rootChild = document.createElement('div')
      this.appendChild( this.rootChild )
      this.connectNehubaHooks()
      this.render()
    }

    render(){
      this.rootChild.innerHTML = this.template
      this.rootChild.querySelector('input[region]').value = this.selectedRegion ? this.selectedRegion.name : '' 
    }
  }
  customElements.define('hover-region-selector-card', HoverRegionSelectorComponent)

  /* reusable pill components */
  class DismissablePill extends HTMLElement{
    constructor(){
      super()
      this.name = ''
      this.template = ``
    }

    render(){
      this.template = 
      `
      <span class = "label label-default">
        <span pillName>${this.name}</span>
        <span class = "glyphicon glyphicon-remove" pillRemove></span>
      </span>
      `
    }

    connectedCallback(){
      // const shadowRoot = this.attachShadow({mode:'open'})
      this.render()
      this.innerHTML = this.template
      const removePill = this.querySelector('span[pillRemove]')
      removePill.addEventListener('click',()=>{
        this.onRemove(this.name)
        this.remove()
      })
    }

    onRemove(name){}
  }
  customElements.define('dismissable-pill-card',DismissablePill)

  class WebJuGExGeneComponent extends HTMLElement{
    constructor(){
      super()

      this.selectedGenes = []
      this.arrDict = []
      this.autocompleteSuggestions = []
      this.template = 
      `
      <div class = "input-group">
        <input geneInputBox type = "text" class = "form-control" placeholder = "Enter gene of interest ... ">
        <span class = "input-group-btn">
          <div geneAdd class = "btn btn-default" title = "Add a gene">Add</div>
          <div geneImport class = "btn btn-default" title = "Import a CSV file">Import</div>
          <div geneExport class = "btn btn-default" title = "Export selected genes into a csv file">Export</div>
        </span>
      </div>
      `
    }

    connectedCallback(){
      // const shadowRoot = this.attachShadow({mode:'open'})
      this.rootChild = document.createElement('div')
      this.rootChild.innerHTML = this.template
      this.appendChild(this.rootChild)

      this.config()
      this.init()
    }

    config(){
      this.MINCHAR = 3
      this.URLBASE = 'http://172.104.156.15:8003/'
    }

    init(){
      this.elGeneInputBox = this.rootChild.querySelector('input[geneInputBox]')
      this.elGeneAdd = this.rootChild.querySelector('div[geneAdd]')
      this.elGeneImport = this.rootChild.querySelector('div[geneImport]')
      this.elGeneExport = this.rootChild.querySelector('div[geneExport]')

      this.elGeneAdd.addEventListener('click',()=>{
        if(this.autocompleteSuggestions.length > 0 && this.elGeneInputBox.value.length >= this.MINCHAR)
          this.addGene(this.autocompleteSuggestions[0])
      })

      this.elGeneInputBox.addEventListener('dragenter',(ev)=>{
        this.elGeneInputBox.setAttribute('placeholder','Drop file here to be uploaded')
      })

      this.elGeneInputBox.addEventListener('dragleave',(ev)=>{
        this.elGeneInputBox.setAttribute('placeholder','Enter gene of interest ... ')
      })

      this.elGeneInputBox.addEventListener('drop',(ev)=>{
        ev.preventDefault()
        ev.stopPropagation()
        ev.stopImmediatePropagation()
        this.elGeneInputBox.setAttribute('placeholder','Enter gene of interest ... ')
        //ev.dataTransfer.files[0]
      })

      this.elGeneInputBox.addEventListener('dragover',(ev)=>{
        ev.preventDefault()
        ev.stopPropagation()
        ev.stopImmediatePropagation()
      })

      this.elGeneInputBox.addEventListener('keydown',(ev)=>{
        ev.stopPropagation()
        ev.stopImmediatePropagation()
        if(ev.key=='Enter') this.elGeneAdd.click()
      })

      this.loadExternalResources()
      fetch(this.URLBASE).then(txt=>txt.json())
        .then(json=>{
          this.arrDict = json
        })
        .catch(err=>{
          console.log('failed to fetch full list of genes... using limited list of genes instead ...',e)
          this.arrDict = ["ADRA2A", "AVPR1B", "CHRM2", "CNR1", "CREB1", "CRH", "CRHR1", "CRHR2", "GAD2", "HTR1A", "HTR1B", "HTR1D", "HTR2A", "HTR3A", "HTR5A", "MAOA", "PDE1A", "SLC6A2", "SLC6A4", "SST", "TAC1", "TPH1", "GPR50", "CUX2", "TPH2"]
        })
    }

    loadExternalResources(){
      this.autoCompleteCss = document.createElement('link')
      this.autoCompleteCss.type = 'text/css'
      this.autoCompleteCss.rel = 'stylesheet'
      this.autoCompleteCss.href = 'http://172.104.156.15/cors/css/js-autocomplete.min'

      this.autoCompleteJs = document.createElement('script')
      this.autoCompleteJs.onload = () =>{
        /* append autocomplete here */
        this.autocompleteInput = new autoComplete({
          selector : this.elGeneInputBox,
          delay : 0,
          minChars : this.MINCHAR,
          cache : false,
          source : (term,suggest)=>{
            const searchTerm = new RegExp('^'+term,'gi')
            this.autocompleteSuggestions = this.arrDict.filter(dict=>searchTerm.test(dict))
            suggest(this.autocompleteSuggestions)
          },
          onSelect : (e,term,item)=>{
            this.addGene(term)
          }
        })
      }
      this.autoCompleteJs.src = 'http://172.104.156.15/cors/js/js-autocomplete.min'

      document.head.appendChild(this.autoCompleteJs)
      document.head.appendChild(this.autoCompleteCss)
    }

    addGene(gene){
      const pill = document.createElement('dismissable-pill-card')
      pill.onRemove = (name) =>
        this.selectedGenes.splice(this.selectedGenes.indexOf(name),1)
      pill.name = gene
      this.rootChild.appendChild(pill)
      this.selectedGenes.push(gene)
      this.elGeneInputBox.value = ''
      this.elGeneInputBox.blur()
      this.elGeneInputBox.focus()
    }
  }
  customElements.define('fzj-xg-webjugex-gene-card',WebJuGExGeneComponent)

  class WebJuGExSearchComponent extends HTMLElement{
    constructor(){
      super()
      this.template = `
      <div class = "row">
        <div class = "col-md-12">
          Please selecte two regions of interest, and at least two genes :
        </div>
        <div class = "col-md-12">
          <hover-region-selector-card area1></hover-region-selector-card>
        </div>
        <div class = "col-md-12">
          <hover-region-selector-card area2></hover-region-selector-card>
        </div>
        <div class = "col-md-12">
          <div class = "input-group">
            <span class = "input-group-addon">
              Threshold
            </span>
            <input value = "0.20" class = "form-control" type = "range" min = "0" max = "1" step = "0.01" threshold>
            <span class = "input-group-addon" thresholdValue>
              0.20
            </span>
          </div>
        </div>
      </div>
      <div class = "row">
        <div class = "col-md-12">
          <fzj-xg-webjugex-gene-card>
          </fzj-xg-webjugex-gene-card>
        </div>
      </div>
      <div class = "row">
        <div class = "col-md-12">
          <div class = "btn btn-default btn-block" analysisSubmit>
            Start differential analysis
          </div>
        </div>
      </div>
      `
      this.mouseEventSubscription = this.rootChild = this.threshold = this.elArea1 = this.elArea2 = null
      this.selectedGenes = []
    }

    connectedCallback(){
      // const shadowRoot = this.attachShadow({mode:'open'})
      this.rootChild = document.createElement('div')
      this.rootChild.innerHTML = this.template
      this.appendChild(this.rootChild)
      
      /* init */
      this.init()

      /* attach click listeners */
      this.onViewerClick()

    }

    init(){
      this.elArea1 = this.rootChild.querySelector('hover-region-selector-card[area1]')
      this.elArea2 = this.rootChild.querySelector('hover-region-selector-card[area2]')
      this.elArea1.listening = true
      this.elArea2.listening = false

      this.elGenesInput = this.rootChild.querySelector('fzj-xg-webjugex-gene-card')

      this.elAnalysisSubmit = this.rootChild.querySelector('div[analysisSubmit]')
      this.elAnalysisSubmit.addEventListener('click',()=>{
        this.analysisGo()
      })

      this.elArea1.addEventListener('click',()=>{
        this.elArea2.listening = false
        this.elArea1.listening = true
        this.elArea1.selectedRegion = null
        this.elArea1.render()
      })

      this.elArea2.addEventListener('click',()=>{
        this.elArea1.listening = false
        this.elArea2.listening = true
        this.elArea2.selectedRegion = null
        this.elArea2.render()
      })
      
      this.elThreshold = this.rootChild.querySelector('input[threshold]')
      const elThresholdValue = this.rootChild.querySelector('span[thresholdValue]')
      this.elThreshold.addEventListener('input',(ev)=>{
        elThresholdValue.innerHTML = parseFloat(this.elThreshold.value).toFixed(2)
      })
    }

    onViewerClick(){
      this.mouseEventSubscription = window.viewerHandle.mouseEvent
        .filter(ev=>ev.eventName=='click').subscribe(ev=>{
          if(this.elArea2.listening == true ){
            this.elArea2.listening = false
          }
          if(this.elArea1.listening == true) {
            this.elArea1.listening = false
            this.elArea2.listening = true
          }
        })
    }

    analysisGo(){
      /* test for submit conditions */
      
      this.sendAnalysis({
        area1 : this.elArea1.selectedRegion,
        area2 : this.elArea2.selectedRegion,
        threshold : this.elThreshold.value,
        selectedGenes : this.elGenesInput.selectedGenes
      })
    }

    sendAnalysis(analysisInfo){
      /* to be overwritten by parent class */
    }
  }
  customElements.define('fzj-xg-webjugex-search-card',WebJuGExSearchComponent)

  /* custom class for analysis-card */
  class WebJuGExAnalysisComponent extends HTMLElement{
    constructor(){
      super()

      this.template = ``
      this.analysisObj = {}
      this.status = 'pending'
    }
    
    connectedCallback(){
      // const shadowRoot = this.attachShadow({mode:'open'})
      this.childRoot = document.createElement('div')
      this.appendChild(this.childRoot)
      this.render()
    }

    render(){
      
      this.template = 
        `
        <div class = "panel panel-default">
          <div class = "btn btn-default btn-block panel-heading" panelHeader>
            ${this.analysisObj.area1.name} & ${this.analysisObj.area2.name}
          </div>
          <div class = "panel-body hidden" panelBody>
          </div>
          <div class = "panel-footer hidden" panelFooter>
          </div>
        </div>
        `
        this.childRoot.innerHTML = this.template
    }
  }
  customElements.define('fzj-xg-webjugex-analysis-card',WebJuGExAnalysisComponent)

  const searchCard = document.querySelector('fzj-xg-webjugex-search-card')
  const container = document.getElementById('fzj.xg.webjugex.container')
  searchCard.sendAnalysis = (analysisInfo) => {
    const analysisCard = document.createElement('fzj-xg-webjugex-analysis-card')
    analysisCard.analysisObj = analysisInfo
    container.appendChild(analysisCard)
  };

  setTimeout(()=>{

    const img = new Image()
    img.onload = () =>{
      console.log('onload')
      container.appendChild(img)
    }
    // img.src = 'data:image/png;base64, '+window['bigbrainURL']
    img.src = sessionStorage.getItem('bigbrain.PNG')
  },500)
})()