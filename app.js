const express = require('express');
const app = express();

const NodeRSA = require('node-rsa');
const key = new NodeRSA();



app.use((req, res, next) => {

  key.generateKeyPair();
  const publicPem = key.exportKey('pkcs1-public-pem');
  const privatePem = key.exportKey('pkcs1-private-pem');

  console.log('pkcs1 public: ', publicPem);
  console.log('pkcs1 private: ', privatePem);
  // const text = 'H';

  // const encrypted = key.encrypt(text);
  // console.log('encrypted: ', encrypted);
  // const decrypted = key.decrypt(encrypted, 'utf8');
  // console.log('decrypted: ', decrypted);

  console.log("key is private: ", key.isPrivate());
  console.log("key is public: ", key.isPublic());


  const objectPublicPem = new NodeRSA(publicPem);
  const objectPrivatePem = new NodeRSA(privatePem);
  console.log("publicPem is private: ", objectPublicPem.isPrivate());
  console.log("publicPem is public: ", objectPublicPem.isPublic(true));
  console.log("privatePem is private: ", objectPrivatePem.isPrivate());
  console.log("privatePem is public: ", objectPrivatePem.isPublic(true));
  // console.log("keypair is private: ", keypair.isPrivate());
  // console.log("keypair is public: ", keypair.isPublic());

  console.log('privatePem: ', objectPrivatePem);
  console.log('publicPem: ', objectPublicPem);
  next();
});



app.get('/', function (req, res) {
  console.log("");
  res.send("Hello world!");
});

// once, generate server keypair
// genKeypair()
// genCertificate(clientKeypair)
// decryptCerfiticate(clientCertificate)
// checkHash(clientPublicKey)

app.listen(3000, () => console.log('Example app listening on port 3000!'));