import { Bytes } from '@crypto-org-chain/chain-jslib/lib/dist/utils/bytes/bytes';
import { ISignerProvider } from './SignerProvider';

let electron: any;
if (window.require) {
  electron = window.require('electron');
}
export class IpcRender implements ISignerProvider {
  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  // eslint-disable-next-line  class-methods-use-this
  async getPubKey(index: number, showLedgerDisplay: boolean): Promise<Bytes> {
    const arg = electron.ipcRenderer.sendSync('enableWallet', {
      index,
      addressPrefix: 'cro', // dummy value
      showLedgerDisplay,
      message: 'enableWallet request for getPubKey',
    });
    if (!arg.success) {
      throw new Error(`getPubKey fail: ${arg.error}`);
    }
    const ret = Bytes.fromBuffer(Buffer.from(arg.pubKey));
    return ret;
  }

  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  // eslint-disable-next-line  class-methods-use-this
  async getAddress(
    index: number,
    addressPrefix: string,
    showLedgerDisplay: boolean,
  ): Promise<string> {
    const arg = electron.ipcRenderer.sendSync('enableWallet', {
      index,
      addressPrefix,
      showLedgerDisplay,
      message: 'enableWallet request for getAddress',
    });
    if (!arg.success) {
      throw new Error(`get address fail: ${arg.error}`);
    }
    return arg.account;
  }

  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  // eslint-disable-next-line  class-methods-use-this
  async sign(message: Bytes): Promise<Bytes> {
    const stringMessage = message.toBuffer().toString();
    const arg = electron.ipcRenderer.sendSync('signMessage', stringMessage);
    if (!arg.success) {
      throw new Error(`sign fail: ${arg.error}`);
    }

    return Bytes.fromBuffer(Buffer.from(arg.signed));
  }

  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  // eslint-disable-next-line  class-methods-use-this
  async hello(): Promise<void> {
    const a = {
      url: 'http://127.0.0.1:8545',
      index: 0,
      chainId: 9000,
      gasLimit: '0x5208',
      gasPrice: '0x04e3b29200',
      to: '0xeE7734855749cb9F870f9FDdc432a800eA5060d8',
      value: '0xde0b6b3a7640000',
      data: '0x',
    };

    const arg = electron.ipcRenderer.sendSync('ethSignSendTx', a);
    if (!arg.success) {
      throw new Error(`test fail: ${arg.error}`);
    }

    alert(JSON.stringify(arg));
  }
}
