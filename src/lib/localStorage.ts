
import SQLiteManager from './sqliteManager';
import NewSessionManager from './newSessionManager';

// Export types from SQLiteManager
export type { User, Theme, Flashcard, Deck } from './sqliteManager';

// Initialize managers
const sqliteManager = SQLiteManager.getInstance();
const sessionManager = NewSessionManager.getInstance();

// Helper functions
export const getBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// User functions
export const getUser = () => sqliteManager.getUser();
export const setUser = (user: any) => {
  // This is handled during database creation
  console.warn('setUser is deprecated, user is created automatically');
};
export const updateUser = (userData: any) => sqliteManager.updateUser(userData);

// Deck functions
export const getDecks = () => sqliteManager.getDecks();
export const getDeck = (id: string) => sqliteManager.getDeck(id);
export const createDeck = (deck: any) => sqliteManager.createDeck(deck);
export const updateDeck = (id: string, deckData: any) => sqliteManager.updateDeck(id, deckData);
export const deleteDeck = (id: string) => sqliteManager.deleteDeck(id);

// Owner check functions
export const isUserOwner = (authorId: string) => sqliteManager.isUserOwner(authorId);
export const isUserDeckOwner = (deckId: string) => {
  const deck = getDeck(deckId);
  if (!deck) return false;
  return isUserOwner(deck.authorId);
};

// Theme functions
export const getThemes = () => sqliteManager.getThemes();
export const getThemesByDeck = (deckId: string) => sqliteManager.getThemesByDeck(deckId);
export const getTheme = (id: string) => {
  const themes = getThemes();
  return themes.find(theme => theme.id === id);
};
export const createTheme = (theme: any) => sqliteManager.createTheme(theme);
export const updateTheme = (id: string, themeData: any) => {
  // Implementation would be similar to updateDeck
  console.warn('updateTheme not yet implemented in SQLite');
  return null;
};
export const deleteTheme = (id: string) => {
  // Implementation would be similar to deleteDeck
  console.warn('deleteTheme not yet implemented in SQLite');
  return false;
};

// Flashcard functions
export const getFlashcards = () => sqliteManager.getFlashcards();
export const getFlashcardsByDeck = (deckId: string) => sqliteManager.getFlashcardsByDeck(deckId);
export const getFlashcardsByTheme = (themeId: string) => {
  const flashcards = getFlashcards();
  return flashcards.filter(card => card.themeId === themeId);
};
export const getFlashcard = (id: string) => {
  const flashcards = getFlashcards();
  return flashcards.find(card => card.id === id);
};
export const createFlashcard = (flashcard: any) => sqliteManager.createFlashcard(flashcard);
export const updateFlashcard = (id: string, cardData: any) => {
  // Implementation would be similar to updateDeck
  console.warn('updateFlashcard not yet implemented in SQLite');
  return null;
};
export const deleteFlashcard = (id: string) => {
  // Implementation would be similar to deleteDeck
  console.warn('deleteFlashcard not yet implemented in SQLite');
  return false;
};

// Shared deck functions (will be implemented later)
export const getSharedDeckCodes = () => [];
export const createShareCode = (deckId: string, expiresInDays?: number) => {
  console.warn('Sharing not yet implemented in SQLite');
  return '';
};
export const getSharedDeck = (code: string) => {
  console.warn('Sharing not yet implemented in SQLite');
  return undefined;
};

// Initialize default user if none exists
export const initializeDefaultUser = () => {
  const user = getUser();
  if (user) return user;
  
  // This will be handled during session creation
  return null;
};

// Sample data generator - not needed with SQLite
export const generateSampleData = () => {
  console.log('Sample data generation not needed with SQLite');
};
