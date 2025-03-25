import { Jdm } from "../libraries/jdm/1.0.0/js/jdm.js";
import { TooEasyRialService } from "./tooEasyRial.service";
import "./tooEasyRial.scss";

/**
 * Sistema per la generazione automatica di tutorial basati su un file di configurazione JSON.
 * @example
 * // Esempio di inizializzazione ES6
 * <script type="module">
 *     import {TooEasyRial} from "../dist/tooEasyRial.js";
 *     new TooEasyRial(document.body, './example.json');
 * </script>
 */
export class TooEasyRial {
    /**
     * Crea un'istanza di TooEasyRial.
     *
     * @constructor
     * @param {HTMLElement|string} container - L'elemento HTML o il selettore CSS del contenitore principale del tutorial.
     * @param {string} endpoint - L'URL dell'endpoint da cui recuperare i dati del tutorial.
     */
    constructor(container, endpoint) {
        this.service = new TooEasyRialService();
        this.container = new Jdm(container);
        this.endpoint = endpoint;
        this.counter = 0;
        this.playing = false;
        this.autoplayTimer = null;
        this.lang = "it";

        /**
         * Assicura che il metodo keydown mantenga il contesto corretto.
         * @type {Function}
         */
        this.keydown = this.keydown.bind(this);

        // Inizializza il tutorial e genera l'evento di inizializzazione
        this.init().then(() => {
            this.genEvent("onTutorialInit", this, this.container);
        });

        // Registra gli eventi necessari
        this.events();
    }
    /**
     * Inizializza il tutorial caricando i dati da un endpoint specifico e generando gli elementi necessari.
     *
     * Questo metodo:
     * 1. Recupera i dati dal servizio specificato tramite l'endpoint configurato.
     * 2. Estrae la lista dei passi del tutorial.
     * 3. Se la lista contiene almeno un elemento, procede con la generazione degli elementi DOM e SVG necessari.
     *
     * @async
     * @function init
     * @returns {Promise<void>} Non restituisce un valore, ma aggiorna le proprietà dell'istanza.
     *
     * @throws {Error} Se il recupero dei dati dal servizio fallisce.
     *
     * @private
     */

    async init() {
        this.data = await this.service.getData(this.endpoint);
        this.stepList = this.data.list;

        if (this.stepList?.length > 0) {
            this.genDom();
            this.genSvg();
        }
    }

    /**
     * Imposta la lingua del tutorial.
     *
     * Questo metodo consente di cambiare la lingua del tutorial in base al parametro fornito.
     * La lingua sarà utilizzata per localizzare il contenuto, i messaggi e le interazioni del tutorial.
     * Di default viene impostata la lingua 'IT'
     *
     * @function language
     * @param {string} lang - Il codice della lingua da impostare, ad esempio "it" per l'italiano o "en" per l'inglese.
     * @returns {TooEasyRial} L'istanza corrente per il chaining dei metodi.
     *
     * @example
     * const tutorial = new TooEasyRial("#container", "https://api.example.com/tutorial.json").language("en");
     */
    language(lang) {
        this.lang = lang;
        return this;
    }

    /**
     * Genera e aggiunge dinamicamente il DOM necessario per il tutorial.
     *
     * Questo metodo crea una struttura HTML per il tutorial e la inserisce nel contenitore specificato.
     * In particolare, vengono creati i seguenti elementi:
     * - Un contenitore principale per il tutorial
     * - Un pulsante di chiusura
     * - Un'area per le notifiche
     *
     * Inoltre, vengono gestiti gli eventi, come la chiusura del tutorial al clic del pulsante.
     *
     * @function genDom
     * @returns {void} Non restituisce un valore, ma modifica direttamente il DOM.
     *
     * @private
     */
    genDom() {
        //language=html
        const domString = `
			<div id="tutorialContainer" class="fadeIn">
				<div id="buttonTopContainer">
					<i id="close" class="fas fa-times fa-fw fa-2x handCursor textShadow" data-name="close"></i>
				</div>
                <div id="notificationCenter" data-name="notificationCenter"></div>
			</div>
		`;
        this.tutorialContainer = new Jdm(domString, this.container, null, true).jdm_extendChildNode().jdm_removeClassList("hide");

        this.tutorialContainer.close.jdm_onClick(() => {
            this.destroy();
        });
    }

