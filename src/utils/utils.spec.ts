import 'mocha';
import { expect } from 'chai';

import { decodeUnicode, encodeUnicode } from './utils';

describe('Testing utils', () => {
  it('Test utf16 encode ', () => {
    const srcString = '香港홍콩a1';
    const encodedString = encodeUnicode(srcString);
    const expectedString = '\\u9999\\u6E2F\\uD64D\\uCF69\\u0061\\u0031';
    expect(encodedString).to.equal(expectedString);
  });

  it('Test utf16 encode for <', () => {
    const srcString = '<';
    const encodedString = encodeUnicode(srcString);
    const expectedString = '\\u003C';
    expect(encodedString).to.equal(expectedString);
  });

  it('Test utf16 encode for $', () => {
    const srcString = '$';
    const encodedString = encodeUnicode(srcString);
    const expectedString = '\\u0024';
    expect(encodedString).to.equal(expectedString);
  });

  it('Test utf16 decode ', () => {
    const srcString = '香港홍콩a1';
    const encodedString = encodeUnicode(srcString);
    const decodedString = decodeUnicode(encodedString);
    expect(decodedString).to.equal(srcString);
  });
});
