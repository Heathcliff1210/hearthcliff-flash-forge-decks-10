
import SQLiteManager from './sqliteManager';

interface SessionData {
  userId: string;
  sessionKey: string;
  lastActivity: string;
  stats: {
    totalStudyTime: number;
    studySessions: number;
    cardsReviewed: number;
    correctAnswers: number;
    incorrectAnswers: number;
    streakDays: number;
    lastStudyDate: string | null;
    studyDays: string[];
    averageScore: number;
  };
}

class NewSessionManager {
  private static instance: NewSessionManager;
  private sqliteManager: SQLiteManager;

  private constructor() {
    this.sqliteManager = SQLiteManager.getInstance();
  }

  static getInstance(): NewSessionManager {
    if (!NewSessionManager.instance) {
      NewSessionManager.instance = new NewSessionManager();
    }
    return NewSessionManager.instance;
  }

  generateSessionKey(): string {
    return Math.random().toString(36).substring(2, 6).toUpperCase() + 
           Math.random().toString(36).substring(2, 6).toUpperCase() + 
           Math.random().toString(36).substring(2, 4).toUpperCase();
  }

  async createSession(): Promise<string> {
    const userId = `user_${Date.now()}`;
    const sessionKey = this.generateSessionKey();
    
    // Create SQLite database for user
    await this.sqliteManager.createUserDatabase(userId);
    
    // Save session data to IndexedDB
    await this.saveSessionData({
      userId,
      sessionKey,
      lastActivity: new Date().toISOString(),
      stats: {
        totalStudyTime: 0,
        studySessions: 0,
        cardsReviewed: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        streakDays: 0,
        lastStudyDate: null,
        studyDays: [],
        averageScore: 0
      }
    });
    
    // Store current session reference
    localStorage.setItem('currentSessionKey', sessionKey);
    
    return sessionKey;
  }

  async loadSession(sessionKey: string): Promise<boolean> {
    try {
      const sessionData = await this.getSessionData(sessionKey);
      if (!sessionData) return false;

      const success = await this.sqliteManager.loadUserDatabase(sessionData.userId);
      if (success) {
        localStorage.setItem('currentSessionKey', sessionKey);
        await this.updateLastActivity();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error loading session:', error);
      return false;
    }
  }

  async hasSession(): Promise<boolean> {
    const sessionKey = localStorage.getItem('currentSessionKey');
    if (!sessionKey) return false;

    const sessionData = await this.getSessionData(sessionKey);
    return !!sessionData;
  }

  getSessionKey(): string | null {
    return localStorage.getItem('currentSessionKey');
  }

  async clearSession(): Promise<void> {
    localStorage.removeItem('currentSessionKey');
  }

  private async saveSessionData(sessionData: SessionData): Promise<void> {
    const request = indexedDB.open('FlashcardApp', 1);

    return new Promise((resolve, reject) => {
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['sessions'], 'readwrite');
        const store = transaction.objectStore('sessions');
        
        store.put({ sessionKey: sessionData.sessionKey, ...sessionData });
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('databases')) {
          db.createObjectStore('databases', { keyPath: 'userId' });
        }
        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions', { keyPath: 'sessionKey' });
        }
      };
    });
  }

  private async getSessionData(sessionKey: string): Promise<SessionData | null> {
    const request = indexedDB.open('FlashcardApp', 1);

    return new Promise((resolve, reject) => {
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['sessions'], 'readonly');
        const store = transaction.objectStore('sessions');
        const getRequest = store.get(sessionKey);

        getRequest.onsuccess = () => {
          const result = getRequest.result;
          resolve(result || null);
        };
        getRequest.onerror = () => reject(getRequest.error);
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('databases')) {
          db.createObjectStore('databases', { keyPath: 'userId' });
        }
        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions', { keyPath: 'sessionKey' });
        }
      };
    });
  }

  async updateLastActivity(): Promise<void> {
    const sessionKey = this.getSessionKey();
    if (!sessionKey) return;

    const sessionData = await this.getSessionData(sessionKey);
    if (sessionData) {
      sessionData.lastActivity = new Date().toISOString();
      await this.saveSessionData(sessionData);
    }
  }

  async updateStats(updates: Partial<SessionData['stats']>): Promise<void> {
    const sessionKey = this.getSessionKey();
    if (!sessionKey) return;

    const sessionData = await this.getSessionData(sessionKey);
    if (sessionData) {
      sessionData.stats = { ...sessionData.stats, ...updates };
      
      // Calculate average score if we have answers
      if (updates.correctAnswers !== undefined || updates.incorrectAnswers !== undefined) {
        const totalCorrect = sessionData.stats.correctAnswers;
        const totalAnswers = sessionData.stats.correctAnswers + sessionData.stats.incorrectAnswers;
        
        if (totalAnswers > 0) {
          sessionData.stats.averageScore = Math.round((totalCorrect / totalAnswers) * 100);
        }
      }
      
      await this.saveSessionData(sessionData);
    }
  }

  async getStats(): Promise<SessionData['stats'] | null> {
    const sessionKey = this.getSessionKey();
    if (!sessionKey) return null;

    const sessionData = await this.getSessionData(sessionKey);
    return sessionData?.stats || null;
  }

  async importSessionFromFile(file: File): Promise<boolean> {
    try {
      const success = await this.sqliteManager.importDatabase(file);
      if (success) {
        const userId = this.sqliteManager.getCurrentUserId();
        if (userId) {
          const sessionKey = this.generateSessionKey();
          await this.saveSessionData({
            userId,
            sessionKey,
            lastActivity: new Date().toISOString(),
            stats: {
              totalStudyTime: 0,
              studySessions: 0,
              cardsReviewed: 0,
              correctAnswers: 0,
              incorrectAnswers: 0,
              streakDays: 0,
              lastStudyDate: null,
              studyDays: [],
              averageScore: 0
            }
          });
          
          localStorage.setItem('currentSessionKey', sessionKey);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error importing session:', error);
      return false;
    }
  }

  async exportSessionToFile(): Promise<Blob | null> {
    try {
      return await this.sqliteManager.exportDatabase();
    } catch (error) {
      console.error('Error exporting session:', error);
      return null;
    }
  }
}

export default NewSessionManager;
