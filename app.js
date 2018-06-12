const express = require('express');
const app = express();

const NodeRSA = require('node-rsa');
const crypto = require('crypto');
const fs = require('fs');

app.get('/register', (req, res) => {
  // check of de username of BSN al een key heeft
  createKey().then((keys) => {
    const cert = new NodeRSA(readServerKey('private')).encryptPrivate(keys.public, 'base64')
    // save public, private & cert to MongoDB /w username or BSN
    res.status(200).json({
      private: keys.private,
      cert: cert
    }).end()
  })
})

const serverPort = 80
app.listen(serverPort, () => {
  console.log(`Server online op poort ${serverPort}`)
})

// Maakt een RSA private & public key aan
const createKey = () => {
  return new Promise((resolve, reject) => {
    const key = new NodeRSA()
    key.generateKeyPair()
    const publicPem = key.exportKey('pkcs1-public-pem')
    const privatePem = key.exportKey('pkcs1-private-pem')
    resolve({
      private: privatePem,
      public: publicPem
    })
  })
}

// Maakt een digitale handtekening van data
const createSignature = (data, privateKey) => {
  return new Promise((resolve, reject) => {
    let hash = crypto.createHash('sha256').update(data).digest('hex')
    const objectPrivatePem = new NodeRSA(privateKey)
    const encrypted = objectPrivatePem.encryptPrivate(hash, 'base64')
    resolve(encrypted)
  })
}

// Decrypt een signature naar een hash van de data
const verifySignature = (signature, publicKey) => {
  return new Promise(function(resolve, reject) {
    const objectPublicPem = new NodeRSA(publicKey)
    const decrypted = objectPublicPem.decryptPublic(signature, 'utf-8')
    resolve(decrypted)
  })
}

// Leest de server keys
const readServerKey = (type) => {
  const key = fs.readFileSync(`./certificate/${type}.pem`, {encoding: 'utf-8'})
  return key
}

// Maakt server key aan (voor eenmalig gebruik)
const createServerKey = () => {
  return new Promise(function(resolve, reject) {
    createKey().then((serverKeys) => {
      fs.writeFile('./certificate/private.pem', serverKeys.private, function (err) {
        if (err)
          return console.log(err);
          console.log('Wrote private key to file');
      });
      fs.writeFile('./certificate/public.pem', serverKeys.public, function (err) {
        if (err)
          return console.log(err);
          console.log('Wrote public key to file');
      });
    }).catch(console.error)
  }).catch(console.error)
}

/*
createKey().then((keys) => {
  let data = 'Hello RSA world'
  createSignature(data, keys.private).then((signature) => {
    verifySignature(signature, keys.public).then((hash) => {
      let hash2 = crypto.createHash('sha256').update(data).digest('hex')
      if(hash === hash2){
        console.log('valid')
      } else {
        console.log('not valid')
      }
    })
  }).catch(console.error)
}).catch(console.error)
*/