    /**
     * Crea e aggiunge dinamicamente il navigatore per il tutorial, inclusi i pulsanti di controllo e la barra di progresso.
     *
     * Questo metodo genera i seguenti elementi:
     * - Un contenitore per il player del tutorial con i pulsanti di controllo:
     *   - Play / Stop
     *   - Passo indietro / Passo avanti
     *   - Un contatore che mostra il passo corrente e totale
     * - Una barra di progresso che indica lo stato del tutorial.
     *
     * Gestisce anche gli eventi per ciascun pulsante, come l'avvio, la fermata dell'autoplay e la navigazione tra i passi.
     *
     * @function genNavigator
     * @param {HTMLElement} container - Il contenitore HTML in cui aggiungere il navigatore del tutorial.
     * @returns {void} Non restituisce un valore, ma modifica direttamente il DOM.
     *
     * @private
     */
    genNavigator(container) {
        this.navigator?.jdm_destroy();
        //language=html
        const domString = `
            <div id="tutorialPlayerContainer" data-name="player">
                <div id="playerButtonContainer">
                    <i  class="element button fas fa-play fa-fw handCursor textShadow ${this.playing ? "d-none" : ""}" data-name="autoPlay"></i>
                    <i  class="element button fas fa-stop fa-fw handCursor textShadow ${this.playing ? "" : "d-none"}" data-name="stopAutoplay"></i>
                    <i class="element button fas fa-chevron-left fa-fw handCursor" data-name="stepBack"></i>
                    <i class="element button fas fa-chevron-right fa-fw handCursor" data-name="stepNext"></i>
                    <div id="counterContainer" class="element"  data-name="counterContainer"> 
						<span class="" data-name="currentStep">${this.counter + 1}</span> / ${this.stepList.length}</div>
                </div>
                <div id="progressBarContainer" data-name="progressBarContainer">
                    <div id="progressBarCursor" data-name="progressBarCursor"></div>
                </div>
            </div>
		`;

        this.navigator = new Jdm(domString, container, null, true).jdm_extendChildNode();

        this.navigator.autoPlay.jdm_onClick(() => {
            this.autoplay();
        });
        this.navigator.stopAutoplay.jdm_onClick(() => {
            this.stopAutoplay();
        });

        this.navigator.stepBack.jdm_onClick(() => {
            this.goToPrevStep();
            this.stopAutoplay();
        });

        this.navigator.stepNext.jdm_onClick(() => {
            this.goToNextStep();
            this.stopAutoplay();
        });
    }

    /**
     * Crea e aggiunge dinamicamente un elemento SVG per il tutorial, utilizzando le dimensioni del contenitore.
     *
     * Questo metodo crea un elemento SVG che occupa l'intera area del contenitore del tutorial.
     * Viene anche gestito un evento di clic sull'SVG, che avanza al passo successivo del tutorial.
     *
     * @function genSvg
     * @returns {void} Non restituisce un valore, ma modifica direttamente il DOM.
     *
     * @private
     */
    genSvg() {
        this.svg?.jdm_destroy();
        const containerBBox = this.container.getBoundingClientRect();
        //language=html
        const domString = `<svg id="tutorialSvg"  width="${containerBBox.width}" height="${containerBBox.height}"></svg>`;
        this.svg = new Jdm(domString, this.tutorialContainer, null, true).jdm_extendChildNode().jdm_onClick(e => {
            e.stopPropagation();
            e.preventDefault();
            this.goToNextStep();
        });
        this.goToStep(this.counter <= 0 ? 0 : this.counter, true);
    }

