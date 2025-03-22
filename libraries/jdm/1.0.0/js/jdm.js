import {_common} from "./_common.js";
import {Proto} from "./proto.js";

const v= '3.3'

new Proto();

/**
 * Classe che rappresenta un oggetto contenente i dati del nodo HTML.
 */
export class JdmData {
	/**
	 * Crea un'istanza di JdmData.
	 * @param {Element|null|string} element - L'elemento HTML del nodo.
	 * @param {Element|Jdm|null} parent - L'elemento HTML del nodo padre.
	 * @param {string|Array<string>|null} classList - La lista di classi del nodo.
	 * @param {boolean} deep - Un flag che indica se il nodo deve essere creato con eventuali nodi figli.
	 * @param {...any} args - Argomenti aggiuntivi opzionali per la classe JdmData.
	 */
	constructor(element = null, parent = null, classList = null, deep = true, ...args) {
		this.element = element;
		this.parent = parent;
		this.classList = classList;
		this.deep = deep;
		this.args = args;
	}
}

/**
 * Classe che rappresenta un nodo HTML
 *
 * CDN: {@link https://cdn.dev-box.it/jdm/latest/jdm.js}.
 *
 * ESEMPI: {@link https://codepen.io/collection/BNzzYd}.
 */
export class Jdm {
	/**
	 * Crea un'istanza di Jdm.
	 * @param {JdmData|string} elementOrData - L'elemento HTML del nodo o l'oggetto JdmData.
	 * @param {Element|Jdm|null} parent - L'elemento HTML del nodo padre.
	 * @param {string|Array<string>|null} classList - La lista di classi del nodo.
	 * @param {boolean} deep - Un flag che indica se il nodo deve essere creato con eventuali nodi figli.
	 * @returns {Element} L'elemento HTML creato.
	 */
	constructor(elementOrData = null, parent = null, classList = null, deep = false) {
		// Crea un nuovo oggetto JdmData con valori predefiniti
		let data = new JdmData();

		// Verifica se è stato fornito un oggetto JdmData come primo argomento
		if (elementOrData instanceof JdmData) {
			// Se fornito un oggetto JdmData, aggiorna l'oggetto data con le sue proprietà
			data = { ...data, ...elementOrData };
		} else {
			// Se forniti gli argomenti direttamente, aggiorna l'oggetto data con i valori specificati
			data = { ...data, ...{ element: elementOrData, parent: parent, classList: classList, deep: deep } };
		}

		// Inizializza l'istanza Jdm con i dati forniti e ottieni il nodo HTML corrispondente
		this.node = this.init(data);

		// Esegue alcune operazioni aggiuntive sull'istanza
		this.tag = this.node.tagName.toLowerCase();
		if (data.classList) this.jdm_addClassList(data.classList);
		if (data.parent) data.parent.appendChild(this.node);
		if (data.deep) {
			const mainNode = data.args?.length > 0 ? data.args[0]?.mainNode : null
			this.loopOverChild(this.node.childNodes, data.args[0]?.mainNode);
		}
		this.addJdmMethodToNode();

		// Restituisce l'elemento HTML creato
		return this.node;
	}

	/**
	 * Inizializza il nodo in base ai dati specificati.
	 * @private
	 * @param {JdmData} data - L'oggetto JdmData contenente i dati del nodo.
	 * @returns {Element} L'elemento HTML creato.
	 */
	init(data) {
		// Switch statement controlla il tipo dell'elemento passato a questa funzione
		switch (this.checkType(data.element)) {
			// Se l'elemento è una stringa che rappresenta un tag HTML, crea un nuovo elemento con il nome specificato e lo restituisce
			case 'tagString':
				return document.createElement(data.element);
			// Se l'elemento è una stringa che rappresenta un documento HTML, crea un nuovo documento HTML con il parser DOM e restituisce il primo nodo figlio del body
			case 'domFromString':
				const parser = new DOMParser();
				return parser.parseFromString(data.element, "text/html").getRootNode().body.firstChild;
			// Se l'elemento è già un elemento del DOM, lo restituisce
			case 'elementDom':
				return data.element;
			// Se il tipo dell'elemento non è riconosciuto, esegue un'operazione di default
			case 'domFromHtml':
				const parserHtml = new DOMParser();
				return parserHtml.parseFromString(data.element, "text/html").getRootNode().body.firstChild;
			case 'unknown':
				console.info(data);
				console.info(data.element.constructor.name)
				console.log('-------> CHECK TO DO MAY BE ALERT');
				break;
		}
	}

