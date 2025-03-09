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
// Then import the expo router
import 'expo-router/entry';