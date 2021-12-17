import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS } from '../../constants';
import myEpicGame from '../../utils/BabbyBees.json';
import './ReviveBee.css';
import LoadingIndicator from '../LoadingIndicator/LoadingIndicator';

//* Need to set up listener for event with new player HP to reset
//* 


const ReviveBee = ({ setAlert, setReviving }) => {
  const [gameContract, setGameContract] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(null);

  useEffect(() => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      setGameContract(gameContract);
    } else {
      setAlert({
        message: 'Ethereum object not found. Make sure you have MetaMask!',
        type: 'error',
        active: true
      });
    }
  }, [setAlert]);

  const runReviveAction = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (gameContract) {
        const reviveTxn = await gameContract.revive(address);
        await reviveTxn.wait();
      }
      setLoading(false);

      setAlert({
        message: 'Bee revived!',
        type: 'success',
        active: true
      });

      setReviving(false);

    } catch (error) {
      setLoading(false);
      setAlert({
        message: 'Error reviving bee: ' + error.error.message.substring(27) || "",
        type: 'error',
        active: true
      });
    }
  };

  return (
    <div className="revive-container">
      <div className="revive-form-container">
      <div className='revive-form-content'>
      <h2>Revive A Bee</h2>
      <img src="https://media0.giphy.com/media/U8QICIdSpO8FMfDsjV/giphy.gif?cid=ecf05e47t2y5j42pet86cgjy3ve8rbm8m3cmomguud2s1ijp&rid=giphy.gif&ct=g" alt="Save The Bees"></img>
      <p>Enter the wallet address of the bee you would like to rejoin the Babby battle.</p>
      {!loading && (
      <form onSubmit={(e) => runReviveAction(e)}>
        <input type="text" onChange={(e) => setAddress(e.target.value)}></input>
        <button type="submit">REVIVE</button>
      </form>
      )}
      {loading && (
        <div className="loading-indicator">
        <LoadingIndicator/>
        <p>Reviving!.. <span className='no-style-h'>🐝</span></p>
      </div>
      )}
      </div>
      </div>
    </div>
  );
};

export default ReviveBee;