import isPrintableKey from 'is-printable-keycode';

/**
 * @description set styles on an element
 * @param {Element} element
 * @param {Object} s
 */
function setCss(element, s) {
    if (!element) {
        return;
    }
    for (let i in s) {
        const style = typeof s[i] === 'number' ? s[i] + 'px' : s[i];
        element.style[i] = style + ''; // force to be a string
    }
}

/**
 * @description transfer styles from one Element to another
 * @param {Element} from
 * @param {Element} to
 * @param {Array=} properties
 */
function transferStyles(from, to, properties) {
    if (!from || !to) {
        return;
    }
    const fromStyles = getComputedStyle(from);
    let styles = {};

    if (properties && properties.length) {
        for (let i = 0, l = properties.length; i < l; i += 1) {
            styles[properties[i]] = fromStyles[properties[i]];
        }
    } else {
        styles = fromStyles;
    }

    setCss(to, styles);
}

/**
 * @description get current user selection from within the input
 * @param {Element} input
 * @returns {Object} with start and length properties
 */
function getInputSelection(input) {
    const result = {};
    if ('selectionStart' in input) {
        result.start = input.selectionStart;
        result.length = input.selectionEnd - result.start;
    } else if (document.selection) {
        input.focus();
        const selection = document.selection.createRange();
        const selectionLength = selection.text.length;
        selection.moveStart('character', -input.value.length);
        result.start = selection.text.length - selectionLength;
        result.length = selectionLength;
    }
    return result;
}

/**
 * @description storage for element used to detect value width
 */
let testSpan;

/**
 * @description set an input element to autogrow based on its value
 * @param {Element} input
 * @param {Object} options minLength, maxLength, and cache
 */
export default class InputAutoWidth {
    constructor(input, options) {
        this.options = options;
        this.input = input;
        this.eventHandler;
        this.currentWidth;
        this.cache = {}; // cache widths

        this.trigger();
        this.eventHandler = this.trigger.bind(this);
        this.input.addEventListener('blur', this.eventHandler);
        this.input.addEventListener('input', this.eventHandler);
        this.input.addEventListener('keyup', this.eventHandler);
        this.input.addEventListener('keydown', this.eventHandler);
    }

    /**
     * @description measure the pixel width of a string in an input
     * @param {String} str
     * @returns {Number}
     */
    measureString(str) {
        if (!str) {
            return 0;
        }

        // return cached number
        if (this.cache && typeof this.cache[str] === 'number') {
            return this.cache[str];
        }

        if (!testSpan) {
            testSpan = document.createElement('span');
            setCss(testSpan, {
                position: 'absolute',
                top: -99999,
                left: -99999,
                width: 'auto',
                padding: 0,
                whiteSpace: 'pre'
            });
            document.body.appendChild(testSpan);
        }

        testSpan.textContent = str;
        transferStyles(this.input, testSpan, [
            'letterSpacing',
            'fontSize',
            'fontFamily',
            'fontWeight',
            'textTransform'
        ]);

        return testSpan.offsetWidth || testSpan.clientWidth;
    }

    /**
     * @description check the current input value and set width
     * @param {Event} event
     */
    trigger(event = {}) {
        if (event.metaKey || event.altKey) {
            return;
        }

        let value = this.input.value;
        if (event.type && event.type.toLowerCase() === 'keydown') {
            const keyCode = event.keyCode;
            const keyCodeIsDelete = keyCode === 46;
            const keyCodeIsBackspace = keyCode === 8;

            // delete or backspace
            if (keyCodeIsDelete || keyCodeIsBackspace) {
                const selection = getInputSelection(this.input);
                if (selection.length) {
                    value =
                        value.substring(0, selection.start) +
                        value.substring(selection.start + selection.length);
                } else if (keyCodeIsBackspace && selection.start) {
                    value =
                        value.substring(0, selection.start - 1) +
                        value.substring(selection.start + 1);
                } else if (keyCodeIsDelete && selection.start !== undefined) {
                    value =
                        value.substring(0, selection.start) +
                        value.substring(selection.start + 1);
                }
            }

            // any other width affecting character
            else if (isPrintableKey(keyCode)) {
                let character = String.fromCharCode(keyCode);
                if (event.shiftKey) {
                    character = character.toUpperCase();
                } else {
                    character = character.toLowerCase();
                }
                value += character;
            }
        }

        let placeholder;
        if (!value && (placeholder = this.input.getAttribute('placeholder'))) {
            value = placeholder;
        }

        // a bit of extra space just in case
        let width = this.measureString(value) + 4;
        if (this.options && this.options.cache && this.cache) {
            this.cache[value] = width;
        }

        const minWidth = this.options && this.options.minWidth;
        if (typeof minWidth === 'number' && width < minWidth) {
            width = minWidth;
        }

        const maxWidth = this.options && this.options.maxWidth;
        if (typeof maxWidth === 'number' && width > maxWidth) {
            width = maxWidth;
        }

        if (width !== this.currentWidth) {
            this.currentWidth = width;
            this.input.style.width = `${width}px`;
        }
    }

    /**
     * @description destroy the autogrow behaviour
     */
    destroy() {
        this.input.removeEventListener('blur', this.eventHandler);
        this.input.removeEventListener('input', this.eventHandler);
        this.input.removeEventListener('keyup', this.eventHandler);
        this.input.removeEventListener('keydown', this.eventHandler);
        this.input = this.cache = null;
    }
}
