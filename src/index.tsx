import React from 'react';
import ReactDOM from 'react-dom';
import { RecoilRoot } from 'recoil';
import * as serviceWorker from './serviceWorker';
import RouteHub from './pages/route';
import './index.less';
import { task } from './service/tasks/BackgroundJob';
import sdk from '@crypto-com/chain-jslib';
import { Units } from './utils/ChainJsLib';

function enableWallet() {
  console.log('ok');

  const network = {
    defaultNodeUrl: '',
    chainId: 'test',
    addressPrefix: 'tcro',
    bip44Path: { coinType: 394, account: 0 },
    validatorPubKeyPrefix: 'tcrocnclpub',
    validatorAddressPrefix: 'tcrocncl',
    coin: { baseDenom: 'tbasecro', croDenom: 'tcro' },
  };
  const cro = sdk.CroSDK({ network });

  const m2 = new cro.staking.MsgBeginRedelegate({
    delegatorAddress: 'tcro1l320uqmk82nu432c0xuz54ktf4f9qmmqrj6nmj',
    validatorSrcAddress: 'tcrocncl1qm8c62ewj99ufj34jgjk3uv3tu3a6jxv3880nz',
    validatorDstAddress: 'tcrocncl197ujxhaeyyv309f39c0s2gn0af0pps5pcxsr0a',
    amount: new cro.Coin('0000', Units.BASE),
  });
  console.log(`${JSON.stringify(m2)}`);
  m2.validateAddresses();
  const msg1 = m2.toRawAminoMsg();
  console.log(`msg ${JSON.stringify(msg1)}`);
}
ReactDOM.render(
  <RecoilRoot>
    <button type="button" onClick={enableWallet}>
      {' '}
      Enable Wallet{' '}
    </button>
    <RouteHub />
  </RecoilRoot>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
task.runJobs();
