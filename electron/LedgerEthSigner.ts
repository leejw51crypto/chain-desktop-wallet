import TransportHID from '@ledgerhq/hw-transport-node-hid';
import Eth from '@ledgerhq/hw-app-eth';

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

  async test() {
    console.log('############################################');
    const transport = await TransportHID.open(''); // take first device
    const eth = new Eth(transport);
    const result = await eth.getAddress("44'/60'/0'/0/0");
    console.log(result);

    const result2 = await eth.signTransaction(
      "44'/60'/0'/0/0",
      'e8018504e3b292008252089428ee52a8f3d6e5d15f8b131996950d7f296c7952872bd72a2487400080',
    );
    console.log(result2);
  }
}