	/**
	 * Verifica il tipo della variabile specificata.
	 * La funzione checkType verifica il tipo della variabile passata come parametro e restituisce una stringa che identifica il tipo.
	 * La stringa restituita può essere una delle seguenti:
	 * 'domFromString': se la variabile è una stringa che rappresenta un singolo elemento DOM.
	 * 'domFromHtml': se la variabile è una stringa che rappresenta uno o più elementi HTML.
	 * 'tagString': se la variabile è una stringa che rappresenta un singolo tag HTML.
	 * 'elementDom': se la variabile è un oggetto Element del DOM.
	 * 'unknown': se il tipo della variabile non può essere identificato.
	 * @private
	 * @param {*} variable - La variabile da verificare.
	 * @returns {string} Il tipo della variabile.
	 */
	checkType(variable) {
		if (typeof variable === 'string') {
			//La funzione variable.charAt(0) === '<' && variable.charAt(variable.length - 1) === '>' verifica se la stringa variable inizia con il carattere < e finisce con il carattere >.
			// Questa espressione viene utilizzata per controllare se la variabile variable rappresenta un singolo elemento DOM, che è rappresentato da una stringa delimitata dai caratteri < e >.
			// La funzione restituisce true se la stringa variable inizia con < e finisce con >, altrimenti restituisce false.
			if (variable.charAt(0) === '<' && variable.charAt(variable.length - 1) === '>') {
				return 'domFromString';
				//La funzione /<[a-z][\s\S]*>/i.test(variable) verifica se la variabile variable contiene una stringa che inizia con il carattere <, seguito da un carattere alfabetico minuscolo [a-z] e poi da zero o più caratteri di spazio o non-spazio [\s\S]*. Questa espressione regolare viene quindi usata per controllare se la variabile variable rappresenta uno o più elementi HTML.
				// Il flag i nella regex indica che la ricerca è case-insensitive, quindi la regex corrisponde anche ai tag scritti in lettere maiuscole.
				// La funzione restituisce true se la regex corrisponde alla stringa della variabile variable, altrimenti restituisce false.
			} else if (/<[a-z][\s\S]*>/i.test(variable)) {
				return 'domFromHtml';
			} else {
				return 'tagString';
			}
		} else if (variable.nodeType && variable.nodeType === Node.ELEMENT_NODE) {
			return 'elementDom';
		} else {
			console.log('--------------', variable.prototype)
			return 'unknown';
		}
	}

	/**
	 * Itera sui nodi figli e aggiunge una proprietà "jdm_childNode" all'oggetto principale
	 * per ogni nodo figlio, indicizzando per nome se presente un attributo "jdm_name" o il alternativa "name" nel nodo figlio.
	 * @param {NodeList} childNodes - Lista dei nodi figli.
	 * @param {Object} [mainNode=null] - Oggetto principale a cui aggiungere le proprietà "jdm_childNode".
	 */
	loopOverChild(childNodes, mainNode = null) {
		// Filtra solo i nodi con un nodoType minore o uguale a 2 (cioè nodi elementi e nodi di testo)
		childNodes = Array.from(childNodes).filter(child => child.nodeType <= 2);
		// Se non viene passato un mainNode, utilizza il nodo corrente come mainNode
		mainNode = mainNode ? mainNode : this.node;
		// Se ci sono nodi figli, crea un oggetto jdm_childNode e aggiungi un'istanza di Jdm ai nodi figli con un attributo "name"
		if (childNodes.length > 0) {
			mainNode.jdm_childNode = mainNode.jdm_childNode ? mainNode.jdm_childNode : {};
			for (const child of childNodes) {
				const name = child.getAttribute('name');
				const dataName = child.getAttribute('data-name');
				// Crea un'istanza di Jdm per il nodo figlio
				const jdmElement = new Jdm(new JdmData( child, null, null, true, {mainNode: mainNode}));
				if (dataName) {
					mainNode.jdm_childNode[dataName] = jdmElement;
				} else if (name) {
					mainNode.jdm_childNode[name] = jdmElement;
				}
			}
		}
	}

	/**
	 * Aggiunge i metodi di `Jdm` come proprietà del nodo corrente.
	 * La funzione addJdmMethodToNode() aggiunge i metodi di Jdm come proprietà del nodo corrente.
	 * La funzione non accetta parametri e non restituisce alcun valore.
	 * La funzione utilizza il metodo Object.getOwnPropertyNames() per ottenere una lista dei nomi di tutti i metodi definiti nel prototipo di Jdm.
	 * Successivamente, la funzione filtra la lista dei metodi per includere solo quelli che iniziano con 'jdm_'.
	 * Infine, la funzione aggiunge ciascun metodo di Jdm come proprietà del nodo corrente utilizzando il metodo bind().
	 * @private
	 * @returns {void}
	 */
	addJdmMethodToNode() {
		// Ottiene una lista dei nomi di tutti i metodi definiti nel prototipo di `Jdm`.
		const methodList = Object.getOwnPropertyNames(Jdm.prototype);
		// Filtra la lista dei metodi per includere solo quelli che iniziano con 'jdm_'.
		const jdm_methodList = methodList.filter((elemento) => {
			return elemento.startsWith('jdm_');
		});
		// Aggiunge ciascun metodo di `Jdm` come proprietà del nodo corrente.
		for (const jdmMethod of jdm_methodList) {
			this.node[jdmMethod] = this[jdmMethod].bind(this);
		}
	}

	/**
	 * Imposta il valore dell'attributo specificato per il nodo corrente e genera un evento "setAttribute".
	 * La funzione jdm_setAttribute() imposta il valore dell'attributo specificato per il nodo corrente e genera un evento "setAttribute".
	 * La funzione accetta due parametri: attribute, che indica il nome dell'attributo da impostare, e value, che rappresenta il valore dell'attributo da impostare.
	 * Il valore restituito è l'oggetto Element che rappresenta il nodo corrente. La funzione utilizza il metodo setAttribute() per impostare il valore dell'attributo specificato
	 * per il nodo corrente, e poi utilizza il metodo jdm_genEvent() per generare un evento "setAttribute" con i dati relativi all'attributo impostato.
	 * @function
	 * @param {string} attribute - Il nome dell'attributo da impostare.
	 * @param {*} value - Il valore dell'attributo da impostare.
	 * @returns {Element} - Il nodo corrente.
	 */
	jdm_setAttribute(attribute, value = null) {
		// Imposta il valore dell'attributo specificato per il nodo corrente.
		this.node.setAttribute(attribute, value);
		// Genera un evento "setAttribute" con i dati relativi all'attributo impostato.
		this.jdm_genEvent('setAttribute', {attribute: attribute, value: value});
		// Restituisce il nodo corrente.
		return this.node;
	}

