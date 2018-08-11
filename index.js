/** @module promise-trap */

/**
 * Returns whether the specified value is a Promises/A+ promise.
 * @param x The value to test.
 * @return True if, and only if, `x` is a promise, otherwise false.
 */
const isPromise = x => x && typeof x.then === "function";

/**
 * Returns a proxy that takes record of A+ promises, exposing an <tt>all</tt> method.
 * Promises will be recorded if returned from function or method invocations.
 * The special <tt>all</tt> method returns a promise that resolves when there
 * exists no recorded unresolved promises.
 * Note that this includes promises recorded after invoking <tt>all</tt>.
 * @param {!Object} target - The proxy target object.
 * @return {Proxy} The recording proxy.
 */
export default function promiseTrap(target) {
    const promises = []; // The pending promises
    return new Proxy(target, {
        get(target, property, receiver) {
            if (property === "all") {
                return () => new Promise(function(resolve, reject) {
                    (function test() {
                        const all = Promise.all(promises.splice(0));
                        promises.push(all);
                        all.finally(() => {
                            const i = promises.indexOf(all);
                            if (i !== -1) promises.splice(i, 1);
                        }).then(() => (promises.length === 0 ? resolve : test)(), reject);
                    })();
                });
            }

            const value = target[property];
            return typeof value === "function" ? function() {
                const result = value.apply(this, arguments);
                if (isPromise(result)) promises.push(result);
                return result;
            } : value;
        },
        apply(target, thisArg, argumentsList) {
            const result = target.apply(thisArg, argumentsList);
            if (isPromise(result)) promises.push(result);
            return result;
        }
    });
}
