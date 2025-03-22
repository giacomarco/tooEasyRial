import { Jdm } from "./libraries/jdm/1.0.0/js/jdm.js";
import { TutorialService } from "./toturial.service.js";

export class BoxTutorial {
	constructor(container, endpoint) {
		this.service = new TutorialService();
		this.container = new Jdm(container);
		this.endpoint = endpoint;
		this.counter = -1;
		this.playing = false;
		this.autoplayTimer = null;
		this.lang = "it";
		this.importCss();
		this.keydown = this.keydown.bind(this);

		this.init().then(() => {
			this.genEvent("onTutorialInit", this, this.container);
		});
		this.events();
	}

	async init() {
		this.data = await this.service.getData(this.endpoint);
		this.stepList = this.data.list;

		if (this.stepList?.length > 0) {
			this.genDom();
			this.genSvg();
		}
	}
	language(lang) {
		this.lang = lang;
		return this;
	}

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
		this.goToNextStep();
	}

	genNotification(text = `Step N. ${this.counter + 1} non visualizzabile`) {
		//language=html
		const domString = `<div class="notificationMessage">${text}</div>`;
		const message = new Jdm(domString, this.tutorialContainer.notificationCenter);
		setTimeout(message.jdm_destroy, 2500);
	}

	genBalloonStep(step, x, y, w, h) {
		this.balloon?.jdm_destroy();
		//language=html
		const domString = `
            <div class="balloon ${step.position}" >
                <div style="font-family: ${this.data.fontFamily || '"Courier New", Courier, monospace'}">${step.message[this.lang] || step.message}</div>
				<div class="navigatorContainer" data-name="navigatorContainer"></div>
            </div>
		`;

		this.balloon = new Jdm(domString, this.tutorialContainer, null, true).jdm_extendChildNode();
		this.genNavigator(this.balloon.navigatorContainer);

		const bboxBalloon = this.balloon.getBoundingClientRect();

		switch (step.position) {
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

	goToNextStep() {
		this.resetProgressBarCursor();
		this.counter = this.counter === this.stepList.length - 1 ? this.stepList.length - 1 : (this.counter += 1);
		const step = this.stepList[this.counter];
		const hole = this.container.querySelector(step.selector);
		if (!this.isPotentiallyVisible(hole)) {
			if (this.data.showNotification) {
				let text = this.stepList?.[this.counter]?.notificationMessage?.[this.lang] ?? this.stepList?.[this.counter]?.notificationMessage;
				this.genNotification(text);
			}
			if (this.counter < this.stepList.length - 1) {
				this.goToNextStep();
			}
		} else {
			this.updateCurrentStep(this.counter + 1);
			this.createMaskStep(this.stepList[this.counter]);
		}

		return this.counter < this.stepList.length - 1;
	}

	goToPrevStep() {
		this.resetProgressBarCursor();
		this.counter = this.counter <= 1 ? 0 : (this.counter -= 1);
		const step = this.stepList[this.counter];
		const hole = this.container.querySelector(step.selector);
		if (!this.isPotentiallyVisible(hole)) {
			if (this.data.showNotification) {
				this.genNotification();
			}
			this.goToPrevStep();
		}
		this.updateCurrentStep(this.counter + 1);
		this.createMaskStep(this.stepList[this.counter]);
		return this.counter > 1;
	}

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

	stopAutoplay() {
		this.playing = false;
		this.navigator.autoPlay.jdm_removeClassList("d-none");
		this.navigator.stopAutoplay.jdm_addClassList("d-none");
		clearInterval(this.autoplayTimer);
		this.resetProgressBarCursor();
	}

	resetProgressBarCursor() {
		if (this.navigator?.progressBarCursor) {
			this.navigator.progressBarCursor.style.transition = "none";
			this.navigator.progressBarCursor.style.width = "0%";
		}
	}

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

		this.genBalloonStep(step, x, y, w, h);
		const mask = document.createElementNS("http://www.w3.org/2000/svg", "path");
		mask.setAttribute("d", maskPath); // Imposta il path della maschera
		mask.setAttribute("fill", this.data.bgColor); // Colore di riempimento (nero semi-trasparente)

		// Applica la maschera (utilizzando la classe Jdm)
		this.mask = new Jdm(mask, this.svg);
	}

	updateCurrentStep(n) {
		this.navigator?.currentStep.jdm_innerHTML(n);
	}
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

	destroy() {
		this.animateCssCallBack({ element: this.tutorialContainer, addClass: ["fadeOut"], removeClass: ["fadeIn"] }).then(() => {
			document.removeEventListener("keydown", this.keydown);
			this.tutorialContainer.jdm_destroy();
		});
	}

	genEvent(name, data, node = document, propagateToParents = true, once = false) {
		node.dispatchEvent(new CustomEvent(name, { detail: data, bubbles: propagateToParents, once: once }));
	}

	uploadStyleDynamically(url) {
		return new Promise(resolve => {
			const existingScript = document.querySelector(`style[href="${url}"]`);
			if (existingScript) {
				resolve(true);
			} else {
				new Jdm("link", document.head)
					.jdm_setAttribute("href", url)
					.jdm_setAttribute("rel", "stylesheet")
					.jdm_setAttribute("type", "text/css")
					.jdm_onLoad(() => {
						resolve(true);
					});
			}
		});
	}

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

	importCss() {
		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = new URL("./tutorial.css", import.meta.url).href;
		document.head.appendChild(link);
	}

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
