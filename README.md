<a href="http://promisesaplus.com/">
	<img src="http://promisesaplus.com/assets/logo-small.png" alt="Promises/A+ logo"
		title="Promises/A+ 1.1 compliant" align="right" />
</a>

# promise-trap [![Build Status](https://travis-ci.org/axelf4/promise-trap.svg?branch=master)](https://travis-ci.org/axelf4/promise-trap)

Records promises enabling an easy `Promise.all`.

## Example

```javascript
const proxy = promiseTrap(fetch);
proxy.all().then(() => {
	// The two requests made below have resolved!
});
proxy(...); // Do some fetch requests
proxy(...);
```
