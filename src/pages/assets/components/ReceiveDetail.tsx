import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
// import numeral from 'numeral';
import { useTranslation } from 'react-i18next';
import 'antd/dist/antd.css';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Button, notification } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

import './ReceiveDetail.less';
import { Session } from '../../../models/Session';
import { UserAsset, UserAssetType } from '../../../models/UserAsset';
import { LEDGER_WALLET_TYPE, createLedgerDevice } from '../../../service/LedgerService';

interface ReceiveDetailProps {
  currentAsset: UserAsset | undefined;
  session: Session;
}

const ReceiveDetail: React.FC<ReceiveDetailProps> = props => {
  const { currentAsset, session } = props;
  const [isLedger, setIsLedger] = useState(false);
  const [ledgerAddress, setLedgerAddress] = useState('');

  const [t] = useTranslation();

  const isEVM = currentAsset?.assetType === UserAssetType.EVM;

  const assetAddress = (asset, _session) => {
    const { assetType, address } = asset;
    // For IBC assets
    const { wallet } = _session;

    switch (assetType) {
      case UserAssetType.TENDERMINT:
        return address;
      case UserAssetType.EVM:
        // return '0x3492dEc151Aa6179e13F775eD249185478F3D8ad';
        return address;
      case UserAssetType.IBC:
        return wallet.address;
      default:
        return wallet.address;
    }
  };

  useEffect(() => {
    const { walletType } = session.wallet;
    setIsLedger(LEDGER_WALLET_TYPE === walletType);
    // setLedgerAddress(assetAddress(currentAsset, session));
  });

  const clickCheckLedger = async () => {
    try {
      const { addressIndex, walletType, config } = session.wallet;
      const addressprefix = config.network.addressPrefix;
      if (LEDGER_WALLET_TYPE === walletType) {
        const device = createLedgerDevice();
        let ret = '';
        if (isEVM) {
          ret = await device.getEthAddress(addressIndex);
        } else {
          ret = await device.getAddress(addressIndex, addressprefix, false);
        }

        setLedgerAddress(ret);
      }
    } catch (e) {
      notification.error({
        message: t('receive.notification.ledgerConnect.message'),
        description: t('receive.notification.ledgerConnect.description'),
        placement: 'topRight',
        duration: 3,
      });
    }
  };

  const onCopyClick = () => {
    setTimeout(() => {
      notification.success({
        message: t('receive.notification.addressCopy.message'),
        description: t('receive.notification.addressCopy.description'),
        placement: 'topRight',
        duration: 2,
        key: 'copy',
      });
    }, 100);
  };

  // const assetIcon = asset => {
  //   const { icon_url, symbol } = asset;

  //   return icon_url ? (
  //     <img src={icon_url} alt="cronos" className="asset-icon" />
  //   ) : (
  //     <Avatar>{symbol[0].toUpperCase()}</Avatar>
  //   );
  // };

  return (
    <div className="receive-detail">
      {/* <div className="title">
        {assetIcon(currentAsset)}
        {currentAsset?.name} ({currentAsset?.symbol})
      </div> */}
      <div className="address">
        <QRCode value={ledgerAddress} size={180} />
        <div className="name">{session.wallet.name}</div>
      </div>
      <CopyToClipboard text={ledgerAddress}>
        <div className="copy" onClick={onCopyClick}>
          ~~ {ledgerAddress} ~~
          <CopyOutlined />
        </div>
      </CopyToClipboard>
      {isLedger && (
        <div className="ledger">
          <Button type="primary" onClick={clickCheckLedger}>
            {t('receive.button')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReceiveDetail;