    /**
     * Crea e visualizza un "balloon" (bolla di testo) associato a un passo del tutorial.
     * La posizione e il contenuto della bolla dipendono dal passo specificato e dalle dimensioni del contenitore.
     *
     * Questo metodo posiziona la bolla dinamicamente in base alla posizione specificata nel passo,
     * tenendo conto delle dimensioni del contenitore e se il dispositivo è mobile o desktop.
     *
     * @function genBalloonStep
     * @param {Object} step - Il passo del tutorial che contiene le informazioni da visualizzare nella bolla.
     * @param {string} step.message - Il messaggio da visualizzare nel balloon. Può essere un oggetto con traduzioni per diverse lingue.
     * @param {string} step.position - La posizione della bolla (può essere "left", "right", "top", "bottom").
     * @param {number} x - La coordinata X in cui posizionare la bolla.
     * @param {number} y - La coordinata Y in cui posizionare la bolla.
     * @param {number} w - La larghezza del contenitore a cui il balloon è associato.
     * @param {number} h - L'altezza del contenitore a cui il balloon è associato.
     * @returns {void} Non restituisce un valore, ma modifica direttamente il DOM per mostrare la bolla del tutorial.
     *
     * @private
     */
    genBalloonStep(step, x, y, w, h) {
        this.balloon?.jdm_destroy();
        let position = this.isMobile() ? step.positionMobile : step.position;

        //language=html
        const domString = `
            <div class="balloon ${position} ${this.isMobile() ? "mobile" : "desktop"}" >
                <div style="font-family: ${this.data.fontFamily || '"Courier New", Courier, monospace'}">${step.message[this.lang] || step.message}</div>
				<div class="navigatorContainer" data-name="navigatorContainer"></div>
            </div>
		`;

        this.balloon = new Jdm(domString, this.tutorialContainer, null, true).jdm_extendChildNode();
        this.genNavigator(this.balloon.navigatorContainer);

        const bboxBalloon = this.balloon.getBoundingClientRect();

        switch (position) {
            case "left": {
                x = x - bboxBalloon.width - 32;
                y = y;
                this.balloon.jdm_setStyle("top", y + "px").jdm_setStyle("left", x + "px");
                break;
            }
            case "right": {
                x = x + w + 16;
                y = y;
                this.balloon.jdm_setStyle("top", y + "px").jdm_setStyle("left", x + "px");
                break;
            }
            case "bottom": {
                x = x;
                y = y + h + 16;
                this.balloon.jdm_setStyle("top", y + "px").jdm_setStyle("left", x + "px");
                break;
            }
            case "top": {
                x = x;
                y = y - bboxBalloon.height - 32;
                this.balloon.jdm_setStyle("top", y + "px").jdm_setStyle("left", x + "px");
                break;
            }
        }
    }
    /**
     * Ripristina la barra di progresso al suo stato iniziale.
     *
     * Questo metodo azzera la barra di progresso, rimuovendo qualsiasi transizione in corso e impostando la larghezza della barra al 0%.
     * Viene utilizzato per ripristinare la barra di progresso tra un passo e l'altro, o quando l'autoplay viene fermato.
     *
     * @function resetProgressBarCursor
     * @returns {void} Non restituisce un valore, ma ripristina lo stato della barra di progresso.
     *
     * @private
     */
    resetProgressBarCursor() {
        if (this.navigator?.progressBarCursor) {
            this.navigator.progressBarCursor.style.transition = "none";
            this.navigator.progressBarCursor.style.width = "0%";
        }
    }
    /**
     * Crea una maschera per evidenziare un elemento del tutorial.
     *
     * Questo metodo genera un path SVG che copre l'intera area del tutorial, escludendo l'elemento
     * specificato nel passo (step) corrente, creando una maschera che evidenzia l'elemento selezionato.
     * La maschera è applicata sopra il contenitore del tutorial, mentre l'elemento stesso rimane visibile.
     *
     * Inoltre, viene creata una "balloon" (finestra pop-up) sopra l'elemento, con il messaggio del passo e la navigazione.
     *
     * @function createMaskStep
     * @param {Object} step - L'oggetto che rappresenta il passo corrente del tutorial.
     * @param {string} step.selector - Il selettore CSS dell'elemento da evidenziare.
     * @param {string} step.message - Il messaggio da visualizzare nel passo.
     * @param {Object} step.position - La posizione della balloon (pop-up) rispetto all'elemento (top, bottom, left, right).
     * @param {Object} step.positionMobile - La posizione della balloon per dispositivi mobili (top, bottom).
     * @returns {void} Non restituisce un valore, ma applica una maschera e visualizza il messaggio del passo.
     *
     * @private
     */
    createMaskStep(step) {
        this.mask?.jdm_destroy();

        const hole = this.container.querySelector(step.selector);
        hole.scrollIntoView({ behavior: "instant", block: "center", inline: "center" });

        const holeBBox = hole.getBoundingClientRect();
        const svgBBox = this.svg.getBoundingClientRect();
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;
        const x = holeBBox.x + scrollX;
        const y = holeBBox.y + scrollY;
        const h = holeBBox.height;
        const w = holeBBox.width;
        const svgX = svgBBox.x + scrollX;
        const svgY = svgBBox.y + scrollY;
        const r = this.getValueOfBorderRadius(hole);

        const maskPath = `
			M ${svgX}, ${svgY} 
			L ${svgX + svgBBox.width}, ${svgY} 
			L ${svgX + svgBBox.width}, ${svgY + svgBBox.height}
			L ${svgX}, ${svgY + svgBBox.height} 
			Z 
			
			M ${x + r.h}, ${y} 
			A ${r.h}, ${r.v}, 0, 0 , 0, ${x}, ${y + r.v} 
			L ${x}, ${y + h - r.v} 
			A ${r.h}, ${r.v}, 0, 0 , 0, ${x + r.h}, ${y + h} 
			L ${x + w - r.h}, ${y + h} 
			A ${r.h}, ${r.v}, 0, 0 , 0, ${x + w}, ${y + h - r.v} 
			L ${x + w}, ${y + r.v} 
			A ${r.h}, ${r.v}, 0, 0 , 0, ${x + w - r.h}, ${y} 
			Z`;

        step.positionMobile = step.positionMobile ? step.positionMobile : this.isElementInLowerHalf(hole) ? "top" : "bottom";

        this.genBalloonStep(step, x, y, w, h);
        const mask = document.createElementNS("http://www.w3.org/2000/svg", "path");
        mask.setAttribute("d", maskPath); // Imposta il path della maschera
        mask.setAttribute("fill", this.data.bgColor); // Colore di riempimento (nero semi-trasparente)

        // Applica la maschera (utilizzando la classe Jdm)
        this.mask = new Jdm(mask, this.svg);
    }
    /**
     * Aggiorna il numero del passo corrente nel tutorial.
     *
     * Questo metodo modifica il contenuto HTML dell'elemento che mostra il numero del passo corrente nel navigatore.
     * Viene utilizzato per riflettere il progresso del tutorial ogni volta che l'utente avanza al passo successivo.
     *
     * @function updateCurrentStep
     * @param {number} n - Il numero del passo corrente che deve essere mostrato nel navigatore.
     * @returns {void} Non restituisce un valore, ma aggiorna il contenuto dell'elemento che visualizza il passo corrente.
     *
     * @private
     */
    updateCurrentStep(n) {
        this.navigator?.currentStep.jdm_innerHTML(n);
    }
    /**
     * Ottiene il valore del raggio del bordo di un elemento, adattandolo alle diverse unità di misura.
     *
     * Questo metodo esamina il valore del `border-radius` di un elemento e calcola i raggi orizzontale (h) e verticale (v) in base all'unità di misura utilizzata.
     * Supporta valori espressi in percentuale, `rem`, `em` e `px`. In caso di unità relative (come percentuali o `rem`), il metodo esegue i calcoli necessari per ottenere i valori in pixel.
     *
     * @function getValueOfBorderRadius
     * @param {Element} element - L'elemento DOM di cui calcolare il `border-radius`.
     * @returns {Object|number} Un oggetto contenente i valori `h` (orizzontale) e `v` (verticale) del raggio del bordo, oppure `0` se il valore non è valido o non è riconosciuto.
     *
     * @private
     */
    getValueOfBorderRadius(element) {
        const value = window.getComputedStyle(element).getPropertyValue("border-radius");

        if (value.includes("%")) {
            // Se è in percentuale, calcola la percentuale rispetto alla larghezza e altezza dell'elemento
            const width = element.offsetWidth;
            const height = element.offsetHeight;
            const percent = parseFloat(value) / 100;
            return {
                h: width * percent,
                v: height * percent,
            };
        } else if (value.includes("rem")) {
            // Se è in rem, moltiplica per la dimensione del font radice
            const remValue = parseFloat(value);
            const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
            return {
                h: remValue * rootFontSize,
                v: remValue * rootFontSize,
            };
        } else if (value.includes("em")) {
            // Se è in em, moltiplica per la dimensione del font dell'elemento
            const emValue = parseFloat(value);
            const fontSize = parseFloat(getComputedStyle(element).fontSize);
            return {
                h: emValue * fontSize,
                v: emValue * fontSize,
            };
        } else if (value.includes("px")) {
            // Se è già in px, basta estrarre il valore numerico
            return {
                h: parseFloat(value),
                v: parseFloat(value),
            };
        } else {
            return 0;
        }
    }
    /**
     * Crea e invia un evento personalizzato al nodo specificato.
     *
     * Questo metodo crea un evento personalizzato di tipo `CustomEvent` e lo invia al nodo selezionato. L'evento può essere configurato per propagarsi ai nodi genitori e per essere eseguito una sola volta.
     * L'evento trasmette i dati come parte del suo `detail` e può essere configurato per essere ascoltato una sola volta.
     *
     * @function genEvent
     * @param {string} name - Il nome dell'evento da inviare.
     * @param {Object} data - I dati associati all'evento che verranno inviati nel dettaglio dell'evento.
     * @param {Node} [node=document] - Il nodo al quale inviare l'evento. Se non specificato, l'evento verrà inviato al nodo `document`.
     * @param {boolean} [propagateToParents=true] - Indica se l'evento deve propagarsi ai nodi genitori. Il valore predefinito è `true`.
     * @param {boolean} [once=false] - Indica se l'evento deve essere eseguito una sola volta. Il valore predefinito è `false`.
     *
     * @private
     */
    genEvent(name, data, node = document, propagateToParents = true, once = false) {
        node.dispatchEvent(new CustomEvent(name, { detail: data, bubbles: propagateToParents, once: once }));
    }
    /**
     * Applica una o più classi CSS di animazione a un elemento e restituisce una promessa che si risolve quando l'animazione è terminata.
     *
     * Questo metodo aggiunge e rimuove classi CSS per applicare un'animazione a un elemento HTML. La promessa restituita si risolve una volta che l'animazione è terminata, ascoltando gli eventi di fine animazione (`animationend`, `webkitAnimationEnd`, `oanimationend`).
     *
     * @function animateCssCallBack
     * @param {Object} options - Le opzioni per l'animazione.
     * @param {Element} [options.element=null] - L'elemento HTML su cui applicare le classi di animazione. Se non specificato, deve essere fornito un valore valido.
     * @param {string|string[]} [options.addClass=null] - Una o più classi da aggiungere all'elemento per avviare l'animazione. Può essere una stringa o un array di stringhe.
     * @param {string|string[]} [options.removeClass=null] - Una o più classi da rimuovere dall'elemento prima di applicare l'animazione. Può essere una stringa o un array di stringhe.
     *
     * @returns {Promise} Una promessa che si risolve quando l'animazione è terminata.
     *
     * @private
     * @example
     * // Esempio di utilizzo per aggiungere e rimuovere classi di animazione
     * animateCssCallBack({
     *     element: document.getElementById('myElement'),
     *     addClass: 'fadeIn',
     *     removeClass: 'fadeOut'
     * }).then(() => {
     *     console.log('Animazione terminata');
     * });
     */
    animateCssCallBack({ element = null, addClass = null, removeClass = null }) {
        return new Promise(resolve => {
            if (Array.isArray(addClass)) {
                for (const className of addClass) {
                    element.classList.add(className);
                }
            } else {
                element.classList.add(addClass);
            }
            if (Array.isArray(removeClass)) {
                for (const className of removeClass) {
                    element.classList.remove(className);
                }
            } else {
                element.classList.remove(removeClass);
            }
            element.addEventListener("webkitAnimationEnd", resolve, false);
            element.addEventListener("animationend", resolve, false);
            element.addEventListener("oanimationend", resolve, false);
        });
    }
    /**
     * Crea una funzione che ritarda l'esecuzione di una funzione originale fino a quando non sono trascorsi un certo numero di millisecondi
     * dall'ultima volta che la funzione è stata invocata. Questo è utile per limitare l'esecuzione di funzioni ad alte prestazioni, come le
     * operazioni di ridimensionamento o scroll.
     *
     * @function debounce
     * @param {Function} func - La funzione da debouncing. Questa è la funzione che verrà ritardata.
     * @param {number} wait - Il numero di millisecondi da aspettare prima di eseguire la funzione.
     * @param {boolean} [immediate=false] - Se `true`, la funzione viene eseguita immediatamente alla prima chiamata, quindi
     *                                         successivamente verrà eseguita con il ritardo.
     *
     * @returns {Function} Una nuova funzione che gestisce il ritardo dell'esecuzione della funzione originale.
     *
     * @private
     */
    debounce(func, wait, immediate) {
        let timeout;
        return function () {
            const context = this,
                args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function () {
                timeout = null;
                if (!immediate) func.apply(context, args);
            }, wait);
            if (immediate && !timeout) func.apply(context, args);
        };
    }
    /**
     * Verifica se un elemento è potenzialmente visibile all'interno della pagina, controllando sia la visibilità
     * dell'elemento che dei suoi genitori. Se uno dei genitori è nascosto (ad esempio, ha display: none, visibility: hidden,
     * o opacity: 0), l'elemento non verrà considerato visibile.
     *
     * @function isPotentiallyVisible
     * @param {Element} element - L'elemento da verificare.
     * @returns {boolean} Restituisce `true` se l'elemento e tutti i suoi genitori sono visibili, `false` altrimenti.
     *
     *
     * @private
     */
    isPotentiallyVisible(element) {
        if (!element) return false;

        // Controllo su tutti i genitori per verificare se sono nascosti
        let parent = element;
        while (parent) {
            const style = window.getComputedStyle(parent);
            if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
                return false; // Se un genitore è nascosto, l'elemento non è visibile
            }
            parent = parent.parentElement;
        }

        return true;
    }
    /**
     * Verifica se la visualizzazione della pagina è su un dispositivo mobile, in base alla larghezza della finestra del browser.
     * Se la larghezza della finestra è inferiore o uguale a 768px, viene considerato un dispositivo mobile.
     *
     * @function isMobile
     * @returns {boolean} Restituisce `true` se la larghezza della finestra è inferiore o uguale a 768px (dispositivo mobile),
     *                    `false` altrimenti.
     *
     * @private
     */
    isMobile() {
        return window.matchMedia("(max-width: 768px)").matches;
    }
    /**
     * Verifica se un elemento è situato nella metà inferiore della finestra del browser.
     * Viene eseguito un controllo confrontando la posizione superiore dell'elemento con l'altezza della finestra.
     *
     * @function isElementInLowerHalf
     * @param {HTMLElement} element - L'elemento HTML da verificare.
     * @returns {boolean} Restituisce `true` se l'elemento è nella metà inferiore della finestra del browser,
     *                    `false` altrimenti.
     *
     * @private
     */
    isElementInLowerHalf(element) {
        if (!element) return false;

        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        return rect.top >= windowHeight / 2;
    }

    /**
     * Crea e visualizza una notifica per il tutorial.
     *
     * Questo metodo crea una notifica dinamica che viene mostrata nella sezione delle notifiche del tutorial.
     * La notifica viene automaticamente rimossa dopo il tempo specificato in millisecondi.
     * Se non viene specificato un tempo di distruzione, la notifica verrà rimossa dopo 2500 millisecondi (2.5 secondi).
     *
     * @function genNotification
     * @param {string} [text=`Step N. ${this.counter + 1} non visualizzabile`] - Il testo da visualizzare nella notifica.
     * Se non viene fornito, il testo predefinito indicherà che il passo corrente non è visualizzabile.
     * @param {number | null} [autoDestroyMs=2500] - Il tempo (in millisecondi) dopo il quale la notifica verrà automaticamente rimossa.
     * Se il valore è maggiore di zero, la notifica verrà rimossa dopo il tempo specificato.
     * @returns {void} Non restituisce un valore, ma modifica direttamente il DOM per mostrare la notifica.
     *
     * @example
     * const tutorial = new TooEasyRial("#container", "https://api.example.com/tutorial");
     * tutorial.genNotification("Questo è un messaggio di notifica.", 3000); // La notifica scomparirà dopo 3 secondi.
     */
    genNotification(text = `Step N. ${this.counter + 1} non visualizzabile`, autoDestroyMs= 2500) {
        //language=html
        const domString = `<div class="notificationMessage">${text}</div>`;
        const message = new Jdm(domString, this.tutorialContainer.notificationCenter);
        if (autoDestroyMs && autoDestroyMs > 0) {
            setTimeout(message.jdm_destroy, autoDestroyMs);
        }
    }

    /**
     * Naviga al passo successivo del tutorial.
     *
     * Questo metodo incrementa il contatore del passo e naviga al passo successivo. Se il passo corrente è l'ultimo,
     * il contatore non verrà incrementato. La navigazione è gestita dal metodo `goToStep()`,
     * che aggiorna lo stato del tutorial e la visualizzazione del passo.
     *
     * @function goToNextStep
     * @returns {boolean} Restituisce `true` se la navigazione al passo successivo è avvenuta correttamente,
     * altrimenti `false` (ad esempio, se non è possibile navigare oltre l'ultimo passo).
     *
     * @example
     * const tutorial = new TooEasyRial("#container", "https://api.example.com/tutorial");
     * tutorial.goToNextStep(); // Naviga al passo successivo.
     */
    goToNextStep() {
        this.counter = this.counter === this.stepList.length - 1 ? this.stepList.length - 1 : (this.counter += 1);
        this.goToStep(this.counter, true);
        return this.counter < this.stepList.length - 1;
    }

    /**
     * Naviga al passo precedente del tutorial.
     *
     * Questo metodo riduce il contatore del passo e naviga indietro al passo precedente.
     * Se il passo corrente è il primo, il contatore viene resettato a 0. La navigazione è gestita dal metodo `goToStep()`,
     * che aggiorna lo stato del tutorial e la visualizzazione del passo.
     *
     * @function goToPrevStep
     * @returns {boolean} Restituisce `true` se la navigazione al passo precedente è avvenuta correttamente,
     * altrimenti `false` (ad esempio, se non è possibile navigare oltre il primo passo).
     *
     * @example
     * const tutorial = new TooEasyRial("#container", "https://api.example.com/tutorial");
     * tutorial.goToPrevStep(); // Naviga al passo precedente.
     */
    goToPrevStep() {
        this.counter = this.counter <= 1 ? 0 : (this.counter -= 1);
        this.goToStep(this.counter, false);
        return this.counter > 1;
    }

    /**
     * Naviga verso un passo specifico del tutorial e aggiorna il progresso.
     *
     * Questo metodo si occupa di verificare se l'elemento relativo al passo è visibile. Se non lo è,
     * viene mostrata una notifica e, a seconda del parametro `skipToNext`, il tutorial prosegue al passo successivo o precedente.
     * Se l'elemento è visibile, aggiorna lo stato del tutorial e crea una "maschera" per il passo corrente.
     *
     * @function goToStep
     * @param {number} counter - L'indice del passo a cui navigare nella lista dei passi.
     * @param {boolean} [skipToNext=true] - Se `true`, salta al passo successivo se il passo corrente non è visibile.
     * Se `false`, salta al passo precedente.
     * @returns {void} Non restituisce un valore, ma modifica direttamente lo stato e il DOM per aggiornare il tutorial.
     *
     * @example
     * const tutorial = new TooEasyRial("#container", "https://api.example.com/tutorial");
     * tutorial.goToStep(2); // Naviga al terzo passo.
     */
    goToStep(counter, skipToNext = true) {
        this.resetProgressBarCursor();
        const step = this.stepList[counter];
        const hole = this.container.querySelector(step.selector);
        if (!this.isPotentiallyVisible(hole)) {
            if (this.data.showNotification) {
                let text = this.stepList?.[counter]?.notificationMessage?.[this.lang] ?? this.stepList?.[counter]?.notificationMessage;
                this.genNotification(text);
            }
            if (skipToNext) {
                if (this.counter < this.stepList.length - 1) {
                    this.counter--;
                    this.goToNextStep();
                }
            } else {
                if (this.counter > 0) {
                    this.counter++;
                    this.goToPrevStep();
                }
            }
        } else {
            this.updateCurrentStep(counter + 1);
            this.createMaskStep(this.stepList[counter]);
        }
    }

    /**
     * Avvia la modalità autoplay per il tutorial, proseguendo automaticamente tra i passi.
     *
     * Questo metodo nasconde il pulsante di autoplay e mostra il pulsante per fermarlo. Inoltre, gestisce
     * la barra di progresso che si aggiorna durante l'autoplay. Se il passo corrente non è visibile o se si
     * arriva all'ultimo passo, l'autoplay si ferma automaticamente.
     * La durata di ogni passo può essere configurata tramite `autoPlayTimerMs` nel file json di configurazione.
     *
     * @function autoplay
     * @returns {void} Non restituisce un valore, ma avvia la modalità autoplay e aggiorna il DOM per riflettere il cambiamento.
     *
     * @example
     * const tutorial = new TooEasyRial("#container", "https://api.example.com/tutorial");
     * tutorial.autoplay(); // Avvia l'autoplay del tutorial.
     */
    autoplay() {
        this.playing = true;
        this.navigator.autoPlay.jdm_addClassList("d-none");
        this.navigator.stopAutoplay.jdm_removeClassList("d-none");

        this.navigator.progressBarCursor.style.transition = `width ${this.data.autoPlayTimerMs || 5000}ms linear`;
        this.navigator.progressBarCursor.style.width = "100%";

        this.autoplayTimer = setInterval(() => {
            if (!this.goToNextStep()) {
                this.stopAutoplay();
            } else if (this.navigator.progressBarCursor) {
                this.navigator.progressBarCursor.style.width = "0%";
                setTimeout(() => {
                    this.navigator.progressBarCursor.style.transition = `width ${this.data.autoPlayTimerMs || 5000}ms linear`;
                    this.navigator.progressBarCursor.style.width = "100%";
                }, 50);
            }
        }, this.data.autoPlayTimerMs || 5000);
    }

    /**
     * Ferma la modalità autoplay del tutorial e ripristina lo stato del tutorial.
     *
     * Questo metodo nasconde il pulsante per fermare l'autoplay e mostra nuovamente il pulsante per avviarlo.
     * Inoltre, ferma l'intervallo di autoplay e ripristina la barra di progresso al suo stato iniziale.
     *
     * @function stopAutoplay
     * @returns {void} Non restituisce un valore, ma ferma l'autoplay e ripristina il DOM per riflettere il cambiamento.
     *
     * @example
     * const tutorial = new TooEasyRial("#container", "https://api.example.com/tutorial");
     * tutorial.stopAutoplay(); // Ferma l'autoplay del tutorial.
     */
    stopAutoplay() {
        this.playing = false;
        this.navigator.autoPlay.jdm_removeClassList("d-none");
        this.navigator.stopAutoplay.jdm_addClassList("d-none");
        clearInterval(this.autoplayTimer);
        this.resetProgressBarCursor();
    }

    /**
     * Distrugge e rimuove il tutorial dal DOM, e ripristina gli event listener.
     *
     * Questo metodo avvia un'animazione di uscita sul contenitore del tutorial, rimuove l'event listener associato
     * alla pressione dei tasti e distrugge il contenitore del tutorial dal DOM. Una volta completata l'animazione,
     * il tutorial viene rimosso definitivamente.
     *
     * @function destroy
     * @returns {void} Non restituisce un valore, ma rimuove il tutorial e le risorse associate dal DOM.
     *
     * @example
     * const tutorial = new TooEasyRial("#container", "https://api.example.com/tutorial");
     * tutorial.destroy(); // Distrugge il tutorial e lo rimuove dal DOM.
     */
    destroy() {
        this.animateCssCallBack({ element: this.tutorialContainer, addClass: ["fadeOut"], removeClass: ["fadeIn"] }).then(() => {
            document.removeEventListener("keydown", this.keydown);
            this.tutorialContainer.jdm_destroy();
        });
    }

    /**
     * Gestisce gli eventi di pressione dei tasti durante il tutorial.
     *
     * Questo metodo è legato all'evento `keydown` e gestisce le seguenti azioni in base al tasto premuto:
     * - **Freccia sinistra (←)**: Naviga al passo precedente.
     * - **Freccia destra (→)**: Naviga al passo successivo.
     * - **Esc**: Distrugge il tutorial e rimuove il tutorial dal DOM.
     * - **Barra spaziatrice**: Avvia o ferma l'autoplay del tutorial.
     *
     * @function keydown
     * @param {KeyboardEvent} e - L'evento di pressione del tasto.
     * @returns {void} Non restituisce un valore, ma esegue l'azione appropriata in base al tasto premuto.
     *
     * @example
     * // Aggiunge l'event listener per la gestione dei tasti
     * document.addEventListener("keydown", tutorial.keydown);
     *
     * // Gestisce i tasti per:
     * // Freccia sinistra: passo precedente
     * // Freccia destra: passo successivo
     * // Esc: distruggere il tutorial
     * // Barra spaziatrice: avviare o fermare l'autoplay
     */
    keydown(e) {
        e.preventDefault();
        // arrow <- prev step
        if (e.keyCode === 37) {
            this.goToPrevStep();
        }
        // arrow -> next step
        if (e.keyCode === 39) {
            this.goToNextStep();
        }
        // esc destroy
        if (e.keyCode === 27) {
            this.destroy();
        }
        // spacebar autoplay
        if (e.keyCode === 32) {
            this.playing ? this.stopAutoplay() : this.autoplay();
        }
    }
    /**
     * Gestisce l'aggiunta degli event listener per gli eventi globali.
     *
     * Questo metodo imposta due event listener:
     * - Un listener per l'evento di `resize` della finestra, che esegue la funzione `genSvg()` dopo un breve ritardo,
     *   tramite il meccanismo di debounce, per evitare chiamate ripetute troppo ravvicinate.
     * - Un listener per l'evento `keydown`, che è legato alla funzione `keydown` del tutorial, per gestire
     *   l'interazione tramite tastiera.
     *
     * @function events
     * @returns {void} Non restituisce un valore, ma imposta gli event listener per `resize` e `keydown`.
     *
     * @private
     */
    events() {
        window.addEventListener(
            "resize",
            this.debounce(() => {
                this.genSvg();
            }, 5),
        );
        document.addEventListener("keydown", this.keydown);
    }
}