	/**
	 * Restituisce il valore dell'attributo specificato per il nodo corrente.
	 *
	 * @function jdm_getAttribute
	 * @param {string} attribute - Il nome dell'attributo di cui si vuole ottenere il valore.
	 * @returns {string|null} Il valore dell'attributo specificato oppure null se l'attributo non esiste.
	 */
	jdm_getAttribute(attribute) {
		// Ottiene il valore dell'attributo specificato per il nodo corrente.
		// Utilizziamo il metodo "getAttribute" sul nodo corrente "this.node" passando come parametro il nome dell'attributo "attribute".
		// Il metodo restituisce il valore dell'attributo se presente, altrimenti restituisce null.
		return this.node.getAttribute(attribute);
	}

	/**
	 * Aggiunge uno o più elementi come figli del nodo corrente.
	 * @param {Element|Element[]} elementList - L'elemento o la lista di elementi da aggiungere come figli del nodo corrente.
	 * @returns {Element} L'elemento corrente dopo l'aggiunta degli elementi figli.
	 */
	jdm_append(elementList) {
		// Controlla se elementList è un array
		if (Array.isArray(elementList)) {
			// Scorre gli elementi dell'array
			for (const element of elementList) {
				// Aggiunge l'elemento come figlio del nodo corrente tramite il metodo appendChild
				this.node.appendChild(element);
			}
		}
		// Se elementList non è un array ma è comunque definito
		else if (elementList) {
			// Aggiunge l'elemento come figlio del nodo corrente tramite il metodo appendChild
			this.node.appendChild(elementList);
		}
		return this.node;
	}


	jdm_prepend( elementList) {
		const firstChild = this.node.firstElementChild;
		// Controlla se elementList è un array
		if (Array.isArray(elementList)) {
			// Scorre gli elementi dell'array
			for (const element of elementList) {
				this.node.prepend(element);
			}
		}
		// Se elementList non è un array ma è comunque definito
		else if (elementList) {
			this.node.prepend(elementList);
		}
		return this.node;
	}


	/**
	 * Aggiunge una o più classi all'elemento corrente.
	 * La funzione prende in input un parametro classList che può essere una stringa o un array di stringhe contenenti le classi da aggiungere all'elemento corrente.
	 * La funzione aggiunge le classi specificate all'elemento corrente e restituisce l'elemento a cui sono state aggiunte le classi. Se l'input classList è null, undefined o un array vuoto, la funzione non fa nulla e restituisce l'elemento corrente senza modifiche.
	 * @param {string|string[]} classList - la o le classi da aggiungere.
	 * @returns {HTMLElement} L'elemento a cui sono state aggiunte le classi.
	 */
	jdm_addClassList(classList) {
		// Controlla se `classList` è un array
		if (Array.isArray(classList)) {
			// Aggiunge tutte le classi presenti nell'array
			for (const cls of classList) {
				this.node.classList.add(cls);
			}
		}
		// Se `classList` non è un array, controlla se esiste
		else if (classList) {
			// Aggiunge la classe unica indicata in `classList`
			this.node.classList.add(classList);
		}
		// Restituisce l'elemento HTML a cui sono state aggiunte le classi
		return this.node;
	}

	/**
	 * La funzione rimuove una o più classi dalla lista di classi del nodo.
	 * Se la lista di classi è un array, cicla attraverso la lista e rimuove ogni classe dal nodo.
	 * Se la lista di classi non è un array ma esiste, rimuove la classe dal nodo.
	 * Restituisce il nodo con la classe (o classi) rimossa/e.
	 * Rimuove una o più classi dalla lista di classi del nodo.
	 * @param {(string|string[])} classList - Il nome della classe o un array di nomi di classi da rimuovere.
	 * @returns {HTMLElement} Il nodo con la classe (o classi) rimossa/e.
	 */
	jdm_removeClassList(classList) {
		// Verifica se la lista di classi è un array
		if (Array.isArray(classList)) {
			// Cicla attraverso la lista di classi
			for (const cls of classList) {
				// Rimuove la classe dal nodo
				this.node.classList.remove(cls);
			}
		}
		// Se la lista di classi non è un array ma esiste
		else if (classList) {
			// Rimuove la classe dal nodo
			this.node.classList.remove(classList);
		}
		// Restituisce il nodo con la classe (o classi) rimossa/e
		return this.node;
	}

	/**
	 * Toggle delle classi presenti nell'array o della singola classe sul nodo corrente.
	 * @param {string[]|string} classList - L'array di classi o la singola classe da aggiungere o rimuovere.
	 * @returns {HTMLElement} - L'elemento corrente con le classi modificate.
	 */
	jdm_toggleClassList(classList) {
		// Se classList è un array, itera attraverso ogni classe e aggiungi o rimuovi la classe dal nodo.
		if (Array.isArray(classList)) {
			for (const cls of classList) {
				// Rimuove la classe dal nodo
				this.node.classList.toggle(cls);
			}
		}
		// Altrimenti, se classList è una stringa, aggiungi o rimuovi la classe dal nodo.
		else if (classList) {
			this.node.classList.toggle(classList);
		}
		// Restituisci l'elemento corrente con le classi modificate.
		return this.node;
	}

	/**
	 * Svuota il contenuto dell'elemento HTML corrente.
	 * @returns {HTMLElement} L'elemento HTML su cui è stata chiamata la funzione.
	 */
	jdm_empty() {
		// Se l'elemento HTML corrente è un input di tipo checkbox o radio, imposta la proprietà checked su false
		if (this.tag === 'input' && (this.node.element === 'checkbox' || this.node.element === 'radio')) {
			this.node.checked = false;
		}
		// Se l'elemento HTML corrente è un input di tipo text, textarea , imposta la proprietà value su null
		else if (this.tag === 'input' || this.tag === 'textarea' ) {
			this.node.value = null;
		}
		// Se l'elemento HTML corrente è un form, resetta il form
		else if (this.tag === 'form') {
			this.node.reset();
		}
		// Se l'elemento HTML corrente non è nessuno dei precedenti, imposta l'innerHTML su una stringa vuota
		else {
			this.node.innerHTML = '';
		}
		// Restituisce l'elemento HTML su cui è stata chiamata la funzione
		return this.node;
	}

