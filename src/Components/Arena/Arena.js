import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants';
import myEpicGame from '../../utils/BabbyBees.json';
import './Arena.css';
import LoadingIndicator from '../LoadingIndicator/LoadingIndicator';
import ripCharacter from '../../assets/RIP.gif';

const Arena = ({ characterNFT, setCharacterNFT, setAlert }) => {
  const [gameContract, setGameContract] = useState(null);
  const [boss, setBoss] = useState(null);
  const [attackState, setAttackState] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchBoss = async () => {
      const bossTxn = await gameContract.getBossBear();
      setBoss(transformCharacterData(bossTxn));
    }

    const onAttackComplete = (newBossHp, newPlayerHp) => {
      const bossHp = newBossHp.toNumber();
      const playerHp = newPlayerHp.toNumber();

      setBoss((prevState) => {
          return { ...prevState, hp: bossHp };
      });

      setCharacterNFT((prevState) => {
          return { ...prevState, hp: playerHp };
      });
  };

    if (gameContract) {
      fetchBoss();
      gameContract.on('AttackComplete', onAttackComplete);
    }
  }, [gameContract, setCharacterNFT, setAlert])

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

  const runAttackAction = async () => {
    try {
      if (gameContract) {
        setAttackState('attacking');
        const attackTxn = await gameContract.attackBoss();
        await attackTxn.wait();
        setAttackState('hit');

        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      setAlert({
        message: 'Error attacking boss: ' + error.error.message.substring(27) || "",
        type: 'error',
        active: true
      });
      setAttackState('');
    }
  };

  return (
    <div className="arena-container">

      {boss && characterNFT && (
      <div id="toast" className={showToast ? 'show' : ''}>
        <div id="desc">{`???? ${boss.name} was hit for ${characterNFT.attackDamage}!`}</div>
      </div>
    )}

    {boss && (
      <div className="boss-container">
        <div className={`boss-content ${attackState}`}>
          <h2><span className='no-style-h'>{' ???? '}</span> 
          {boss.name} 
          <span className='no-style-h'>{' ???? '}</span></h2>
          <p>Don't let him fool you... he is BIG and BAD!!</p>
          <div className="image-content">
            <img src={boss.imageURI.substring(0, boss.imageURI.length - 1)} alt={`${boss.name}`} />
            <div className="health-bar">
              <progress value={boss.hp} max={boss.maxHp} />
              <p>{`${boss.hp} / ${boss.maxHp} HP`}</p>
            </div>
          </div>
        </div>
        <div className="attack-container">
          <button className="cta-button" onClick={runAttackAction}>
            <span className='no-style-h'>????</span>{` Attack ${boss.name}`}
          </button>
        </div>
        {attackState === 'attacking' && (
        <div className="loading-indicator">
          <LoadingIndicator/>
          <p>Attacking!.. <span className='no-style-h'>????</span></p>
        </div>
      )}
      </div>
    )}

    {characterNFT && (
      <div className="players-container">
        <div className="player-container">
          <h2>{characterNFT.hp > 0 
                  ? "You're our only hope!" : "You tried your best!"}</h2>
          <div className="player">
            <div className="image-content">
              <h2>{characterNFT.name}</h2>
              <img
                src={characterNFT.hp > 0 
                  ? characterNFT.imageURI : ripCharacter}
                alt={`Character ${characterNFT.name}`}
              />
              <div className="health-bar">
                <progress value={characterNFT.hp} max={characterNFT.maxHp} />
                <p>{`${characterNFT.hp} / ${characterNFT.maxHp} HP`}</p>
              </div>
            </div>
            <div className="stats">
              <h4>{`Attack Damage: ${characterNFT.attackDamage}`}</h4>
            </div>
          </div>
        </div>
      </div>
    )}

    </div>
  );
};

export default Arena;