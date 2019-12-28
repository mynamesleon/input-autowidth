# input-autowidth

Dependency-free JavaScript class to set an input's width based on its content

```
npm install input-autowidth
```

```javascript
import inputAutoWidth from 'input-autowidth';

new inputAutoWidth(document.getElementById('username'), {
    cache: false, // boolean
    minWidth: null, // number
    maxWidth: null // number
});
```

The returned class instance has the following properties and methods:

```typescript
{
    /**
     * @description input element the autowidth was bound to
     */
    input: Element;

    /**
     * @description current options
     */
    options: Object | undefined;

    /**
     * @description current input width
     */
    currentWidth: Number;

    /**
     * @description object of currently cached strings and their corresponding widths
     */
    cache: Object;

    /**
     * @description event handler bound to the blur, input, keyup, and keydown events on the input
     * stored to enable removing the event listeners
     */
    eventHandler: Function;

    /**
     * @description measure string method
     * @param {String} str
     * @returns {Number}
     */
    measureString: Function;

    /**
     * @description trigger a check on the original element
     */
    trigger: Function;

    /**
     * @description destroy the instance and unbind events - input width will remain set however
     */
    destroy: Function;
}
```
