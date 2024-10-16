import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, push, get, update, remove } from 'firebase/database';

// Initialize Firebase (make sure to replace with your actual config)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

interface Player {
  name: string;
  score: number;
  hand: string[];
}

interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  words: string[];
  drawPile: string[];
  discardPile: string[];
}

const INITIAL_HAND_SIZE = 10;

const createDeck = (): string[] => {
  const deck: string[] = [];
  // Vowels
  ['A', 'E', 'I'].forEach(letter => deck.push(...Array(4).fill(letter)));
  ['O', 'U'].forEach(letter => deck.push(...Array(3).fill(letter)));
  // Consonants
  ['H', 'L', 'R', 'S', 'T', 'W'].forEach(letter => deck.push(...Array(3).fill(letter)));
  // Other letters
  ['B', 'C', 'D', 'F', 'G', 'J', 'K', 'M', 'N', 'P', 'Q', 'V', 'X', 'Y', 'Z'].forEach(letter => deck.push(letter));
  // Master card
  deck.push('*');
  return deck;
};

const shuffleDeck = (deck: string[]): string[] => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

export const createGame = async (playerName: string): Promise<string> => {
  const gameRef = push(ref(database, 'games'));
  const gameId = gameRef.key as string;

  const deck = shuffleDeck(createDeck());
  const playerHand = deck.splice(0, INITIAL_HAND_SIZE);

  const initialGameState: GameState = {
    players: [{ name: playerName, score: 0, hand: playerHand }],
    currentPlayerIndex: 0,
    words: [],
    drawPile: deck,
    discardPile: [],
  };

  await set(gameRef, initialGameState);
  return gameId;
};

export const joinGame = async (gameId: string, playerName: string): Promise<boolean> => {
  const gameRef = ref(database, `games/${gameId}`);
  const snapshot = await get(gameRef);

  if (snapshot.exists()) {
    const gameState = snapshot.val() as GameState;
    if (gameState.players.length < 4) {
      const playerHand = gameState.drawPile.splice(0, INITIAL_HAND_SIZE);
      gameState.players.push({ name: playerName, score: 0, hand: playerHand });
      await update(gameRef, gameState);
      return true;
    }
  }
  return false;
};

export const playCard = async (gameId: string, playerName: string, word: string): Promise<void> => {
  const gameRef = ref(database, `games/${gameId}`);
  const snapshot = await get(gameRef);

  if (snapshot.exists()) {
    const gameState = snapshot.val() as GameState;
    const playerIndex = gameState.players.findIndex(p => p.name === playerName);

    if (playerIndex !== -1) {
      const player = gameState.players[playerIndex];
      const handCopy = [...player.hand];

      // Check if the word can be formed and remove used cards
      for (const letter of word) {
        const index = handCopy.indexOf(letter);
        if (index === -1) {
          const wildcardIndex = handCopy.indexOf('*');
          if (wildcardIndex === -1) {
            throw new Error('Invalid word: not enough cards');
          }
          handCopy.splice(wildcardIndex, 1);
        } else {
          handCopy.splice(index, 1);
        }
      }

      // Update player's hand and game state
      player.hand = handCopy;
      gameState.words.push(word);
      gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;

      // Draw new cards
      while (player.hand.length < INITIAL_HAND_SIZE && gameState.drawPile.length > 0) {
        player.hand.push(gameState.drawPile.pop() as string);
      }

      await update(gameRef, gameState);
    }
  }
};

export const discardCard = async (gameId: string, playerName: string, card: string): Promise<void> => {
  const gameRef = ref(database, `games/${gameId}`);
  const snapshot = await get(gameRef);

  if (snapshot.exists()) {
    const gameState = snapshot.val() as GameState;
    const playerIndex = gameState.players.findIndex(p => p.name === playerName);

    if (playerIndex !== -1) {
      const player = gameState.players[playerIndex];
      const cardIndex = player.hand.indexOf(card);

      if (cardIndex !== -1) {
        player.hand.splice(cardIndex, 1);
        gameState.discardPile.push(card);
        gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;

        if (gameState.drawPile.length > 0) {
          player.hand.push(gameState.drawPile.pop() as string);
        }

        await update(gameRef, gameState);
      }
    }
  }
};

export const challengeWord = async (gameId: string, challengerName: string, word: string): Promise<void> => {
  const gameRef = ref(database, `games/${gameId}`);
  const snapshot = await get(gameRef);
  
  if (snapshot.exists()) {
    const gameState = snapshot.val() as GameState;
    const challengerIndex = gameState.players.findIndex(p => p.name === challengerName);
    
    if (challengerIndex === -1) {
      throw new Error('Challenger not found in the game');
    }
    
    const wordIndex = gameState.words.indexOf(word);
    if (wordIndex === -1) {
      throw new Error('Word not found in the game');
    }
    
    // In a real implementation, you would check if the word is valid
    // For this example, we'll use a simple random outcome
    const isValidWord = Math.random() < 0.5;
    
    if (isValidWord) {
      // Word is valid, challenger loses
      gameState.players[challengerIndex].score += 10;
    } else {
      // Word is invalid, remove it and penalize the player who played it
      gameState.words.splice(wordIndex, 1);
      const playerIndex = (challengerIndex - 1 + gameState.players.length) % gameState.players.length;
      gameState.players[playerIndex].score += 10;
    }
    
    await update(gameRef, gameState);
  }
};

export const getGameState = async (gameId: string): Promise<GameState | null> => {
  const gameRef = ref(database, `games/${gameId}`);
  const snapshot = await get(gameRef);
  
  if (snapshot.exists()) {
    return snapshot.val() as GameState;
  }
  
  return null;
};

export const exitGame = async (gameId: string, playerName: string): Promise<void> => {
    const gameRef = ref(database, `games/${gameId}`);
    const snapshot = await get(gameRef);
  
    if (snapshot.exists()) {
      const gameState = snapshot.val() as GameState;
      const playerIndex = gameState.players.findIndex(p => p.name === playerName);
  
      if (playerIndex !== -1) {
        // Remove the player from the game
        gameState.players.splice(playerIndex, 1);
  
        if (gameState.players.length === 0) {
          // If no players left, remove the entire game
          await remove(gameRef);
        } else {
          // Update the current player index if necessary
          if (gameState.currentPlayerIndex >= gameState.players.length) {
            gameState.currentPlayerIndex = 0;
          }
          // Update the game state
          await update(gameRef, gameState);
        }
      } else {
        throw new Error('Player not found in the game');
      }
    } else {
      throw new Error('Game not found');
    }
  };