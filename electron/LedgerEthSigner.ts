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
      const path: string = `44'/60'/0'/0/${index}`;
      await this.createTransport();
      const retAddress = await this.app.getAddress().address;
      return retAddress;
    } finally {
      await this.closeTransport();
    }
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
    const ret = ethers.utils.serializeTransaction(baseTx, {
      v: ethers.BigNumber.from('0x' + sig.v).toNumber(),
      r: '0x' + sig.r,
      s: '0x' + sig.s,
    });
    return ret;
  }

  async signTx(
    index: number = 0,
    chainId: number = 9000,
    nonce: number = 0,
    gasLimit: string = '0x5000',
    gasPrice: string = '0x0400000000',
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
