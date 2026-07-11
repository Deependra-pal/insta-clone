const ImageKit = require("@imagekit/nodejs");

const imageKit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  endPoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

module.exports = imageKit;
