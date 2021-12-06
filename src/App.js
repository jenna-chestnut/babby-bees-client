import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import SelectCharacter from './Components/SelectCharacter/SelectCharacter';
import { CONTRACT_ADDRESS, transformCharacterData } from './constants';
import babbyBees from './utils/BabbyBees.json';
import Arena from './Components/Arena/Arena';
import LoadingIndicator from './Components/LoadingIndicator/LoadingIndicator';
import AlertBanner from './Components/AlertBanner/AlertBanner';

// Constants
const JENNA_TWITTER = 'https://twitter.com/jennabot5000'
const TWITTER_LINK = 'https://twitter.com/_buildspace';

const App = () => {

  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({active: null});

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

    if (!ethereum) {
      setAlert({
        message: 'Make sure you have MetaMask!',
        type: 'error',
        active: true
      });
      setIsLoading(false);
      return;
    }

    const accounts = await ethereum.request({method: 'eth_accounts'});

    if (accounts.length !== 0) {
      const account = accounts[0];
      setCurrentAccount(account);
    } else {
      setIsLoading(false);
    }

    } catch (error) {
      setAlert({
        message: error.message,
        type: 'error',
        active: true
      });
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingIndicator />;
    }

    if (!currentAccount) {
      return <div className="connect-wallet-container">
      <img
        src="https://i.imgur.com/rsAzjqT.gif"
        alt="Babby Bees GIF"
      />
      <button
      className="cta-button connect-wallet-button"
      onClick={connectWalletAction}
      >
        Connect Wallet to Get Started
        </button>
    </div>
    } else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} setAlert={setAlert}/>
    } else if (currentAccount && characterNFT) {
      return <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} setAlert={setAlert} />;
    }
  }

  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        setAlert({
          message: 'Get MetaMask!',
          type: 'error',
          active: true
        });
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      })

      setCurrentAccount(accounts[0]);
    } catch (error) {
      setAlert({
        message: error.message,
        type: 'error',
        active: true
      });
    }
  }

  useEffect(() => {
    setIsLoading(true);
    checkIfWalletIsConnected();
  }, [])

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        babbyBees.abi,
        signer
      );

      const txn = await gameContract.checkIsUserHasNFT();
      if (txn.name) {
        setCharacterNFT(transformCharacterData(txn));
      }

      setIsLoading(false);
    };

    if (currentAccount) {
      fetchNFTMetadata();
    }
  }, [currentAccount])

  return (
    <div className="App">
      <div className="container">
        {alert.active && <AlertBanner type={alert.type} message={alert.message} setAlert={setAlert}/>}
        <div className="header-container">
          <h1>
            <span className='no-style-h'>{' 🍯 '}</span> 
            Babby Bees 
            <span className='no-style-h'>{' 🐝 '}</span>
          </h1>
          <p className="sub-text">Team up to defeat the Big Bad Bear Boss!</p>
          {renderContent()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <p className="footer-text">
          {'built by '}
          <a
            href={JENNA_TWITTER}
            target="_blank"
            rel="noreferrer"
            className="footer-text"
          >{`@jennabot`}</a>
          {' with help from '} 
          <a
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
            className="footer-text"
          >{`@_buildspace`}</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
