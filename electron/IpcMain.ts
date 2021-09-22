import { Bytes } from '@crypto-org-chain/chain-jslib/lib/dist/utils/bytes/bytes';

const { ipcMain } = require('electron');
import { LedgerSignerNative } from './LedgerSignerNative';
import { LedgerEthSigner } from './LedgerEthSigner';
export class IpcMain {
  provider: LedgerSignerNative;
  ethProvider: LedgerEthSigner;
  constructor() {
    this.provider = new LedgerSignerNative();
    this.ethProvider = new LedgerEthSigner();
  }
  setup() {
    ipcMain.on('asynchronous-message', (event: any, arg: any) => {
      event.reply('asynchronous-reply', 'pong');
    });

    ipcMain.on('synchronous-message', (event: any, arg: any) => {
      event.returnValue = 'pong';
    });

    ipcMain.on('enableWallet', async (event: any, arg: any) => {
      let ret = {};
      try {
        let index = arg.index;
        let addressPrefix = arg.addressPrefix;
        let showLedgerDisplay = arg.showLedgerDisplay;
        const info = await this.provider.enable(index, addressPrefix, showLedgerDisplay);
        let accountInfo = info[0];
        let accountPubKey = info[1].toUint8Array();
        ret = {
          success: true,
          account: accountInfo,
          pubKey: accountPubKey,
          label: 'enableWallet reply',
        };
      } catch (e) {
        ret = {
          success: false,
          error: e.toString(),
        };
        console.error('enableWallet error ' + e);
      } finally {
      }

      event.returnValue = ret;
    });
    // arg: string
    ipcMain.on('signMessage', async (event: any, arg: any) => {
      let ret = {};
      try {
        let argBuffer = Buffer.from(arg);
        let signature = await this.provider.sign(Bytes.fromBuffer(argBuffer));
        let signatureArray = signature.toUint8Array();
        ret = {
          success: true,
          signed: signatureArray,
          original: arg,
          label: 'signMessage reply',
        };
      } catch (e) {
        ret = {
          success: false,
          error: e.toString(),
        };
        console.error('signMessage error ' + e);
      }
      event.returnValue = ret;
    });
    // arg: string
    ipcMain.on('ethSignSendTx', async (event: any, arg: any) => {
      let ret = {};
      try {
        console.log('received= ', JSON.stringify(arg));
        /*
    url: string = 'http://127.0.0.1:8545',
    index: number = 0,
    chainId: number = 9000,
    gasLimit: string = '0x5000',
    gasPrice: string = '0x0400000000',
    to: string,

    value: string = '0x00',
    data: string = '0x',
        */

        const txhash = await this.ethProvider.signAndSendTx(
          arg.url,
          arg.index,
          arg.chainId,
          arg.gasLimit,
          arg.gasPrice,
          arg.to,
          arg.value,
          arg.data,
        );
        ret = {
          txhash,
          feedback: `${arg} world~~~~~~~~~~~~~~~~~~~~~~`,
          success: true,
          label: 'testMessage reply',
        };
      } catch (e) {
        ret = {
          success: false,
          error: e.toString(),
        };
        console.error('testMessage error ' + e);
      }
      event.returnValue = ret;
    });

    ipcMain.on('ethSignTx', async (event: any, arg: any) => {
      let ret = {};
      try {
        console.log('received= ', JSON.stringify(arg));
        /*
  index: number = 0,
    chainId: number = 9000,
    nonce: number = 0,
    gasLimit: string = '0x5000',
    gasPrice: string = '0x0400000000',
    
    to: string,
    value: string = '0x00',
    data: string = '0x',
        */

        const signedtx = await this.ethProvider.signTx(
          arg.index,
          arg.chainId,
          arg.nonce,
          arg.gasLimit,
          arg.gasPrice,

          arg.to,
          arg.value,
          arg.data,
        );
        ret = {
          signedtx,
          feedback: `${arg} world~~~~~~~~~~~~~~~~~~~~~~`,
          success: true,
          label: 'testMessage reply',
        };
      } catch (e) {
        ret = {
          success: false,
          error: e.toString(),
        };
        console.error('testMessage error ' + e);
      }
      event.returnValue = ret;
    });
  }
}