/**
 * Struttura della configurazione per le notifiche.
 * @typedef {Object} NotificationConfig
 * @property {string} fontFamily - La famiglia del font per il testo.
 * @property {string} bgColor - Il colore di sfondo delle notifiche in formato rgba.
 * @property {number} autoPlayTimerMs - Il tempo di attesa (in millisecondi) prima che la notifica successiva venga mostrata automaticamente.
 * @property {boolean} showNotification - Indica se le notifiche devono essere visualizzate.
 * @property {string} defaultNotification - Il messaggio di notifica predefinito, con un riferimento alla variabile `counter` per il passo corrente.
 * @property {Array.<NotificationItem>} list - La lista di notifiche da visualizzare.
 */

/**
 * Struttura di ciascun elemento di notifica nella lista.
 * @typedef {Object} NotificationItem
 * @property {string} selector - Il selettore CSS dell'elemento a cui applicare la notifica.
 * @property {string} position - La posizione della notifica (es. "right", "bottom", "left", "top").
 * @property {string} [positionMobile] - La posizione della notifica sui dispositivi mobili (opzionale).
 * @property {string|Object} message - Il messaggio della notifica, che può essere un testo o un contenuto HTML/iframe.
 * @property {Object.<string, string>} [notificationMessage] - Messaggio personalizzato per la notifica, con versioni in diverse lingue (opzionale).
 */

/**
 * Esempio di json di configurazione.
 * @type {NotificationConfig}
 */
const example = {
    "fontFamily": "var(--bs-body-font-family)",
    "bgColor": "rgba(0,0,0,0.875)",
    "autoPlayTimerMs": 5000,
    "showNotification": true,
    "defaultNotification": "Step N. ${this.counter + 1} non visualizzabile",
    "list": [
        {
            "selector": "#exampleRectangleRed",
            "position": "right",
            "positionMobile": "bottom",
            "message":  {
                "it": "Rettangolo rosso",
                "en": "Rectangle red"
            },
            "notificationMessage":  {
                "it": "Messaggio personalizzato",
                "en": "Custom Message"
            }
        },
        {
            "selector": "#exampleRectangleGreen",
            "position": "bottom",
            "message": "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/emFMHH2Bfvo?si=xHat82g7P2sWHPpq\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" referrerpolicy=\"strict-origin-when-cross-origin\" allowfullscreen></iframe>"
        },
        {
            "selector": "#exampleRectangleBlue",
            "position": "top",
            "message": "<b>test di messaggio3</b>"
        },
        {
            "selector": "#exampleRectanglePink",
            "position": "left",
            "message": "<b>test di messaggio4</b>"
        }
    ]
};