	/**
	 * Rimuove l'elemento HTML dal DOM.
	 * La funzione jdm_destroy rimuove l'elemento HTML dal DOM.
	 * Prima di rimuovere l'elemento, genera un evento "destroy" utilizzando il metodo jdm_genEvent. Infine, restituisce l'elemento HTML rimosso dal DOM.
	 * @returns {HTMLElement} L'elemento HTML rimosso dal DOM.
	 */
	jdm_destroy() {
		// Rimuove l'elemento HTML dal DOM.
		this.node.remove();
		// Genera un evento 'destroy'.
		this.jdm_genEvent('destroy');
		// Restituisce l'elemento HTML rimosso dal DOM.
		return this.node;
	}

	/**
	 * Esegue la validazione dell'elemento HTML corrente.
	 * La funzione jdm_validate() esegue la validazione dell'elemento HTML corrente utilizzando il metodo checkValidity() dell'oggetto node.
	 * Inoltre, la funzione genera un evento 'validate' utilizzando il metodo jdm_genEvent() e restituisce l'elemento HTML su cui è stata chiamata la funzione.
	 * @returns {HTMLElement} L'elemento HTML su cui è stata chiamata la funzione.
	 */
	jdm_validate() {
		// Esegue la validazione dell'elemento HTML corrente.
		this.node.checkValidity();
		// Genera un evento 'validate'.
		this.jdm_genEvent('validate');
		// Restituisce l'elemento HTML su cui è stata chiamata la funzione.
		return this.node;
	}

	/**
	 * Rimuove l'attributo specificato dall'elemento.
	 * Questa funzione rimuove un attributo dall'elemento a cui è stato applicato il metodo.
	 * Per fare ciò, utilizza il metodo removeAttribute dell'oggetto node che rappresenta l'elemento HTML.
	 * Successivamente, genera un evento personalizzato di tipo 'removeAttribute' utilizzando il metodo jdm_genEvent.
	 * Il parametro passato all'evento è un oggetto con l'attributo che è stato rimosso. Infine, restituisce l'elemento a cui è stato rimosso l'attributo.
	 * @param {string} attribute - L'attributo da rimuovere.
	 * @returns {HTMLElement} L'elemento a cui è stata rimossa l'attributo.
	 */
	jdm_removeAttribute(attribute) {
		// Rimuove l'attributo dall'elemento.
		this.node.removeAttribute(attribute);
		// Genera un evento 'removeAttribute' e passa l'attributo come parametro.
		this.jdm_genEvent('removeAttribute', {attribute: attribute});
		// Restituisce l'elemento a cui è stato rimosso l'attributo.
		return this.node;
	}

	/**
	 * Imposta il valore di una proprietà CSS dell'elemento.
	 * La funzione jdm_setStyle imposta il valore di una proprietà CSS dell'elemento selezionato.
	 * I parametri richiesti sono il nome della proprietà CSS e il suo valore. La funzione restituisce l'elemento su cui è stata impostata la proprietà CSS.
	 * @param {string} style - Il nome della proprietà CSS da impostare.
	 * @param {string} value - Il valore della proprietà CSS da impostare.
	 * @returns {HTMLElement} - L'elemento su cui è stata impostata la proprietà CSS.
	 */
	jdm_setStyle(style, value) {
		// Imposta il valore della proprietà CSS specificata sull'elemento.
		this.node.style[style] = value;
		// Restituisce l'elemento su cui è stata impostata la proprietà CSS.
		return this.node;
	}

	/**
	 * Aggiunge una proprietà all'oggetto "node" e restituisce l'oggetto modificato.
	 * @param {string} name - Il nome della proprietà da aggiungere.
	 * @param {Object} [object=null] - L'oggetto da assegnare alla proprietà. Default: null.
	 * @returns {HTMLElement} L'oggetto "node" con la nuova proprietà aggiunta.
	 */
	jdm_extendNode(name, object = null) {
		// Assegna l'oggetto "object" alla proprietà con il nome "name" dell'oggetto "node".
		this.node[name] = object;
		// Restituisce l'oggetto "node" con la nuova proprietà aggiunta.
		return this.node;
	}

	/**
	 * Imposta il contenuto HTML dell'elemento.
	 * Questa funzione imposta il contenuto HTML dell'elemento corrente con il valore specificato e restituisce l'elemento stesso.
	 * Il parametro value rappresenta il valore HTML da impostare.
	 * La funzione utilizza la proprietà innerHTML dell'elemento corrente per impostare il valore specificato come contenuto HTML dell'elemento.
	 * @param {string | HTMLElement} value - Il valore HTML da impostare.
	 * @returns {HTMLElement} L'elemento su cui è stato impostato il contenuto HTML.
	 */
	jdm_innerHTML(value) {
		// Imposta il contenuto HTML dell'elemento.
		this.node.innerHTML = value;
		// Restituisce l'elemento su cui è stato impostato il contenuto HTML.
		return this.node;
	}

