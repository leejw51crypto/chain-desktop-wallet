import TransportHID from '@ledgerhq/hw-transport-node-hid';
import Eth from '@ledgerhq/hw-app-eth';
import { ethers, UnsignedTransaction } from 'ethers';
import Web3 from 'web3';
import { Transaction } from 'ethereumjs-tx';
import Common from 'ethereumjs-common';

export class LedgerEthSigner {
  public app: any;
  public transport: TransportHID | null;
  constructor() {
    this.transport = null;
  }

  async createTransport() {
    if (this.app === null || this.app === undefined) {
      const transport = await TransportHID.open('');
      this.app = new Eth(transport);
      this.transport = transport;
    }
  }

  async closeTransport() {
    if (this.transport != null) {
      this.transport.close();
      this.transport = null;
      this.app = null;
    }
  }

  async getAddress(index: number = 0): Promise<string> {
    try {
      console.log(`1   index=${index}`);
      const path: string = `44'/60'/0'/0/${index}`;
      await this.createTransport();
      console.log(`2 path ${path}`);
      const retAddress = await this.app.getAddress(path);
      console.log(`3 ${JSON.stringify(retAddress)}`);
      console.log(JSON.stringify(retAddress));
      return retAddress.address;
    } finally {
      await this.closeTransport();
    }
  }

  public static padZero(original_array: Uint8Array, wanted_length: number) {
    const new_array = new Uint8Array(wanted_length);
    for (let i = wanted_length - 1; i >= 0; i--) {
      const j = wanted_length - 1 - i;
      const new_i = original_array.length - 1 - j;
      if (new_i >= 0 && new_i < original_array.length) {
        new_array[i] = original_array[new_i];
      } else {
        new_array[i] = 0;
      }
    }

    return new_array;
  }

  // src: without 0x, wanted_length: in bytes
  public static padZeroString(src: string, wanted_length: number): string {
    const a1 = Buffer.from(src, 'hex');
    const a2 = LedgerEthSigner.padZero(a1, wanted_length);
    const a3 = Buffer.from(a2).toString('hex');
    return a3;
  }

  async doSignTx(
    path: string = "44'/60'/0'/0/0",
    chainId: number = 9000,
    nonce: number = 0,
    gasLimit: string = '0x5000',
    gasPrice: string = '0x0400000000',
    to: string,
    value: string = '0x00',
    data: string = '0x',
  ): Promise<string> {
    const web3 = new Web3('');
    const baseTx: ethers.utils.UnsignedTransaction = {
      chainId,
      data,
      gasLimit,
      gasPrice,
      nonce,
      to,
      value,
    };

    const unsignedTx = ethers.utils.serializeTransaction(baseTx).substring(2);
    const sig = await this.app.signTransaction(path, unsignedTx);
    // to prevent possible padding issue
    const sigR = LedgerEthSigner.padZeroString(sig.r, 32);
    const sigS = LedgerEthSigner.padZeroString(sig.s, 32);

    const ret = ethers.utils.serializeTransaction(baseTx, {
      v: ethers.BigNumber.from('0x' + sig.v).toNumber(),
      r: '0x' + sigR,
      s: '0x' + sigS,
    });

    console.log(`length: v ${sig.v}   r ${sig.r.length}    s ${sig.s.length}`);
    return ret;
  }

  async signTx(
    index: number = 0,
    chainId: number = 9000,
    nonce: number = 0,
    gasLimit: string = '0x5208',
    gasPrice: string = '0x04e3b29200',
    to: string,
    value: string = '0x00',
    data: string = '0x',
  ): Promise<string> {
    try {
      await this.createTransport();
      const path: string = `44'/60'/0'/0/${index}`;
      const signedTx = await this.doSignTx(
        path,
        chainId,
        nonce,
        gasLimit,
        gasPrice,
        to,
        value,
        data,
      );
      return signedTx;
    } finally {
      await this.closeTransport();
    }
  }

  async signAndSendTx(
    url: string = 'http://127.0.0.1:8545',
    index: number = 0,
    chainId: number = 9000,
    gasLimit: string = '0x5000',
    gasPrice: string = '0x0400000000',
    to: string,
    value: string = '0x00',
    data: string = '0x',
  ): Promise<string> {
    try {
      await this.createTransport();
      const path: string = `44'/60'/0'/0/${index}`;
      const web3 = new Web3(url);
      const from_addr = (await this.app.getAddress(path)).address;
      const nonce = await web3.eth.getTransactionCount(from_addr);
      const signedTx = await this.doSignTx(
        path,
        chainId,
        nonce,
        gasLimit,
        gasPrice,
        to,
        value,
        data,
      );
      const txHash = (await web3.eth.sendSignedTransaction(signedTx)).transactionHash;

      return txHash;
    } finally {
      await this.closeTransport();
    }
  }

  async test() {
    const transport = await TransportHID.open(''); // take first device
    const eth = new Eth(transport);
    const w = "44'/60'/0'/0/0";
    const w3 = "44'/60'/0'/0/1";
    const web3 = new Web3('http://127.0.0.1:8545');
    const from_addr = (await eth.getAddress(w)).address;
    const to_addr = (await eth.getAddress(w3)).address;
    const nonce = await web3.eth.getTransactionCount(from_addr);
    console.log('nonce= ', nonce, '  from address= ', from_addr);
    console.log('to address= ', to_addr);
    const baseTx: ethers.utils.UnsignedTransaction = {
      chainId: 9000,
      data: '0x',
      gasLimit: '0x5208',
      gasPrice: '0x04e3b29200',
      nonce: nonce,
      to: to_addr,
      value: web3.utils.toHex(web3.utils.toWei(web3.utils.toBN(1), 'ether')),
    };

    const unsignedTx = ethers.utils.serializeTransaction(baseTx).substring(2);
    const sig = await eth.signTransaction(w, unsignedTx);

    const b = ethers.utils.serializeTransaction(baseTx, {
      v: ethers.BigNumber.from('0x' + sig.v).toNumber(),
      r: '0x' + sig.r,
      s: '0x' + sig.s,
    });
    const d = ethers.utils.parseTransaction(b);
    console.log(b);
    console.log(d);

    const txHash = await web3.eth.sendSignedTransaction(b);
    console.log(txHash);
  }
}
