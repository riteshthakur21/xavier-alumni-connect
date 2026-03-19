 'use strict';

/**
 * AES-256-GCM authenticated encryption for chat message storage.
 *
 * Why AES-256-GCM over CBC:
 *   - GCM produces an authentication tag that verifies both integrity and
 *     authenticity of the ciphertext.  Any bit-flip or byte-substitution
 *     in the stored value is detected and rejected during decryption.
 *   - CBC provides confidentiality only; without a separate MAC it is
 *     vulnerable to padding-oracle and bit-flipping attacks.
 *
 * Storage format (all hex, colon-delimited):
 *   "<ivHex>:<ciphertextHex>:<authTagHex>"
 *
 *   ┌─────────────────┬──────────────────────────┬──────────────────┐
 *   │  IV (16 bytes)  │  Ciphertext (variable)   │  Tag (16 bytes)  │
 *   │  32 hex chars   │  2× plaintext bytes       │  32 hex chars    │
 *   └─────────────────┴──────────────────────────┴──────────────────┘
 *
 * Key source: process.env.MESSAGE_SECRET_KEY
 *   - Must be exactly 64 hex characters (representing 32 raw bytes / 256 bits)
 *   - Generate: node -e "process.stdout.write(require('crypto').randomBytes(32).toString('hex'))"
 *
 * The key is loaded and validated ONCE at module-require time.
 * A misconfigured key crashes the process on startup — intentionally —
 * so misconfiguration is caught before any request is served.
 */

const crypto = require('crypto');

// ── Constants ─────────────────────────────────────────────────────────────────

const ALGORITHM   = 'aes-256-gcm';
const IV_BYTES    = 16;          // 128-bit IV  (NIST recommended for GCM)
const TAG_BYTES   = 16;          // 128-bit auth tag (maximum GCM tag length)
const KEY_BYTES   = 32;          // 256-bit key
const KEY_HEX_LEN = KEY_BYTES * 2; // 64 hex characters

// ── Key bootstrap (runs at require-time) ─────────────────────────────────────

/**
 * Load and validate the encryption key from the environment.
 * Throws on any misconfiguration — deliberately crashes the server.
 *
 * @returns {Buffer}  32-byte encryption key
 */
function loadEncryptionKey() {
  const raw = process.env.MESSAGE_SECRET_KEY;

  if (!raw || raw.trim() === '') {
    throw new Error(
      '[Encryption] MESSAGE_SECRET_KEY is not set.\n' +
      'Generate a key with:\n' +
      "  node -e \"process.stdout.write(require('crypto').randomBytes(32).toString('hex'))\"\n" +
      'Then add MESSAGE_SECRET_KEY=<result> to your .env file.'
    );
  }

  if (!/^[0-9a-fA-F]+$/.test(raw)) {
    throw new Error(
      '[Encryption] MESSAGE_SECRET_KEY must contain only hexadecimal characters (0-9, a-f, A-F).'
    );
  }

  if (raw.length !== KEY_HEX_LEN) {
    throw new Error(
      `[Encryption] MESSAGE_SECRET_KEY must be exactly ${KEY_HEX_LEN} hex characters ` +
      `(${KEY_BYTES} bytes / 256 bits). ` +
      `Received ${raw.length} characters.`
    );
  }

  return Buffer.from(raw, 'hex');
}

// Single validated key buffer — shared across all encrypt/decrypt calls.
// Node.js module cache ensures this executes exactly once per process.
const ENCRYPTION_KEY = loadEncryptionKey();

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Encrypt a UTF-8 string using AES-256-GCM.
 *
 * A fresh 16-byte IV is generated for each call, ensuring that identical
 * plaintexts produce distinct ciphertexts (probabilistic encryption).
 *
 * @param  {string}  plaintext  Non-empty UTF-8 string to encrypt
 * @returns {string}            "<ivHex>:<ciphertextHex>:<authTagHex>"
 * @throws  {TypeError}         If plaintext is not a non-empty string
 */
