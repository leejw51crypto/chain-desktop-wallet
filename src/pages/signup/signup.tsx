import React, { useState, useEffect, useRef } from 'react';
import './signup.less';
import { Link, useHistory } from 'react-router-dom';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import logo from '../../assets/logo-products-chain.svg';
import PasswordFormContainer from '../../components/PasswordForm/PasswordFormContainer';
import { cryptographer } from '../../crypto/Cryptographer';
import { secretStoreService } from '../../storage/SecretStoreService';
import SuccessCheckmark from '../../components/SuccessCheckmark/SuccessCheckmark';
import BackButton from '../../components/BackButton/BackButton';
import { walletService } from '../../service/WalletService';

type DisplayComponent = 'form' | 'wallet';

const SignUpPage = () => {
  const history = useHistory();
  const [displayComponent, setDisplayComponent] = useState<DisplayComponent>('form');
  const [hasWallet, setHasWallet] = useState(false); // Default as false. useEffect will only re-render if result of hasWalletBeenCreated === true
  const [hasPasswordBeenSet, setHasPasswordBeenSet] = useState(true);
  const didMountRef = useRef(false);

  const [t] = useTranslation();

  const handlePasswordSubmitted = async (password: string) => {
    // eslint-disable-next-line
    console.log('handlePasswordSubmitted==========='); 
    const salt = cryptographer.generateSalt();
    // eslint-disable-next-line
    console.log('handlePasswordSubmitted1');
    const hashResult = cryptographer.computeHash(password, salt);
    // eslint-disable-next-line
    console.log('handlePasswordSubmitted2a');
    await secretStoreService.savePassword({ hash: hashResult });
     // eslint-disable-next-line
     console.log('handlePasswordSubmitted3');
    // eslint-disable-next-line
    console.log('hashResult', hashResult);
    setDisplayComponent('wallet');
  };
  const handlePasswordCancelled = () => {};

  useEffect(() => {
    const fetchWalletData = async () => {
      const hasWalletBeenCreated = await walletService.hasWalletBeenCreated();
      const isPasswordSet = await secretStoreService.hasPasswordBeenSet();

      setHasPasswordBeenSet(isPasswordSet);
      setHasWallet(hasWalletBeenCreated);
      if (hasWalletBeenCreated && isPasswordSet) {
        history.push('/home');
      } else if (isPasswordSet) {
        setDisplayComponent('wallet');
      }
    };
    if (!didMountRef.current) {
      fetchWalletData();
      didMountRef.current = true;
    }
  }, [hasPasswordBeenSet, hasWallet, history]);

  return (
    <main className="signup-page">
      <div className="header">
        <img src={logo} className="logo" alt="logo" />
      </div>
      <div className="container">
        {displayComponent === 'form' ? (
          <>
            <BackButton backTo="/" />
            <PasswordFormContainer
              title={t('signup.passwordFormContainer.title')}
              description={t('signup.passwordFormContainer.description')}
              visible
              confirmPassword
              okButtonText={t('signup.passwordFormContainer.okButton')}
              successText={t('signup.passwordFormContainer.success')}
              successButtonText={t('general.continue')}
              onValidatePassword={async () => {
                return {
                  valid: true,
                };
              }}
              onSuccess={handlePasswordSubmitted}
              onCancel={handlePasswordCancelled}
            />
          </>
        ) : (
          <>
            <SuccessCheckmark />
            <div className="title">{t('signup.title')}</div>
            <div className="slogan">{t('signup.slogan')}</div>
            <div className="button-container">
              <Link to="/restore">
                <Button type="primary">{t('signup.button1')}</Button>
              </Link>
              <Link to="/create">
                <Button>{t('signup.button2')}</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default SignUpPage;
