/**
 * File Name: imageKit.config.js
 * Purpose: Configuration for the ImageKit Node.js SDK client.
 * Responsibility: Initializes and exports the ImageKit SDK client instance to facilitate media uploads.
 *
 * Configuration Requirements:
 * - IMAGEKIT_PRIVATE_KEY: Required to authenticate server-to-server requests and sign upload requests. Must remain secret.
 * - IMAGEKIT_PUBLIC_KEY: Required by the SDK to identify the ImageKit account.
 * - IMAGEKIT_URL_ENDPOINT: The base URL for retrieving and serving images stored in the ImageKit media library.
 */

const ImageKit = require("@imagekit/nodejs");

// Initialize ImageKit instance with environment variables
const imageKit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  endPoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

module.exports = imageKit;
