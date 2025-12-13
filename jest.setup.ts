import "@testing-library/jest-dom";

// Polyfills needed by Solana/Metaplex deps in Jest environment.
// (JSDOM doesn't always provide TextEncoder/TextDecoder depending on Node/Jest setup)
import { TextDecoder, TextEncoder } from "util";

(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;
