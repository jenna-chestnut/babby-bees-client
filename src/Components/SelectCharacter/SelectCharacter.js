import React, { useEffect, useState } from 'react';
import './SelectCharacter.css';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants';
import myEpicGame from '../../utils/BabbyBees.json';
import LoadingIndicator from '../LoadingIndicator/LoadingIndicator';

const SelectCharacter = ({ setCharacterNFT, setAlert }) => {
  const [characters, setCharacters] = useState([]);
  const [gameContract, setGameContract] = useState(null);
  const [mintingCharacter, setMintingCharacter] = useState(false);

  const mintCharacterNFTAction = (characterId) => async () => {
    try {
      if (gameContract) {
        setMintingCharacter(true);
        setAlert({
          message: 'Minting character in progress...',
          type: 'success',
          active: true
        });
        const mintTxn = await gameContract.mintCharacterNFT(characterId);
        await mintTxn.wait();
        setAlert({active: false});
        setMintingCharacter(false);
      }
    } catch (error) {
      console.error('MintCharacterAction Error:', error);
      setAlert({
        message: 'Error Minting Character: ' + error.error.message.substring(27),
        type: 'error',
        active: true
      });
      setMintingCharacter(false);
    }
  };

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

  useEffect(() => {
    const getCharacters = async () => {
      try {
        setAlert({
          message: 'Getting contract characters to mint...',
          type: 'success',
          active: true
        });
  
        const charactersTxn = await gameContract.getAllDefaultCharacters();
  
        const characters = charactersTxn.map((characterData) =>
          transformCharacterData(characterData)
        );

        setAlert({ active: false });
        setCharacters(characters);

      } catch (error) {
        console.error('Something went wrong fetching characters:', error);
        setAlert({
          message: 'Error Fetching Characters: ' + error.error.message.substring(27),
          type: 'error',
          active: true
        });
      }
    };

    const onCharacterMint = async (sender, tokenId, characterIndex) => {
      if (gameContract) {
        const characterNFT = characters[characterIndex.toNumber()];
        setCharacterNFT(characterNFT);
      }

      alert(`Your BabbyBee NFT is all done! See it here: https://testnets.opensea.io/assets/${gameContract.address}/${tokenId.toNumber()}`)
    };
  
    if (gameContract) {
      if (!characters.length) { 
        getCharacters();
      }
      gameContract.on('CharacterNFTMinted', onCharacterMint);
    }

    return () => {
      if (gameContract) {
        gameContract.off('CharacterNFTMinted', onCharacterMint);
      }
    };
  }, [gameContract, characters, setCharacterNFT, setAlert]);

  const renderCharacters = () =>
  characters.map((character, index) => (
    <div className="character-item" key={character.name}>
      <div className="name-container">
        <p>{character.name}</p>
      </div>
      <img src={character.imageURI} alt={character.name} />
      <button
        type="button"
        className="character-mint-button"
        onClick={mintCharacterNFTAction(index)}
      >{`Mint ${character.name}`}</button>
    </div>
  ));

  return (
    <div className="select-character-container">
      <h2>Mint Your Brave BabbyBee. Choose wisely.</h2>
      {
      characters.length > 0 
      && <div className="character-grid">{renderCharacters()}</div>
      }
      {mintingCharacter && (
      <div className="loading">
        <div className="indicator">
          <LoadingIndicator />
          <p>Minting In Progress...</p>
        </div>
        <img
          src="https://media.giphy.com/media/MdM6yOgUWBPQkTm2du/giphy.gif"
          alt="Minting loading indicator"
        />
      </div>
    )}
    </div>
  );
};

export default SelectCharacter;