	/**
	 * Aggiunge la possibilità di binding dei dati a un elemento del DOM.
	 * La funzione jdm_binding esegue il binding di un evento su uno o più elementi HTML. Inoltre, se il twoWayDataBinding è abilitato, esegue il binding bidirezionale tra tutti gli elementi nella lista.
	 * Parametri:
	 * el - L'elemento HTML o l'array di elementi HTML a cui applicare il binding.
	 * event - L'evento su cui applicare il binding (predefinito a 'input').
	 * twoWayDataBinding - Flag che indica se il binding deve essere bidirezionale (predefinito a true).
	 * La funzione inizia creando una lista vuota di elementi e verifica se el è un array o un singolo elemento. Se el è un array, concatena la lista vuota con el, altrimenti lo pusha dentro.
	 * Successivamente, la funzione esegue il binding di un evento sull'elemento se questo è un input, una select o una textarea. Se l'elemento non è uno di questi, esegue il binding sull'innerHTML.
	 * Se il twoWayDataBinding è abilitato, la funzione esegue il binding bidirezionale tra tutti gli elementi nella lista, escluso quello corrente, creando una copia della lista degli elementi e aggiungendo l'elemento corrente. Per ogni elemento nella nuova lista, viene richiamata la funzione jdm_binding impostando il flag twoWayDataBinding a false.
	 * Infine, la funzione restituisce l'elemento a cui è stato applicato il binding.
	 * @param {Element[]} el - L'elemento o gli elementi del DOM a cui bindare i dati.
	 * @param {string} [event='input'] - L'evento che attiva il binding.
	 * @param {boolean} [twoWayDataBinding=true] - Indica se il binding deve essere bidirezionale o meno.
	 * @returns {HTMLElement} L'elemento a cui è stato applicato il binding.
	 */
	jdm_binding(el, event = 'input', twoWayDataBinding = true) {
		let elementList = [];
		// Se el è un array concatena elementList a esso, altrimenti lo pusha dentro.
		if (Array.isArray(el)) {
			elementList = elementList.concat(el);
		} else {
			elementList.push(el);
		}
		// Per ogni elemento nella lista di elementi el, applica il binding.
		for (const element of elementList) {
			// Se l'elemento è un input, una select o una textarea, applica il binding sull'evento indicato.
			if (element.tagName.toLowerCase() === 'input' || element.tagName.toLowerCase() === 'select' || element.tagName.toLowerCase() === 'textarea') {
				this.node.addEventListener(event, () => {
					element.jdm_setValue(this.jdm_getValue());
				});
				// Altrimenti, se l'elemento non è un input, una select o una textarea, applica il binding sull'innerHTML.
			} else {
				this.node.addEventListener(event, () => {
					element.jdm_innerHTML(this.jdm_getValue());
				});
			}
			// Se il twoWayDataBinding è abilitato, applica il binding bidirezionale tra tutti gli elementi nella lista.
			if (twoWayDataBinding) {
				const elementListTmp = elementList.filter(elementTmp => elementTmp !== element);
				elementListTmp.push(this.node);
				for (const elementTmp of elementListTmp) {
					element.jdm_binding(elementListTmp, event, false);
				}
			}
		}
		// Restituisce l'elemento a cui è stato applicato il binding.
		return this.node;
	}

	/**
	 * Aggiunge un listener per l'evento "input" all'elemento, che viene attivato quando l'utente modifica il valore dell'input.
	 * Questo codice definisce un metodo chiamato jdm_onInput che aggiunge un listener per l'evento "input" a un elemento HTML specifico.
	 * Il listener è una funzione fn che viene fornita come argomento.
	 * In altre parole, quando viene rilevato l'evento "input" sull'elemento specificato, la funzione fn verrà eseguita.
	 * Il metodo restituisce l'elemento stesso, in modo che possa essere concatenato con altre operazioni su quell'elemento.
	 * @param {function} fn - La funzione da eseguire quando l'evento "input" viene attivato.
	 * @returns {HTMLElement} - L'elemento su cui è stato registrato l'evento.
	 */
	jdm_onInput(fn = () => {}) {
		// Aggiunge un listener per l'evento "input" all'elemento.
		this.node.addEventListener('input', fn);
		// Restituisce l'elemento su cui è stato registrato l'evento.
		return this.node;
	}

	/**
	 * Aggiunge un listener per l'evento "change" all'elemento.
	 * la funzione aggiunge un listener per l'evento "change" all'elemento e restituisce l'elemento su cui è stato registrato l'evento.
	 * La documentazione JSDOC fornisce ulteriori dettagli sulla funzione, incluso il parametro fn che indica la funzione da eseguire quando si verifica l'evento "change".
	 * @param {Function} fn - La funzione da eseguire quando si verifica l'evento "change".
	 * @returns {HTMLElement} L'elemento a cui è stato aggiunto il listener per l'evento "change".
	 */
	jdm_onChange(fn = () => {}) {
		// Aggiunge un listener per l'evento "change" all'elemento.
		this.node.addEventListener('change', fn);
		// Restituisce l'elemento su cui è stato registrato l'evento.
		return this.node;
	}

	/**
	 * Aggiunge un gestore di eventi all'evento "select" dell'elemento.
	 * La funzione jdm_onSelect prende come parametro una funzione fn da eseguire quando l'evento select viene attivato sull'elemento su cui è chiamata la funzione.
	 * La funzione aggiunge un listener per l'evento select all'elemento usando il metodo addEventListener. Il parametro fn è la funzione da eseguire quando l'evento viene attivato.
	 * Infine, la funzione restituisce l'elemento su cui è stato registrato l'evento, utilizzando il costrutto return this.node.
	 * @param {function} fn - La funzione da eseguire quando l'evento "select" viene attivato.
	 * @returns {HTMLElement} L'elemento su cui è stato registrato l'evento.
	 */
	jdm_onSelect(fn = () => {}) {
		// Aggiunge un listener per l'evento "select" all'elemento.
		this.node.addEventListener('select', fn);
		// Restituisce l'elemento su cui è stato registrato l'evento.
		return this.node;
	}

