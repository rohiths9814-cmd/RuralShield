import crypto from 'crypto';

/**
 * Key Generation Service
 * Phase 1: RSA-2048 (will be replaced with CRYSTALS-Kyber in Phase 2)
 */
const keyService = {
  /**
   * Generate an RSA-2048 key pair
   * @returns {{ publicKey: string, privateKey: string }} PEM-encoded key pair
   */
  generateKeyPair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    return { publicKey, privateKey };
  },

  /**
   * Encrypt data with a public key
   * @param {string} data - Data to encrypt
   * @param {string} publicKeyPem - PEM-encoded public key
   * @returns {string} Base64-encoded encrypted data
   */
  encrypt(data, publicKeyPem) {
    const buffer = Buffer.from(data, 'utf-8');
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKeyPem,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      buffer
    );
    return encrypted.toString('base64');
  },

  /**
   * Decrypt data with a private key
   * @param {string} encryptedData - Base64-encoded encrypted data
   * @param {string} privateKeyPem - PEM-encoded private key
   * @returns {string} Decrypted data
   */
  decrypt(encryptedData, privateKeyPem) {
    const buffer = Buffer.from(encryptedData, 'base64');
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKeyPem,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      buffer
    );
    return decrypted.toString('utf-8');
  },
};

export default keyService;
