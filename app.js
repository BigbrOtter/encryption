const express = require('express');
const app = express();

const NodeRSA = require('node-rsa');
const crypto = require('crypto');
const fs = require('fs');

const User = require('./user.model');

app.get('/findPublicKey', (req, res) => {
  const bsn = req.headers.bsn;
  User.findOne({bsn: bsn}).then((user) => {
    res.status(200).json({
      public: user.public
    }).end()
  }).catch(() => {
    res.status(400).json({
      error: `User with BSN '${bsn}' not found`
    }).end()
  })
});

// register route, zoekt of persoon al bestaat en anders maakt hij nieuwe keys
app.get('/register', (req, res) => {
  const bsn = req.headers.bsn;
  const naam = req.headers.naam;
  // check of de username of BSN al een key heeft
  User.findOne({bsn: bsn}).then((user) => {
    console.log(`Found user '${naam} with BSN '${bsn}' in the DB.`);
    res.status(200).json({
      private: user.private,
      cert: user.cert
    }).end()
  }).catch(() => {
    console.log(`Created new user '${naam} with BSN '${bsn}'`);
    createKey().then((keys) => {
      const cert = new NodeRSA(readServerKey('private')).encryptPrivate(keys.public, 'base64');
      const newUser = new User({
        bsn: bsn,
        naam: naam,
        private: keys.private,
        public: keys.public,
        cert: cert
      });
      newUser.save((err) => {
        if (err) throw err;
        console.log(`user saved!`)
      });
      res.status(200).json({
        private: keys.private,
        cert: cert
      }).end()
    })
  })
});

const serverPort = 8000;

app.listen(serverPort, () => {
  console.log(`Server online op poort ${serverPort}`)
});



// Maakt een RSA private & public key aan
const createKey = () => {
  return new Promise((resolve, reject) => {
    const key = new NodeRSA();
    key.generateKeyPair();
    const publicPem = key.exportKey('pkcs1-public-pem');
    const privatePem = key.exportKey('pkcs1-private-pem');
    resolve({
      private: privatePem,
      public: publicPem
    })
  })
};

// Maakt een digitale handtekening van data
const createSignature = (data, privateKey) => {
  return new Promise((resolve, reject) => {
    let hash = crypto.createHash('sha256').update(data).digest('hex');
    const objectPrivatePem = new NodeRSA(privateKey);
    const encrypted = objectPrivatePem.encryptPrivate(hash, 'base64');
    resolve(encrypted)
  })
};

// Decrypt een signature naar een hash van de data
const verifySignature = (signature, publicKey) => {
  return new Promise(function(resolve, reject) {
    const objectPublicPem = new NodeRSA(publicKey);
    const decrypted = objectPublicPem.decryptPublic(signature, 'utf-8');
    resolve(decrypted)
  })
};

// Leest de server keys
const readServerKey = (type) => {
  const key = fs.readFileSync(`./certificate/${type}.pem`, {encoding: 'utf-8'});
  return key
};

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
};

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



