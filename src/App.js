import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import SelectCharacter from './Components/SelectCharacter/SelectCharacter';
import { CONTRACT_ADDRESS, transformCharacterData } from './constants';
import babbyBees from './utils/BabbyBees.json';
import Arena from './Components/Arena/Arena';
import LoadingIndicator from './Components/LoadingIndicator/LoadingIndicator';

// Constants
const JENNA_TWITTER = 'https://twitter.com/jennabot5000'
const TWITTER_LINK = 'https://twitter.com/_buildspace';

const App = () => {

  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

    if (!ethereum) {
      console.log('Make sure you have MetaMask!')
      setIsLoading(false);
      return;
    } else {
      console.log('We have the etherum object ', ethereum)
    }

    const accounts = await ethereum.request({method: 'eth_accounts'});

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log('Found an authorized account: ', account);
      setCurrentAccount(account);
    } else {
      console.log('No authorized account found');
      setIsLoading(false);
    }
    } catch (error) {
      console.log(error);
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
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />
    } else if (currentAccount && characterNFT) {
      return <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />;
    }
  }

  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      })

      console.log('Connect ', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    setIsLoading(true);
    checkIfWalletIsConnected();
  }, [])

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      console.log('Checking for Character NFT on address:', currentAccount);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        babbyBees.abi,
        signer
      );

      const txn = await gameContract.checkIsUserHasNFT();
      if (txn.name) {
        console.log('User has character NFT');
        setCharacterNFT(transformCharacterData(txn));
      } else {
        console.log('No character NFT found');
      }

      setIsLoading(false);
    };

    if (currentAccount) {
      console.log('CurrentAccount: ', currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount])

  return (
    <div className="App">
      <div className="container">
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
