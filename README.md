## Classes

<dl>
<dt><a href="#TooEasyRial">TooEasyRial</a></dt>
<dd><p>Sistema per la generazione automatica di tutorial basati su un file di configurazione JSON.</p>
</dd>
</dl>

## Constants

<dl>
<dt><a href="#example">example</a> : <code><a href="#NotificationConfig">NotificationConfig</a></code></dt>
<dd><p>Esempio di json di configurazione.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#language">language(lang)</a> ⇒ <code><a href="#TooEasyRial">TooEasyRial</a></code></dt>
<dd><p>Imposta la lingua del tutorial.</p>
<p>Questo metodo consente di cambiare la lingua del tutorial in base al parametro fornito.
La lingua sarà utilizzata per localizzare il contenuto, i messaggi e le interazioni del tutorial.
Di default viene impostata la lingua &#39;IT&#39;</p>
</dd>
<dt><a href="#genNotification">genNotification([text], [autoDestroyMs])</a> ⇒ <code>void</code></dt>
<dd><p>Crea e visualizza una notifica per il tutorial.</p>
<p>Questo metodo crea una notifica dinamica che viene mostrata nella sezione delle notifiche del tutorial.
La notifica viene automaticamente rimossa dopo il tempo specificato in millisecondi.
Se non viene specificato un tempo di distruzione, la notifica verrà rimossa dopo 2500 millisecondi (2.5 secondi).</p>
</dd>
<dt><a href="#goToNextStep">goToNextStep()</a> ⇒ <code>boolean</code></dt>
<dd><p>Naviga al passo successivo del tutorial.</p>
<p>Questo metodo incrementa il contatore del passo e naviga al passo successivo. Se il passo corrente è l&#39;ultimo,
il contatore non verrà incrementato. La navigazione è gestita dal metodo <code>goToStep()</code>,
che aggiorna lo stato del tutorial e la visualizzazione del passo.</p>
</dd>
<dt><a href="#goToPrevStep">goToPrevStep()</a> ⇒ <code>boolean</code></dt>
<dd><p>Naviga al passo precedente del tutorial.</p>
<p>Questo metodo riduce il contatore del passo e naviga indietro al passo precedente.
Se il passo corrente è il primo, il contatore viene resettato a 0. La navigazione è gestita dal metodo <code>goToStep()</code>,
che aggiorna lo stato del tutorial e la visualizzazione del passo.</p>
</dd>
<dt><a href="#goToStep">goToStep(counter, [skipToNext])</a> ⇒ <code>void</code></dt>
<dd><p>Naviga verso un passo specifico del tutorial e aggiorna il progresso.</p>
<p>Questo metodo si occupa di verificare se l&#39;elemento relativo al passo è visibile. Se non lo è,
viene mostrata una notifica e, a seconda del parametro <code>skipToNext</code>, il tutorial prosegue al passo successivo o precedente.
Se l&#39;elemento è visibile, aggiorna lo stato del tutorial e crea una &quot;maschera&quot; per il passo corrente.</p>
</dd>
<dt><a href="#autoplay">autoplay()</a> ⇒ <code>void</code></dt>
<dd><p>Avvia la modalità autoplay per il tutorial, proseguendo automaticamente tra i passi.</p>
<p>Questo metodo nasconde il pulsante di autoplay e mostra il pulsante per fermarlo. Inoltre, gestisce
la barra di progresso che si aggiorna durante l&#39;autoplay. Se il passo corrente non è visibile o se si
arriva all&#39;ultimo passo, l&#39;autoplay si ferma automaticamente.
La durata di ogni passo può essere configurata tramite <code>autoPlayTimerMs</code> nel file json di configurazione.</p>
</dd>
<dt><a href="#stopAutoplay">stopAutoplay()</a> ⇒ <code>void</code></dt>
<dd><p>Ferma la modalità autoplay del tutorial e ripristina lo stato del tutorial.</p>
<p>Questo metodo nasconde il pulsante per fermare l&#39;autoplay e mostra nuovamente il pulsante per avviarlo.
Inoltre, ferma l&#39;intervallo di autoplay e ripristina la barra di progresso al suo stato iniziale.</p>
</dd>
<dt><a href="#destroy">destroy()</a> ⇒ <code>void</code></dt>
<dd><p>Distrugge e rimuove il tutorial dal DOM, e ripristina gli event listener.</p>
<p>Questo metodo avvia un&#39;animazione di uscita sul contenitore del tutorial, rimuove l&#39;event listener associato
alla pressione dei tasti e distrugge il contenitore del tutorial dal DOM. Una volta completata l&#39;animazione,
il tutorial viene rimosso definitivamente.</p>
</dd>
<dt><a href="#keydown">keydown(e)</a> ⇒ <code>void</code></dt>
<dd><p>Gestisce gli eventi di pressione dei tasti durante il tutorial.</p>
<p>Questo metodo è legato all&#39;evento <code>keydown</code> e gestisce le seguenti azioni in base al tasto premuto:</p>
<ul>
<li><strong>Freccia sinistra (←)</strong>: Naviga al passo precedente.</li>
<li><strong>Freccia destra (→)</strong>: Naviga al passo successivo.</li>
<li><strong>Esc</strong>: Distrugge il tutorial e rimuove il tutorial dal DOM.</li>
<li><strong>Barra spaziatrice</strong>: Avvia o ferma l&#39;autoplay del tutorial.</li>
</ul>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#NotificationConfig">NotificationConfig</a> : <code>Object</code></dt>
<dd><p>Struttura della configurazione per le notifiche.</p>
</dd>
<dt><a href="#NotificationItem">NotificationItem</a> : <code>Object</code></dt>
<dd><p>Struttura di ciascun elemento di notifica nella lista.</p>
</dd>
</dl>

