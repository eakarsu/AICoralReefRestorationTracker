'use strict';
const crypto=require('node:crypto');
function hashPassword(password){if(typeof password!=='string'||password.length<14)throw new Error('password must contain at least 14 characters');const salt=crypto.randomBytes(16);const hash=crypto.scryptSync(password,salt,64);return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;}
function verifyPassword(password,encoded){try{const [kind,saltHex,hashHex]=String(encoded||'').split('$');if(kind!=='scrypt')return false;const expected=Buffer.from(hashHex,'hex');const actual=crypto.scryptSync(password,Buffer.from(saltHex,'hex'),expected.length);return crypto.timingSafeEqual(expected,actual);}catch{return false;}}
module.exports={hashPassword,verifyPassword};
