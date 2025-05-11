import 'fast-text-encoding';
import { Buffer } from 'buffer';
import 'react-native-get-random-values';
import '@ethersproject/shims';

global.Buffer = Buffer;

Buffer.prototype.subarray = function subarray(
    begin,
    end
  ) {
    const result = Uint8Array.prototype.subarray.apply(this, [begin, end]);
    Object.setPrototypeOf(result, Buffer.prototype); // Explicitly add the `Buffer` prototype (adds `readUIntLE`!)
    return result;
  };

import 'expo-router/entry';