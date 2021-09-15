import { Bytes } from '@crypto-org-chain/chain-jslib/lib/dist/utils/bytes/bytes';
import { ISignerProvider } from './SignerProvider';
import { LedgerSignerWebusb } from './LedgerSignerWebusb';

export class LedgerWalletSignerProviderWebusb implements ISignerProvider {
  provider: LedgerSignerWebusb;

  constructor() {
    this.provider = new LedgerSignerWebusb();
  }

  public async getPubKey(index: number, showLedgerDisplay: boolean): Promise<Bytes> {
    const result = await this.provider.enable(index, 'cro', showLedgerDisplay); // dummy value
    return result[1];
  }

  public async getAddress(
    index: number,
    addressPrefix: string,
    showLedgerDisplay: boolean,
  ): Promise<string> {
    const result = await this.provider.enable(index, addressPrefix, showLedgerDisplay);
    return result[0];
  }

  public async sign(message: Bytes): Promise<Bytes> {
    return this.provider.sign(message);
  }

  // eth
  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  // eslint-disable-next-line  class-methods-use-this
  public async signEthTx(
    index: number,
    chainId: number,
    nonce: number,
    gasLimit: string,
    gasPrice: string,
    to: string,
    value: string,
    data: string,
  ): Promise<string> {
    return '';
  }

  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  // eslint-disable-next-line  class-methods-use-this
  public async getEthAddress(index: number): Promise<string> {
    return '';
  }
}
