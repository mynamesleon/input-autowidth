import isPrintableKey from 'is-printable-keycode';

/**
 * set styles on an element
 */
function setCss(element: HTMLElement, styles: any) {
    if (!element) {
        return;
    }
    for (const prop in styles) {
        const style: string = typeof styles[prop] === 'number' ? styles[prop] + 'px' : styles[prop];
        element.style[prop] = style + ''; // force to be a string
    }
}

/**
 * transfer styles from one Element to another
 */
function transferStyles(from: HTMLElement, to: HTMLElement, properties: string[]) {
    if (!from || !to) {
        return;
    }
    const fromStyles: CSSStyleDeclaration = getComputedStyle(from);
    let styles: any = {};

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
 * get current user selection from within an input
 */
function getInputSelection(input: HTMLInputElement): { start: number; length: number } {
    const result: any = {};
    if ('selectionStart' in input) {
        result.start = input.selectionStart;
        result.length = input.selectionEnd - result.start;
    } else if ((document as any).selection) {
        (input as HTMLInputElement).focus();
        const selection = (document as any).selection.createRange();
        const selectionLength: number = selection.text.length;
        selection.moveStart('character', -(input as HTMLInputElement).value.length);
        result.start = selection.text.length - selectionLength;
        result.length = selectionLength;
    }
    return result;
}

let testSpan: HTMLSpanElement;

export class InputAutoWidth {
    options: any;
    input: HTMLInputElement;
    eventHandler: EventListenerObject;
    currentWidth: number;
    cache: any = {};

    constructor(input: HTMLInputElement, options?: any) {
        this.options = options;
        this.input = input;

        this.trigger();
        this.eventHandler = this.trigger.bind(this);
        this.input.addEventListener('blur', this.eventHandler);
        this.input.addEventListener('input', this.eventHandler);
        this.input.addEventListener('keyup', this.eventHandler);
        this.input.addEventListener('keydown', this.eventHandler);
    }

    measureString(str: string): number {
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
     * check the current input value and set width
     */
    trigger(event: any = {}) {
        if (event.metaKey || event.altKey) {
            return;
        }

        let value: string = this.input.value;
        if (event.type && event.type.toLowerCase() === 'keydown') {
            const keyCode: number = event.keyCode;
            const keyCodeIsDelete: boolean = keyCode === 46;
            const keyCodeIsBackspace: boolean = keyCode === 8;

            // delete or backspace
            if (keyCodeIsDelete || keyCodeIsBackspace) {
                const selection = getInputSelection(this.input);
                if (selection.length) {
                    value =
                        value.substring(0, selection.start) + value.substring(selection.start + selection.length);
                } else if (keyCodeIsBackspace && selection.start) {
                    value = value.substring(0, selection.start - 1) + value.substring(selection.start + 1);
                } else if (keyCodeIsDelete && selection.start !== undefined) {
                    value = value.substring(0, selection.start) + value.substring(selection.start + 1);
                }
            }

            // any other width affecting character
            else if (isPrintableKey(keyCode)) {
                let character: string = String.fromCharCode(keyCode);
                if (event.shiftKey) {
                    character = character.toUpperCase();
                } else {
                    character = character.toLowerCase();
                }
                value += character;
            }
        }

        let placeholder: string;
        if (!value && (placeholder = this.input.getAttribute('placeholder'))) {
            value = placeholder;
        }

        // a bit of extra space just in case
        let width: number = this.measureString(value) + 4;
        if (this.options && this.options.cache && this.cache) {
            this.cache[value] = width;
        }

        const minWidth: number = this.options && this.options.minWidth;
        if (typeof minWidth === 'number' && width < minWidth) {
            width = minWidth;
        }

        const maxWidth: number = this.options && this.options.maxWidth;
        if (typeof maxWidth === 'number' && width > maxWidth) {
            width = maxWidth;
        }

        if (width !== this.currentWidth) {
            this.currentWidth = width;
            this.input.style.width = `${width}px`;
        }
    }

    destroy() {
        this.input.removeEventListener('blur', this.eventHandler);
        this.input.removeEventListener('input', this.eventHandler);
        this.input.removeEventListener('keyup', this.eventHandler);
        this.input.removeEventListener('keydown', this.eventHandler);
        this.input = this.cache = null;
    }
}

export default InputAutoWidth;