	/**
	 * Aggiunge un listener per l'evento 'input' al nodo dell'oggetto Jdm e applica il pattern debounce alla funzione di callback.
	 * la funzione aggiunge un listener per l'evento input al nodo dell'oggetto Jdm e applica il pattern debounce alla funzione di callback passata come parametro fn.
	 * Il pattern debounce ritarda l'esecuzione della funzione di callback per un certo periodo di tempo specificato dal parametro opzionale timeout.
	 * Il valore di default per timeout è 300 millisecondi. Infine, la funzione restituisce il nodo dell'oggetto Jdm.
	 * @param {Function} fn - La funzione di callback da eseguire quando l'evento 'input' viene attivato.
	 * @param {number} [timeout=300] - Il tempo in millisecondi per cui la funzione di callback deve essere ritardata.
	 * @returns {HTMLElement} Il nodo dell'oggetto Jdm.
	 */
	jdm_onDebounce(fn = () => {}, timeout = 300) {
		// Aggiunge un listener per l'evento 'input' al nodo dell'oggetto Jdm e applica il pattern debounce alla funzione di callback.
		this.node.addEventListener('input', _common.debounce(fn, timeout));
		// Restituisce il nodo dell'oggetto Jdm.
		return this.node;
	}

	/**
	 * Aggiunge un gestore di eventi "click" all'elemento e restituisce l'elemento stesso.
	 * Questa funzione viene utilizzata per aggiungere un gestore di eventi "click" all'elemento specifico e restituisce l'elemento stesso. La funzione addEventListener() viene utilizzata per aggiungere il gestore di eventi "click" all'elemento.
	 * Il parametro fn rappresenta la funzione che deve essere eseguita quando si verifica l'evento "click". Se non viene fornita alcuna funzione, viene utilizzata una funzione vuota di default.
	 * La funzione restituisce l'elemento a cui è stato aggiunto il gestore di eventi "click", in modo che possa essere ulteriormente elaborato o utilizzato in altre parti del codice.
	 * @param {Function} fn - La funzione che deve essere eseguita quando si verifica l'evento "click".
	 * @returns {HTMLElement} L'elemento a cui è stato aggiunto il gestore di eventi "click".
	 */
	jdm_onClick(fn = () => {}) {
		// Utilizza la funzione addEventListener() per aggiungere un gestore di eventi "click" all'elemento
		this.node.addEventListener('click', fn);
		// Restituisce l'elemento stesso
		return this.node;
	}

	/**
	 * Aggiunge un gestore di eventi "dblclick" all'elemento e restituisce l'elemento stesso.
	 * Questa funzione viene utilizzata per aggiungere un gestore di eventi "dblclick" all'elemento specifico e restituisce l'elemento stesso. La funzione addEventListener() viene utilizzata per aggiungere il gestore di eventi "dblclick" all'elemento.
	 * Il parametro fn rappresenta la funzione che deve essere eseguita quando si verifica l'evento "dblclick". Se non viene fornita alcuna funzione, viene utilizzata una funzione vuota di default.
	 * La funzione restituisce l'elemento a cui è stato aggiunto il gestore di eventi "dblclick", in modo che possa essere ulteriormente elaborato o utilizzato in altre parti del codice.
	 * @param {Function} fn - La funzione che deve essere eseguita quando si verifica l'evento "dblclick".
	 * @returns {HTMLElement} L'elemento a cui è stato aggiunto il gestore di eventi "dblclick".
	 */
	jdm_onDoubleClick(fn = () => {}) {
		// Utilizza la funzione addEventListener() per aggiungere un gestore di eventi "dblclick" all'elemento
		this.node.addEventListener('dblclick', fn);
		// Restituisce l'elemento stesso
		return this.node;
	}

	/**
	 * Aggiunge un gestore di eventi "invalid" all'elemento e restituisce l'elemento stesso.
	 * Questa funzione viene utilizzata per aggiungere un gestore di eventi "invalid" all'elemento specifico e restituisce l'elemento stesso. La funzione addEventListener() viene utilizzata per aggiungere il gestore di eventi "invalid" all'elemento.
	 * Il parametro fn rappresenta la funzione che deve essere eseguita quando si verifica l'evento "invalid". Se non viene fornita alcuna funzione, viene utilizzata una funzione vuota di default.
	 * La funzione restituisce l'elemento a cui è stato aggiunto il gestore di eventi "invalid", in modo che possa essere ulteriormente elaborato o utilizzato in altre parti del codice.
	 * @param {Function} fn - La funzione che deve essere eseguita quando si verifica l'evento "invalid".
	 * @returns {HTMLElement} L'elemento a cui è stato aggiunto il gestore di eventi "invalid".
	 */
	jdm_onInvalid(fn = () => {}) {
		// Utilizza la funzione addEventListener() per aggiungere un gestore di eventi "invalid" all'elemento
		this.node.addEventListener('invalid', fn);
		// Restituisce l'elemento stesso
		return this.node;
	}