<a name="example"></a>

## example : [<code>NotificationConfig</code>](#NotificationConfig)
Esempio di json di configurazione.

**Kind**: global constant  
<a name="language"></a>

## language(lang) ⇒ [<code>TooEasyRial</code>](#TooEasyRial)
Imposta la lingua del tutorial.

Questo metodo consente di cambiare la lingua del tutorial in base al parametro fornito.
La lingua sarà utilizzata per localizzare il contenuto, i messaggi e le interazioni del tutorial.
Di default viene impostata la lingua 'IT'

**Kind**: global function  
**Returns**: [<code>TooEasyRial</code>](#TooEasyRial) - L'istanza corrente per il chaining dei metodi.  

| Param | Type | Description |
| --- | --- | --- |
| lang | <code>string</code> | Il codice della lingua da impostare, ad esempio "it" per l'italiano o "en" per l'inglese. |

**Example**  
```js
const tutorial = new TooEasyRial("#container", "https://api.example.com/tutorial.json").language("en");
```
<a name="genNotification"></a>

## genNotification([text], [autoDestroyMs]) ⇒ <code>void</code>
Crea e visualizza una notifica per il tutorial.

Questo metodo crea una notifica dinamica che viene mostrata nella sezione delle notifiche del tutorial.
La notifica viene automaticamente rimossa dopo il tempo specificato in millisecondi.
Se non viene specificato un tempo di distruzione, la notifica verrà rimossa dopo 2500 millisecondi (2.5 secondi).

**Kind**: global function  
**Returns**: <code>void</code> - Non restituisce un valore, ma modifica direttamente il DOM per mostrare la notifica.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [text] | <code>string</code> | <code>&quot;&#x60;Step N. ${this.counter + 1} non visualizzabile&#x60;&quot;</code> | Il testo da visualizzare nella notifica. Se non viene fornito, il testo predefinito indicherà che il passo corrente non è visualizzabile. |
| [autoDestroyMs] | <code>number</code> \| <code>null</code> | <code>2500</code> | Il tempo (in millisecondi) dopo il quale la notifica verrà automaticamente rimossa. Se il valore è maggiore di zero, la notifica verrà rimossa dopo il tempo specificato. |

**Example**  
```js
const tutorial = new TooEasyRial("#container", "https://api.example.com/tutorial");
tutorial.genNotification("Questo è un messaggio di notifica.", 3000); // La notifica scomparirà dopo 3 secondi.
```
<a name="goToNextStep"></a>

## goToNextStep() ⇒ <code>boolean</code>
Naviga al passo successivo del tutorial.

Questo metodo incrementa il contatore del passo e naviga al passo successivo. Se il passo corrente è l'ultimo,
il contatore non verrà incrementato. La navigazione è gestita dal metodo `goToStep()`,
che aggiorna lo stato del tutorial e la visualizzazione del passo.

**Kind**: global function  
**Returns**: <code>boolean</code> - Restituisce `true` se la navigazione al passo successivo è avvenuta correttamente,
altrimenti `false` (ad esempio, se non è possibile navigare oltre l'ultimo passo).  
**Example**  
```js
const tutorial = new TooEasyRial("#container", "https://api.example.com/tutorial");
tutorial.goToNextStep(); // Naviga al passo successivo.
```
<a name="goToPrevStep"></a>

## goToPrevStep() ⇒ <code>boolean</code>
Naviga al passo precedente del tutorial.

Questo metodo riduce il contatore del passo e naviga indietro al passo precedente.
Se il passo corrente è il primo, il contatore viene resettato a 0. La navigazione è gestita dal metodo `goToStep()`,
che aggiorna lo stato del tutorial e la visualizzazione del passo.

**Kind**: global function  
**Returns**: <code>boolean</code> - Restituisce `true` se la navigazione al passo precedente è avvenuta correttamente,
altrimenti `false` (ad esempio, se non è possibile navigare oltre il primo passo).  
**Example**  
```js
const tutorial = new TooEasyRial("#container", "https://api.example.com/tutorial");
tutorial.goToPrevStep(); // Naviga al passo precedente.
```
<a name="goToStep"></a>

## goToStep(counter, [skipToNext]) ⇒ <code>void</code>
Naviga verso un passo specifico del tutorial e aggiorna il progresso.

Questo metodo si occupa di verificare se l'elemento relativo al passo è visibile. Se non lo è,
viene mostrata una notifica e, a seconda del parametro `skipToNext`, il tutorial prosegue al passo successivo o precedente.
Se l'elemento è visibile, aggiorna lo stato del tutorial e crea una "maschera" per il passo corrente.

**Kind**: global function  
**Returns**: <code>void</code> - Non restituisce un valore, ma modifica direttamente lo stato e il DOM per aggiornare il tutorial.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| counter | <code>number</code> |  | L'indice del passo a cui navigare nella lista dei passi. |
| [skipToNext] | <code>boolean</code> | <code>true</code> | Se `true`, salta al passo successivo se il passo corrente non è visibile. Se `false`, salta al passo precedente. |

**Example**  
```js
const tutorial = new TooEasyRial("#container", "https://api.example.com/tutorial");
tutorial.goToStep(2); // Naviga al terzo passo.
```
<a name="autoplay"></a>

## autoplay() ⇒ <code>void</code>
Avvia la modalità autoplay per il tutorial, proseguendo automaticamente tra i passi.

Questo metodo nasconde il pulsante di autoplay e mostra il pulsante per fermarlo. Inoltre, gestisce
la barra di progresso che si aggiorna durante l'autoplay. Se il passo corrente non è visibile o se si
arriva all'ultimo passo, l'autoplay si ferma automaticamente.
La durata di ogni passo può essere configurata tramite `autoPlayTimerMs` nel file json di configurazione.

**Kind**: global function  
**Returns**: <code>void</code> - Non restituisce un valore, ma avvia la modalità autoplay e aggiorna il DOM per riflettere il cambiamento.  
**Example**  
```js
const tutorial = new TooEasyRial("#container", "https://api.example.com/tutorial");
tutorial.autoplay(); // Avvia l'autoplay del tutorial.
```
<a name="stopAutoplay"></a>

## stopAutoplay() ⇒ <code>void</code>
Ferma la modalità autoplay del tutorial e ripristina lo stato del tutorial.

Questo metodo nasconde il pulsante per fermare l'autoplay e mostra nuovamente il pulsante per avviarlo.
Inoltre, ferma l'intervallo di autoplay e ripristina la barra di progresso al suo stato iniziale.

**Kind**: global function  
**Returns**: <code>void</code> - Non restituisce un valore, ma ferma l'autoplay e ripristina il DOM per riflettere il cambiamento.  
**Example**  
```js
const tutorial = new TooEasyRial("#container", "https://api.example.com/tutorial");
tutorial.stopAutoplay(); // Ferma l'autoplay del tutorial.
```
<a name="destroy"></a>

## destroy() ⇒ <code>void</code>
Distrugge e rimuove il tutorial dal DOM, e ripristina gli event listener.

Questo metodo avvia un'animazione di uscita sul contenitore del tutorial, rimuove l'event listener associato
alla pressione dei tasti e distrugge il contenitore del tutorial dal DOM. Una volta completata l'animazione,
il tutorial viene rimosso definitivamente.

**Kind**: global function  
**Returns**: <code>void</code> - Non restituisce un valore, ma rimuove il tutorial e le risorse associate dal DOM.  
**Example**  
```js
const tutorial = new TooEasyRial("#container", "https://api.example.com/tutorial");
tutorial.destroy(); // Distrugge il tutorial e lo rimuove dal DOM.
```
<a name="keydown"></a>

## keydown(e) ⇒ <code>void</code>
Gestisce gli eventi di pressione dei tasti durante il tutorial.

Questo metodo è legato all'evento `keydown` e gestisce le seguenti azioni in base al tasto premuto:
- **Freccia sinistra (←)**: Naviga al passo precedente.
- **Freccia destra (→)**: Naviga al passo successivo.
- **Esc**: Distrugge il tutorial e rimuove il tutorial dal DOM.
- **Barra spaziatrice**: Avvia o ferma l'autoplay del tutorial.

**Kind**: global function  
**Returns**: <code>void</code> - Non restituisce un valore, ma esegue l'azione appropriata in base al tasto premuto.  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>KeyboardEvent</code> | L'evento di pressione del tasto. |

**Example**  
```js
// Aggiunge l'event listener per la gestione dei tasti
document.addEventListener("keydown", tutorial.keydown);

// Gestisce i tasti per:
// Freccia sinistra: passo precedente
// Freccia destra: passo successivo
// Esc: distruggere il tutorial
// Barra spaziatrice: avviare o fermare l'autoplay
```
<a name="NotificationConfig"></a>

## NotificationConfig : <code>Object</code>
Struttura della configurazione per le notifiche.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| fontFamily | <code>string</code> | La famiglia del font per il testo. |
| bgColor | <code>string</code> | Il colore di sfondo delle notifiche in formato rgba. |
| autoPlayTimerMs | <code>number</code> | Il tempo di attesa (in millisecondi) prima che la notifica successiva venga mostrata automaticamente. |
| showNotification | <code>boolean</code> | Indica se le notifiche devono essere visualizzate. |
| defaultNotification | <code>string</code> | Il messaggio di notifica predefinito, con un riferimento alla variabile `counter` per il passo corrente. |
| list | [<code>Array.&lt;NotificationItem&gt;</code>](#NotificationItem) | La lista di notifiche da visualizzare. |

<a name="NotificationItem"></a>

## NotificationItem : <code>Object</code>
Struttura di ciascun elemento di notifica nella lista.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| selector | <code>string</code> | Il selettore CSS dell'elemento a cui applicare la notifica. |
| position | <code>string</code> | La posizione della notifica (es. "right", "bottom", "left", "top"). |
| [positionMobile] | <code>string</code> | La posizione della notifica sui dispositivi mobili (opzionale). |
| message | <code>string</code> \| <code>Object</code> | Il messaggio della notifica, che può essere un testo o un contenuto HTML/iframe. |
| [notificationMessage] | <code>Object.&lt;string, string&gt;</code> | Messaggio personalizzato per la notifica, con versioni in diverse lingue (opzionale). |

