import "babel-polyfill";
import promiseTrap from "./index.js";

/** Returns a promise that is resolved after `i` ticks. */
const ticks = i => new Promise((resolve, reject) => (y => y(
    tick => n => n < 1 ? resolve() : setImmediate(() => tick(n - 1))
)(i))(le => (f => f(f))(f => le(x => (f(f))(x)))));

test("forward invocation return value", () => {
    expect(promiseTrap(() => 42)()).toBe(42);
});

test("forward property", () => {
    expect(promiseTrap({
        a: 4
    }).a).toBe(4);
});

test("trap function promise", () => {
    const callback = jest.fn();
    const proxy = promiseTrap(Promise.resolve.bind(Promise));
    proxy().then(callback);
    expect(callback).not.toBeCalled();
    return proxy.all().then(() => {
        expect(callback).toHaveBeenCalledTimes(1);
    });
});

test("trap method promise", () => {
    const callback = jest.fn();
    const proxy = promiseTrap({
        a() {
            return Promise.resolve();
        }
    });
    proxy.a().then(callback);
    expect(callback).not.toBeCalled();
    return proxy.all().then(() => {
        expect(callback).toHaveBeenCalledTimes(1);
    });
});

test("all with no queued", () =>
    expect(promiseTrap({}).all()).resolves.toBeUndefined()
);

test("two calls", async () => {
    const callback = jest.fn();
    const proxy = promiseTrap(ticks);
    proxy(1).then(callback);
    expect(callback).not.toBeCalled();
    proxy.all();
    await proxy.all();
    expect(callback).toHaveBeenCalledTimes(1);
});

/* See https://nodejs.org/api/process.html#process_process_nexttick_callback_args */
test("always asynchronous", () => {
    const callback = jest.fn();
    const proxy = promiseTrap(Promise.resolve.bind(Promise));
    const promise = proxy.all();
    proxy().then(callback);
    expect(callback).not.toBeCalled();
    return promise.then(() => {
        expect(callback).toHaveBeenCalledTimes(1);
    });
});

/*
 * This is intended behaviour. If unsatisfactory,
 * the workaround is symply to wrap the proxy in another private proxy,
 * used only for the first promise.
 */
test("pick up on latecomers", async () => {
    const callback = jest.fn();
    const proxy = promiseTrap(ticks);
    proxy(1).then(callback);
    const promise = proxy.all();
    proxy(2).then(callback);
    expect(callback).not.toBeCalled();
    await promise;
    expect(callback).toHaveBeenCalledTimes(2);
});