function encrypt(plaintext) {
  if (typeof plaintext !== 'string' || plaintext.length === 0) {
    throw new TypeError('[Encryption] encrypt() requires a non-empty string.');
  }

  const iv     = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv, {
    authTagLength: TAG_BYTES,
  });

  // cipher.update() + cipher.final() together produce the full ciphertext.
  // Both calls must precede getAuthTag().
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag(); // Must be called after cipher.final()

  return [
    iv.toString('hex'),
    encrypted.toString('hex'),
    authTag.toString('hex'),
  ].join(':');
}

/**
 * Decrypt an AES-256-GCM ciphertext string produced by encrypt().
 *
 * The GCM auth tag is verified by Node.js crypto before any plaintext is
 * returned.  If the stored value was modified in any way — even a single
 * byte — decipher.final() throws an "Unsupported state or unable to
 * authenticate data" error, which the caller must handle.
 *
 * @param  {string}  encryptedText  "<ivHex>:<ciphertextHex>:<authTagHex>"
 * @returns {string}                Original UTF-8 plaintext
 * @throws  {Error}                 On invalid format, wrong key, or tampered data
 */
function decrypt(encryptedText) {
  if (typeof encryptedText !== 'string') {
    throw new TypeError('[Encryption] decrypt() requires a string argument.');
  }

  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    throw new Error(
      '[Encryption] Invalid ciphertext format. ' +
      'Expected "<ivHex>:<ciphertextHex>:<authTagHex>".'
    );
  }

  const [ivHex, ciphertextHex, authTagHex] = parts;

  // ── Format validation ───────────────────────────────────────────────────────

  if (ivHex.length !== IV_BYTES * 2) {
    throw new Error(
      `[Encryption] IV is ${ivHex.length} hex chars; expected ${IV_BYTES * 2}.`
    );
  }

  if (authTagHex.length !== TAG_BYTES * 2) {
    throw new Error(
      `[Encryption] Auth tag is ${authTagHex.length} hex chars; expected ${TAG_BYTES * 2}.`
    );
  }

  if (ciphertextHex.length === 0 || ciphertextHex.length % 2 !== 0) {
    throw new Error('[Encryption] Ciphertext hex string is malformed.');
  }

  if (!/^[0-9a-fA-F]+$/.test(ivHex + ciphertextHex + authTagHex)) {
    throw new Error('[Encryption] Ciphertext contains non-hex characters.');
  }

  // ── Decryption ──────────────────────────────────────────────────────────────

  const iv         = Buffer.from(ivHex, 'hex');
  const ciphertext = Buffer.from(ciphertextHex, 'hex');
  const authTag    = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv, {
    authTagLength: TAG_BYTES,
  });

  decipher.setAuthTag(authTag); // GCM verifies this in decipher.final()

  // decipher.final() verifies the auth tag. If it fails, it throws:
  // "Error: Unsupported state or unable to authenticate data"
  // This is the tamper-detection guarantee of AES-GCM.
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

/**
 * Heuristic check: does a stored string look like an AES-256-GCM ciphertext
 * produced by this module?
 *
 * Used for backward-compatibility: messages written before encryption was
 * enabled are plain text.  This function lets the service layer detect them
 * and return them as-is rather than attempting (and failing) decryption.
 *
 * This is NOT a cryptographic guarantee — it is a structural format check.
 *
 * @param  {string}  value
 * @returns {boolean}
 */
function isEncrypted(value) {
  if (typeof value !== 'string') return false;

  const parts = value.split(':');
  if (parts.length !== 3) return false;

  const [ivHex, ciphertextHex, authTagHex] = parts;
  const hexOnly = /^[0-9a-fA-F]+$/;

  return (
    ivHex.length        === IV_BYTES  * 2 &&
    authTagHex.length   === TAG_BYTES * 2 &&
    ciphertextHex.length > 0              &&
    ciphertextHex.length % 2 === 0        &&
    hexOnly.test(ivHex)                   &&
    hexOnly.test(ciphertextHex)           &&
    hexOnly.test(authTagHex)
  );
}

module.exports = { encrypt, decrypt, isEncrypted };
