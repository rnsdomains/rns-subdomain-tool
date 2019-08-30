var rnsLib = require('../lib/rns');
var assert = require('assert');

describe('Domain Validation should', () => {
  it(' say uppercase domain is invalid ', () => {
    assert.equal(rnsLib.isValidDomain('MERI.example.rsk'), false)
  });
  it(' say capitalized domain is invalid ', () => {
    assert.equal(rnsLib.isValidDomain('Meri.example.rsk'), false)
  });
  it(' say lowercase domain is valid ', () => {
    assert.equal(rnsLib.isValidDomain('meri.example.rsk'), true)
  });
  it(' say lowercase domain with separator - is valid ', () => {
    assert.equal(rnsLib.isValidDomain('meri-jane.example.rsk'), true)
  });
  it(' say lowercase domain with separator - twice is valid ', () => {
    assert.equal(rnsLib.isValidDomain('meri-jane-meri.example.rsk'), true)
  });
  it(' say lowercase domain ended in -', () => {
    assert.equal(rnsLib.isValidDomain('meri-.example.rsk'), false)
  });
  it(' say lowercase domain with special char is invalid ', () => {
    assert.equal(rnsLib.isValidDomain('meri$.example.rsk'), false)
  });
  it(' say three level domain is valid ', () => {
    assert.equal(rnsLib.isValidDomain('meri.example.rsk'), true)
  });
  it(' say two level domain is invalid ', () => {
    assert.equal(rnsLib.isValidDomain('meri.rsk'), false)
  });
  it(' say two level domain is invalid ', () => {
    assert.equal(rnsLib.isValidDomain('meri.rsk'), false)
  });
  it(' say one level domain is invalid ', () => {
    assert.equal(rnsLib.isValidDomain('meri'), false)
  });
  it(' say parent domain is invalid ', () => {
    assert.equal(rnsLib.isValidDomain('meri.invalid.rsk'), false)
  });
});