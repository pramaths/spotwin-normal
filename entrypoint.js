import 'fast-text-encoding';
import 'react-native-get-random-values';
import { getRandomValues as expoCryptoGetRandomValues } from "expo-crypto";
import { Buffer } from 'buffer';
global.Buffer = Buffer;
import '@ethersproject/shims';

class Crypto {
    getRandomValues = expoCryptoGetRandomValues;
}
global.crypto = new Crypto();

const webCrypto = typeof crypto !== "undefined" ? crypto : new Crypto();

(() => {
    if (typeof crypto === "undefined") {
        Object.defineProperty(window, "crypto", {
            configurable: true,
            enumerable: true,
            get: () => webCrypto,
        });
    }
})();

if (typeof global.crypto === 'undefined') {
    global.crypto = new Crypto();
}

const webCrypto = typeof crypto !== "undefined" ? crypto : new Crypto();

// Ensure crypto is available in the window object
(() => {
    if (typeof crypto === "undefined") {
        Object.defineProperty(window, "crypto", {
            configurable: true,
            enumerable: true,
            get: () => webCrypto,
        });
    }
})();

// Polyfill for assert
if (typeof global.process === 'undefined') {
    global.process = {};
}
if (typeof global.process.env === 'undefined') {
    global.process.env = {};
}

// Add other Node.js globals that might be used
global.process.browser = true;
global.process.version = '';
global.process.versions = { node: 'N/A' }; 
// Then import the expo router
import 'expo-router/entry';