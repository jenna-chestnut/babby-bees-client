import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants';
import myEpicGame from '../../utils/BabbyBees.json';
import './Arena.css';
import LoadingIndicator from '../LoadingIndicator/LoadingIndicator';

const Arena = ({ characterNFT, setCharacterNFT }) => {
  const [gameContract, setGameContract] = useState(null);
  const [boss, setBoss] = useState(null);
  const [attackState, setAttackState] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchBoss = async () => {
      const bossTxn = await gameContract.getBossBear();
      console.log('Boss: ', bossTxn);
      setBoss(transformCharacterData(bossTxn));
    }

    const onAttackComplete = (newBossHp, newPlayerHp) => {
      const bossHp = newBossHp.toNumber();
      const playerHp = newPlayerHp.toNumber();

      console.log(`AttackComplete: Boss Hp: ${bossHp} Player Hp: ${playerHp}`);

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
  }, [gameContract, setCharacterNFT])

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
      console.log('Ethereum object not found');
    }
  }, []);

  const runAttackAction = async () => {
    try {
      if (gameContract) {
        setAttackState('attacking');
        console.log('Attacking boss...');
        const attackTxn = await gameContract.attackBoss();
        await attackTxn.wait();
        console.log('attackTxn:', attackTxn);
        setAttackState('hit');

        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Error attacking boss:', error);
      setAttackState('');
    }
  };

  return (
    <div className="arena-container">

      {boss && characterNFT && (
      <div id="toast" className={showToast ? 'show' : ''}>
        <div id="desc">{`💥 ${boss.name} was hit for ${characterNFT.attackDamage}!`}</div>
      </div>
    )}

    {boss && (
      <div className="boss-container">
        <div className={`boss-content ${attackState}`}>
          <h2><span className='no-style-h'>{' 🐾 '}</span> 
          {boss.name} 
          <span className='no-style-h'>{' 🌲 '}</span></h2>
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
            <span className='no-style-h'>🎯</span>{` Attack ${boss.name}`}
          </button>
        </div>
        {attackState === 'attacking' && (
        <div className="loading-indicator">
          <LoadingIndicator/>
          <p>Attacking!.. <span className='no-style-h'>🐝</span></p>
        </div>
      )}
      </div>
    )}

    {characterNFT && (
      <div className="players-container">
        <div className="player-container">
          <h2>You're our only hope!</h2>
          <div className="player">
            <div className="image-content">
              <h2>{characterNFT.name}</h2>
              <img
                src={characterNFT.imageURI}
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