	/**
	 * Aggiunge un gestore di eventi "load" all'elemento e restituisce l'elemento.
	 * Questa funzione aggiunge un gestore di eventi "load" a un elemento specifico e restituisce l'elemento stesso. La funzione addEventListener() viene utilizzata per aggiungere l'evento "load" all'elemento.
	 * Il parametro fn rappresenta la funzione che deve essere eseguita quando si verifica l'evento "load". Se non viene fornita alcuna funzione, viene utilizzata una funzione vuota di default.
	 * La funzione restituisce l'elemento a cui è stato aggiunto il gestore di eventi "load", in modo che possa essere ulteriormente elaborato o utilizzato in altre parti del codice.
	 * @param {Function} fn - La funzione che deve essere eseguita quando si verifica l'evento "load".
	 * @returns {HTMLElement} L'elemento a cui è stato aggiunto il gestore di eventi "load".
	 */
	jdm_onLoad(fn = () => {}) {
		// Viene utilizzata la funzione addEventListener() per aggiungere l'evento "load" all'elemento specifico
		this.node.addEventListener('load', fn);
		// La funzione restituisce l'elemento a cui è stato aggiunto il gestore di eventi "load"
		return this.node;
	}

	/**
	 * Aggiunge un listener per gestire gli errori generati dal nodo specificato.
	 * La funzione prende come parametro una funzione che verrà eseguita quando viene generato un errore sul nodo specificato.
	 * Se la funzione non viene fornita, viene utilizzata una funzione vuota come valore predefinito.
	 * @param {Function} [fn=() => {}] - La funzione che gestisce l'errore.
	 * @returns {Object} - L'oggetto del nodo a cui è stato aggiunto il listener per l'errore.
	 */
	jdm_onError(fn = () => {}) {
		// Aggiunge un listener per l'evento 'error' al nodo.
		this.node.addEventListener('error', fn);
		// Restituisce l'oggetto del nodo per consentire l'utilizzo di altre funzioni su di esso.
		return this.node;
	}

	/**
	 * Associa una funzione all'evento di submit del nodo corrente.
	 * @param {function} fn - La funzione da associare all'evento di submit.
	 * @returns {HTMLElement} Il nodo corrente a cui è stata associata la funzione.
	 */
	jdm_onSubmit(fn = () => {}) {
		// Aggiunge un ascoltatore di eventi all'elemento corrente, che verrà attivato quando viene inviato il form
		this.node.addEventListener('submit', fn);
		// Restituisce l'elemento corrente
		return this.node;
	}

	/**
	 * Imposta il valore di un elemento del DOM
	 * @param {*} value - il valore da impostare sull'elemento del DOM
	 * @param tooBoolean - cerca di creare un booleano come valore (1 = true, 'true' = true)
	 * @returns {*} il nodo del DOM a cui è stato impostato il valore
	 */
	jdm_setValue(value, tooBoolean = true) {

		if (tooBoolean) {
			try {
				value = value.toBoolean()
			} catch (e) {
				value = value;
			}
		}


		// Verifica se l'elemento corrente è una casella di controllo o un pulsante di opzione
		if (this.node.type === 'checkbox' || this.node.type === 'radio') {
			// Imposta il valore della casella di controllo o del pulsante di opzione
			this.node.checked = value;
		}
		// Verifica se il tag corrente è un form
		else if (this.tag === 'form') {
			const setValue = (el, value) => {
				if (el.type === "checkbox" || el.type === "radio") {
					el.checked = value;
				} else {
					el.value = value;
				}
			}

			const findElement = (form, name) => {
				return form.querySelectorAll(`[name="${name}"]`);
			}

			const populateForm = (form, data, prefix = "") => {
				for (const key in data) {
					const value = data[key];
					const name = prefix ? `${prefix}[${key}]` : key;
					const elementList = findElement(form, Array.isArray(value) ? `${name}[]` : name);
					if (elementList?.length > 0) {
						for (const element of elementList) {
							if (Array.isArray(value)) {
								const checkboxes = form.querySelectorAll(`[name="${name}[]"]`);
								checkboxes.forEach((checkbox) => {
									setValue(checkbox, value.includes(checkbox.value));
								});
							} else if (typeof value === "object") {
								populateForm(form, value, name);
							} else {
								setValue(element, value);
							}
						}
					} else if (typeof value === "object") {
						populateForm(form, value, name);
					}
				}
			}
			populateForm(this.node, value);
		}

		// Altrimenti, imposta il valore dell'elemento corrente
		else {
			if (this.node.jdm_getAttribute('type') === 'number' || this.node.jdm_getAttribute('type') === 'range') {
				this.node.value = value * 1;
			} else {
				this.node.value = value;
			}
		}
		// Restituisce il nodo aggiornato
		return this.node;
	}


	/**
	 * Restituisce il valore dell'elemento HTML rappresentato dall'oggetto corrente.
	 * Se l'elemento è una casella di controllo (checkbox) o un pulsante di opzione (radio), restituisce true se l'elemento è selezionato, altrimenti false.
	 * Se l'elemento è un modulo (form), restituisce un oggetto con i valori dei campi d'input del modulo.
	 * Se l'elemento non è una casella di controllo, un pulsante di opzione o un modulo, restituisce il valore dell'elemento.
	 * @returns {(boolean|Object|string)} Il valore dell'elemento HTML.
	 */
	jdm_getValue() {
		// Se l'elemento corrente è un input di tipo checkbox o radio, restituisci il valore di "checked" del nodo HTML rappresentato dall'oggetto corrente
		if (this.tag === 'input' && (this.node.type === 'checkbox' || this.node.type === 'radio')) {
			return this.node.checked;
		}
		// Se l'elemento corrente è un modulo, restituisci un oggetto con i valori dei campi d'input del modulo
		else if (this.tag === 'form') {
			const formData = new FormData(this.node);
			const json = {};

			for (let [key, value] of formData.entries()) {

				value = (value === '') ? null : value;//todo check trim()
				value = (value === 'null') ? null : value; //todo check trim()
				let currentObj = json;
				const keys = key.split(/\[|\]\[|\]/).filter(Boolean);
				const lastKey = keys.pop();

				for (let i = 0; i < keys.length; i++) {
					const currentKey = keys[i];
					if (!currentObj[currentKey]) {
						currentObj[currentKey] = isNaN(keys[i + 1]) ? {} : [];
					}
					currentObj = currentObj[currentKey];
				}

				if (lastKey === "") {
					if (!currentObj.length) {
						currentObj.length = 0;
					}
					currentObj[currentObj.length++] = value;

				} else if (Array.isArray(currentObj[lastKey])) {

					currentObj[lastKey].push(value);
				} else if (currentObj[lastKey]) {

					currentObj[lastKey] = [currentObj[lastKey], value];
				} else {

					if (key.endsWith("[]")) {
						if (value) {
							currentObj[lastKey] = new Array;
							currentObj[lastKey].push(value);
						}
					} else {
						currentObj[lastKey] = value;
					}
				}
			}
			return json;
		}
		// Se l'elemento è una select (potrebbe avere il multiple)
		else if (this.tag === 'select') {
			//todo gestire il multiplo da controllare
			return this.node.value;
		}
		// In tutti gli altri casi, restituisci il valore dell'elemento HTML rappresentato dall'oggetto corrente
		else {
			return this.node.value;
		}
	}

