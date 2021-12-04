import 'mocha';
import { expect } from 'chai';
import * as fc from 'fast-check';
import { Big } from 'big.js';
import { DefaultWalletConfigs } from '../../config/StaticConfig';
import sdk from '@crypto-org-chain/chain-jslib';
import { Units, Secp256k1KeyPair } from '../../utils/ChainJsLib';

test('should ledger sign correctly', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 4, max: 16 }),
      // inclusive
      fc.bigInt(BigInt('1'), BigInt('10000000000000000000')),
      (a, b) => {
        const { networkFee } = DefaultWalletConfigs.TestNetConfig.fee;
        console.log(`a=${a}, b=${b}`);
        //expect(back.toFixed()).to.eq(Big(b.toString()).toFixed());
        const cro = sdk.CroSDK({ network: DefaultWalletConfigs.TestNetConfig.network });
        const fee = new cro.Coin(b.toString(), Units.BASE);
        console.log(`fee=${fee.toString()}`);
        return true;
      },
    ),
    { verbose: true },
  );
});
