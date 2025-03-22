/**
 * Classe che contiene una lista di prototype.
 * @class
 */
export class Proto {

	constructor() {
		/**
		 * Converte una stringa in un booleano, seguendo le regole indicate di seguito:
		 * - La stringa "true" o "1" viene convertita in true.
		 * - La stringa "false" o "0" viene convertita in false.
		 * - Se la stringa non corrisponde a nessuno di questi valori, viene generata un'eccezione.
		 *
		 * @function
		 * @memberof String.prototype
		 * @returns {boolean} Restituisce un booleano in base al valore della stringa.
		 * @throws {Error} Se la stringa non è una stringa booleana valida.
		 * @example
		 * const myString = 'True';
		 * const myBoolean = myString.toBoolean();
		 * console.log(myBoolean); // Output: true
		 */
		String.prototype.toBoolean = function() {
			// Converti la stringa in caratteri minuscoli e rimuovi gli spazi bianchi.
			const lowerCaseString = this.toLowerCase().trim();
			// Confronta la stringa minuscola senza spazi bianchi con i valori booleani validi.
			if (lowerCaseString === 'yes' || lowerCaseString === 'true' || lowerCaseString === '1') {
				return true;
			} else if (lowerCaseString === 'no' || lowerCaseString === 'false' || lowerCaseString === '0') {
				return false;
			} else {
				// Se la stringa non corrisponde a nessun valore booleano valido, genera un'eccezione.
				throw new Error(`Invalid boolean string: ${this}`);
			}
		};

		String.prototype.toCapitalize = function() {
			return this.charAt(0).toUpperCase() + this.slice(1);
		};

		/**
		 * Aggiunge al prototipo di Number un metodo toBoolean che converte il numero in una stringa
		 * e applica la funzione toBoolean della stringa.
		 * @returns {boolean} Il valore booleano corrispondente alla stringa convertita dal numero.
		 * @throws {Error} Se la stringa non corrisponde a nessun valore booleano valido.
		 */
		Number.prototype.toBoolean = function() {
			// Converti il numero in una stringa e applica la funzione toBoolean della stringa.
			return String(this).toBoolean();
		};
	}
}