	/**
	 * Genera un evento personalizzato sulla node corrente e opzionalmente lo propaga ai genitori.
	 * @param {string} name - Il nome dell'evento personalizzato.
	 * @param {*} [data=null] - Dati opzionali associati all'evento.
	 * @param {boolean} [propagateToParents=true] - Flag opzionale che indica se l'evento deve essere propagato ai genitori.
	 * @returns {HTMLElement} La node corrente.
	 */
	jdm_genEvent(name, data = null, propagateToParents = true) {
		// Chiamiamo la funzione "genEvent" dell'oggetto "_common" passando la node corrente come primo parametro, il nome dell'evento personalizzato come secondo parametro,
		// i dati associati all'evento come terzo parametro e un flag booleano che indica se l'evento deve essere propagato ai genitori come quarto parametro.
		_common.genEvent(this.node, name, data, propagateToParents);
		// Restituiamo la node corrente.
		return this.node;
	}

	/**
	 * Aggiunge un ascoltatore di eventi all'elemento HTML corrente.
	 * Il parametro name è di tipo string e rappresenta il nome dell'evento che l'ascoltatore deve attendere, ad esempio "click", "submit", "keyup", ecc.
	 * Il parametro fn è opzionale e rappresenta la funzione da eseguire quando l'evento viene attivato. Il valore predefinito è una funzione vuota.
	 * @param {string} name - Il nome dell'evento da ascoltare (ad esempio "click").
	 * @param {Function} [fn=() => {}] - La funzione da eseguire quando l'evento viene attivato. Default: una funzione vuota.
	 * @returns {HTMLElement} L'elemento HTML corrente con l'ascoltatore di eventi aggiunto.
	 */
	jdm_addEventListener(name, fn = () => {}) {
		// Aggiunge un listener per un evento specifico al nodo HTML rappresentato dall'oggetto "this.node"
		this.node.addEventListener(name, fn);
		// Restituisce il nodo HTML rappresentato dall'oggetto "this.node"
		return this.node;
	}

	/**
	 * Rimuove un gestore eventi precedentemente associato all'elemento.
	 *
	 * @function
	 * @param {string} name - Il nome dell'evento da rimuovere.
	 * @param {Function} [fn=() => {}] - La funzione gestore da rimuovere (impostata su una funzione vuota di default se non specificata).
	 * @returns {HTMLElement} - L'elemento HTML a cui è stata rimossa l'associazione dell'evento.
	 *
	 * @example
	 * const oggetto = new NomeDellaClasse();
	 * const nomeEvento = 'click';
	 * const gestoreEvento = () => {
	 *     // Logica del gestore evento
	 * };
	 * oggetto.node.addEventListener(nomeEvento, gestoreEvento);
	 * oggetto.jdm_removeEventListener(nomeEvento, gestoreEvento); // Rimuove il gestore evento.
	 */
	jdm_removeEventListener(name, fn = () => {}) {
		// Rimuove il gestore evento dall'elemento.
		this.node.removeEventListener(name, fn);
		return this.node;
	}

	/**
	 * Estende i nodi figli dell'oggetto `node` chiamando il metodo `jdm_extendNode`
	 * su ciascun nodo figlio presente in `jdm_childNode`.
	 *
	 * Questa funzione verifica se ci sono nodi figli definiti nell'oggetto `jdm_childNode`.
	 * Se presenti, itera su ciascun nodo figlio (coppie chiave-valore) e chiama il metodo
	 * `jdm_extendNode` passando la chiave e il valore del nodo figlio.
	 *
	 * @returns {Object} Ritorna l'oggetto `node` dopo aver esteso i nodi figli.
	 */
	jdm_extendChildNode() {
		// Controlla se ci sono nodi figli definiti in jdm_childNode
		if (this.node?.jdm_childNode && Object.entries(this.node.jdm_childNode).length > 0) {
			// Itera su ciascun nodo figlio (chiave-valore) in jdm_childNode
			for (const [key, value] of Object.entries(this.node.jdm_childNode)) {
				// Estende il nodo chiamando il metodo jdm_extendNode con chiave e valore
				this.node.jdm_extendNode(key, value);
			}
		}
		// Ritorna l'oggetto node per consentire ulteriori operazioni
		return this.node;
	}

}

window.Jdm = Jdm;
window.JdmData = JdmData;


//potresti generarmi la documentazione in lingua italiana con JSDOC per la seguente funzione in javascript? Potresti anche aggiungere commenti al codice con dei commenti javascript in italiano?
