import React from 'react';
import ReactDOM from 'react-dom';
import { RecoilRoot } from 'recoil';
import * as serviceWorker from './serviceWorker';
import RouteHub from './pages/route';
import './index.less';
import { task } from './service/tasks/BackgroundJob';
import { createLedgerDevice } from './service/LedgerService';

let g_addressIndex = 0;
function start() {
  setInterval(async () => {
    const device = createLedgerDevice();
    // check ledger device ok
    const addr = await device.getAddress(g_addressIndex, 'tcro', false);

    // eslint-disable-next-line no-console
    console.log(`test ${new Date().toString()} ${addr}`);

    g_addressIndex++;
  }, 1000);
}

setTimeout(() => {
  start();
}, 2000);

ReactDOM.render(
  <RecoilRoot>
    <RouteHub />
  </RecoilRoot>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
task.runJobs();
