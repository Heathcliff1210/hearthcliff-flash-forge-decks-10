import initSqlJs, { Database } from 'sql.js';
import JSZip from 'jszip';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
}

export interface Theme {
  id: string;
  deckId: string;
  title: string;
  description: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Flashcard {
  id: string;
  deckId: string;
  themeId?: string;
  front: {
    text: string;
    image?: string;
    audio?: string;
    additionalInfo?: string;
  };
  back: {
    text: string;
    image?: string;
    audio?: string;
    additionalInfo?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  authorId: string;
  isPublic: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface UserSession {
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

class SQLiteManager {
  private static instance: SQLiteManager;
  private sql: any = null;
  private db: Database | null = null;
  private currentUserId: string | null = null;

  private constructor() {}

  static getInstance(): SQLiteManager {
    if (!SQLiteManager.instance) {
      SQLiteManager.instance = new SQLiteManager();
    }
    return SQLiteManager.instance;
  }

  async initialize(): Promise<void> {
    if (!this.sql) {
      this.sql = await initSqlJs({
        locateFile: (file: string) => `https://sql.js.org/dist/${file}`
      });
    }
  }

  private createSchema(db: Database): void {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        avatar TEXT,
        bio TEXT,
        created_at TEXT NOT NULL
      )
    `);

    // Decks table
    db.run(`
      CREATE TABLE IF NOT EXISTS decks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        cover_image TEXT,
        author_id TEXT NOT NULL,
        is_public INTEGER DEFAULT 0,
        tags TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Themes table
    db.run(`
      CREATE TABLE IF NOT EXISTS themes (
        id TEXT PRIMARY KEY,
        deck_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        cover_image TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (deck_id) REFERENCES decks (id) ON DELETE CASCADE
      )
    `);

    // Flashcards table - stores all media as base64 strings
    db.run(`
      CREATE TABLE IF NOT EXISTS flashcards (
        id TEXT PRIMARY KEY,
        deck_id TEXT NOT NULL,
        theme_id TEXT,
        front_text TEXT NOT NULL,
        front_image TEXT,
        front_audio TEXT,
        front_additional_info TEXT,
        back_text TEXT NOT NULL,
        back_image TEXT,
        back_audio TEXT,
        back_additional_info TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (deck_id) REFERENCES decks (id) ON DELETE CASCADE,
        FOREIGN KEY (theme_id) REFERENCES themes (id) ON DELETE SET NULL
      )
    `);

    // User preferences and settings
    db.run(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id INTEGER PRIMARY KEY,
        user_id TEXT NOT NULL,
        theme_preference TEXT DEFAULT 'light',
        language TEXT DEFAULT 'fr',
        study_reminders INTEGER DEFAULT 1,
        settings_json TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    db.run(`CREATE INDEX IF NOT EXISTS idx_decks_author ON decks (author_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_themes_deck ON themes (deck_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_flashcards_deck ON flashcards (deck_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_flashcards_theme ON flashcards (theme_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_user_settings_user ON user_settings (user_id)`);
  }

  async createUserDatabase(userId: string): Promise<void> {
    await this.initialize();
    
    this.currentUserId = userId;
    this.db = new this.sql.Database();
    this.createSchema(this.db);

    // Create default user
    const now = new Date().toISOString();
    this.db.run(
      `INSERT INTO users (id, name, email, created_at) VALUES (?, ?, ?, ?)`,
      [userId, "Utilisateur", "utilisateur@example.com", now]
    );

    // Create default user settings
    this.db.run(
      `INSERT INTO user_settings (user_id, settings_json) VALUES (?, ?)`,
      [userId, JSON.stringify({ initialized: true })]
    );

    // Save to IndexedDB
    await this.saveDatabaseToIndexedDB(userId);
  }

  async loadUserDatabase(userId: string): Promise<boolean> {
    await this.initialize();
    
    try {
      const dbData = await this.loadDatabaseFromIndexedDB(userId);
      if (dbData) {
        this.db = new this.sql.Database(dbData);
        this.currentUserId = userId;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading user database:', error);
      return false;
    }
  }

  private async saveDatabaseToIndexedDB(userId: string): Promise<void> {
    if (!this.db) return;

    const data = this.db.export();
    const request = indexedDB.open('FlashcardApp', 1);

    return new Promise((resolve, reject) => {
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['databases'], 'readwrite');
        const store = transaction.objectStore('databases');
        
        store.put({ userId, data });
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

  private async loadDatabaseFromIndexedDB(userId: string): Promise<Uint8Array | null> {
    const request = indexedDB.open('FlashcardApp', 1);

    return new Promise((resolve, reject) => {
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['databases'], 'readonly');
        const store = transaction.objectStore('databases');
        const getRequest = store.get(userId);

        getRequest.onsuccess = () => {
          const result = getRequest.result;
          resolve(result ? result.data : null);
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

  // User operations
  getUser(): User | null {
    if (!this.db || !this.currentUserId) return null;

    const stmt = this.db.prepare(`SELECT * FROM users WHERE id = ?`);
    const result = stmt.getAsObject([this.currentUserId]);
    stmt.free();

    if (!result.id) return null;

    return {
      id: result.id as string,
      name: result.name as string,
      email: result.email as string,
      avatar: result.avatar as string,
      bio: result.bio as string,
      createdAt: result.created_at as string,
    };
  }

  updateUser(userData: Partial<User>): User | null {
    if (!this.db || !this.currentUserId) return null;

    const updates = [];
    const values = [];
    
    if (userData.name !== undefined) {
      updates.push('name = ?');
      values.push(userData.name);
    }
    if (userData.email !== undefined) {
      updates.push('email = ?');
      values.push(userData.email);
    }
    if (userData.avatar !== undefined) {
      updates.push('avatar = ?');
      values.push(userData.avatar);
    }
    if (userData.bio !== undefined) {
      updates.push('bio = ?');
      values.push(userData.bio);
    }

    if (updates.length === 0) return this.getUser();

    values.push(this.currentUserId);
    
    this.db.run(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    this.saveDatabaseToIndexedDB(this.currentUserId);
    return this.getUser();
  }

  // Deck operations
  getDecks(): Deck[] {
    if (!this.db) return [];

    const stmt = this.db.prepare(`SELECT * FROM decks ORDER BY created_at DESC`);
    const results = [];
    
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push({
        id: row.id as string,
        title: row.title as string,
        description: row.description as string,
        coverImage: row.cover_image as string,
        authorId: row.author_id as string,
        isPublic: Boolean(row.is_public),
        tags: row.tags ? JSON.parse(row.tags as string) : [],
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
      });
    }
    
    stmt.free();
    return results;
  }

  getDeck(id: string): Deck | null {
    if (!this.db) return null;

    const stmt = this.db.prepare(`SELECT * FROM decks WHERE id = ?`);
    const result = stmt.getAsObject([id]);
    stmt.free();

    if (!result.id) return null;

    return {
      id: result.id as string,
      title: result.title as string,
      description: result.description as string,
      coverImage: result.cover_image as string,
      authorId: result.author_id as string,
      isPublic: Boolean(result.is_public),
      tags: result.tags ? JSON.parse(result.tags as string) : [],
      createdAt: result.created_at as string,
      updatedAt: result.updated_at as string,
    };
  }

  createDeck(deck: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>): Deck {
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    const id = `deck_${Date.now()}`;

    this.db.run(
      `INSERT INTO decks (id, title, description, cover_image, author_id, is_public, tags, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        deck.title,
        deck.description || '',
        deck.coverImage || '',
        deck.authorId,
        deck.isPublic ? 1 : 0,
        JSON.stringify(deck.tags),
        now,
        now
      ]
    );

    this.saveDatabaseToIndexedDB(this.currentUserId!);
    return this.getDeck(id)!;
  }

  updateDeck(id: string, deckData: Partial<Deck>): Deck | null {
    if (!this.db) return null;

    const updates = [];
    const values = [];
    
    if (deckData.title !== undefined) {
      updates.push('title = ?');
      values.push(deckData.title);
    }
    if (deckData.description !== undefined) {
      updates.push('description = ?');
      values.push(deckData.description);
    }
    if (deckData.coverImage !== undefined) {
      updates.push('cover_image = ?');
      values.push(deckData.coverImage);
    }
    if (deckData.isPublic !== undefined) {
      updates.push('is_public = ?');
      values.push(deckData.isPublic ? 1 : 0);
    }
    if (deckData.tags !== undefined) {
      updates.push('tags = ?');
      values.push(JSON.stringify(deckData.tags));
    }

    if (updates.length === 0) return this.getDeck(id);

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    this.db.run(
      `UPDATE decks SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    this.saveDatabaseToIndexedDB(this.currentUserId!);
    return this.getDeck(id);
  }

  deleteDeck(id: string): boolean {
    if (!this.db) return false;

    const stmt = this.db.prepare(`SELECT COUNT(*) as count FROM decks WHERE id = ?`);
    const result = stmt.getAsObject([id]);
    stmt.free();

    if (!(result.count as number)) return false;

    // Delete the deck (cascading will handle themes and flashcards)
    this.db.run(`DELETE FROM decks WHERE id = ?`, [id]);
    
    this.saveDatabaseToIndexedDB(this.currentUserId!);
    return true;
  }

  // Theme operations (similar pattern)
  getThemes(): Theme[] {
    if (!this.db) return [];

    const stmt = this.db.prepare(`SELECT * FROM themes ORDER BY created_at DESC`);
    const results = [];
    
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push({
        id: row.id as string,
        deckId: row.deck_id as string,
        title: row.title as string,
        description: row.description as string,
        coverImage: row.cover_image as string,
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
      });
    }
    
    stmt.free();
    return results;
  }

  getThemesByDeck(deckId: string): Theme[] {
    if (!this.db) return [];

    const stmt = this.db.prepare(`SELECT * FROM themes WHERE deck_id = ? ORDER BY created_at DESC`);
    const results = [];
    
    stmt.bind([deckId]);
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push({
        id: row.id as string,
        deckId: row.deck_id as string,
        title: row.title as string,
        description: row.description as string,
        coverImage: row.cover_image as string,
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
      });
    }
    
    stmt.free();
    return results;
  }

  createTheme(theme: Omit<Theme, 'id' | 'createdAt' | 'updatedAt'>): Theme {
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    const id = `theme_${Date.now()}`;

    this.db.run(
      `INSERT INTO themes (id, deck_id, title, description, cover_image, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        theme.deckId,
        theme.title,
        theme.description || '',
        theme.coverImage || '',
        now,
        now
      ]
    );

    this.saveDatabaseToIndexedDB(this.currentUserId!);
    return this.getThemes().find(t => t.id === id)!;
  }

  // Flashcard operations - enhanced to handle all media properly
  getFlashcards(): Flashcard[] {
    if (!this.db) return [];

    const stmt = this.db.prepare(`SELECT * FROM flashcards ORDER BY created_at DESC`);
    const results = [];
    
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push({
        id: row.id as string,
        deckId: row.deck_id as string,
        themeId: row.theme_id as string || undefined,
        front: {
          text: row.front_text as string,
          image: row.front_image as string || undefined,
          audio: row.front_audio as string || undefined,
          additionalInfo: row.front_additional_info as string || undefined,
        },
        back: {
          text: row.back_text as string,
          image: row.back_image as string || undefined,
          audio: row.back_audio as string || undefined,
          additionalInfo: row.back_additional_info as string || undefined,
        },
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
      });
    }
    
    stmt.free();
    return results;
  }

  getFlashcardsByDeck(deckId: string): Flashcard[] {
    if (!this.db) return [];

    const stmt = this.db.prepare(`SELECT * FROM flashcards WHERE deck_id = ? ORDER BY created_at DESC`);
    const results = [];
    
    stmt.bind([deckId]);
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push({
        id: row.id as string,
        deckId: row.deck_id as string,
        themeId: row.theme_id as string || undefined,
        front: {
          text: row.front_text as string,
          image: row.front_image as string || undefined,
          audio: row.front_audio as string || undefined,
          additionalInfo: row.front_additional_info as string || undefined,
        },
        back: {
          text: row.back_text as string,
          image: row.back_image as string || undefined,
          audio: row.back_audio as string || undefined,
          additionalInfo: row.back_additional_info as string || undefined,
        },
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
      });
    }
    
    stmt.free();
    return results;
  }

  createFlashcard(flashcard: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'>): Flashcard {
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    const id = `card_${Date.now()}`;

    this.db.run(
      `INSERT INTO flashcards (
        id, deck_id, theme_id, front_text, front_image, front_audio, front_additional_info,
        back_text, back_image, back_audio, back_additional_info, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        flashcard.deckId,
        flashcard.themeId || null,
        flashcard.front.text,
        flashcard.front.image || null,
        flashcard.front.audio || null,
        flashcard.front.additionalInfo || null,
        flashcard.back.text,
        flashcard.back.image || null,
        flashcard.back.audio || null,
        flashcard.back.additionalInfo || null,
        now,
        now
      ]
    );

    this.saveDatabaseToIndexedDB(this.currentUserId!);
    return this.getFlashcards().find(c => c.id === id)!;
  }

  updateFlashcard(id: string, cardData: Partial<Flashcard>): Flashcard | null {
    if (!this.db) return null;

    const updates = [];
    const values = [];

    if (cardData.front) {
      if (cardData.front.text !== undefined) {
        updates.push('front_text = ?');
        values.push(cardData.front.text);
      }
      if (cardData.front.image !== undefined) {
        updates.push('front_image = ?');
        values.push(cardData.front.image || null);
      }
      if (cardData.front.audio !== undefined) {
        updates.push('front_audio = ?');
        values.push(cardData.front.audio || null);
      }
      if (cardData.front.additionalInfo !== undefined) {
        updates.push('front_additional_info = ?');
        values.push(cardData.front.additionalInfo || null);
      }
    }

    if (cardData.back) {
      if (cardData.back.text !== undefined) {
        updates.push('back_text = ?');
        values.push(cardData.back.text);
      }
      if (cardData.back.image !== undefined) {
        updates.push('back_image = ?');
        values.push(cardData.back.image || null);
      }
      if (cardData.back.audio !== undefined) {
        updates.push('back_audio = ?');
        values.push(cardData.back.audio || null);
      }
      if (cardData.back.additionalInfo !== undefined) {
        updates.push('back_additional_info = ?');
        values.push(cardData.back.additionalInfo || null);
      }
    }

    if (cardData.themeId !== undefined) {
      updates.push('theme_id = ?');
      values.push(cardData.themeId || null);
    }

    if (updates.length === 0) return this.getFlashcards().find(c => c.id === id) || null;

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    this.db.run(
      `UPDATE flashcards SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    this.saveDatabaseToIndexedDB(this.currentUserId!);
    return this.getFlashcards().find(c => c.id === id) || null;
  }

  deleteFlashcard(id: string): boolean {
    if (!this.db) return false;

    const stmt = this.db.prepare(`SELECT COUNT(*) as count FROM flashcards WHERE id = ?`);
    const result = stmt.getAsObject([id]);
    stmt.free();

    if (!(result.count as number)) return false;

    this.db.run(`DELETE FROM flashcards WHERE id = ?`, [id]);
    
    this.saveDatabaseToIndexedDB(this.currentUserId!);
    return true;
  }

  // Export database as compressed file
  async exportDatabase(): Promise<Blob> {
    if (!this.db) throw new Error('Database not initialized');

    const data = this.db.export();
    const zip = new JSZip();
    
    zip.file('flashcard_database.db', data);
    zip.file('export_info.json', JSON.stringify({
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      userId: this.currentUserId
    }));

    return await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  }

  // Import database from compressed file
  async importDatabase(file: File): Promise<boolean> {
    try {
      await this.initialize();
      
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);
      
      const dbFile = zipContent.file('flashcard_database.db');
      if (!dbFile) throw new Error('Invalid backup file');

      const dbData = await dbFile.async('uint8array');
      this.db = new this.sql.Database(dbData);
      
      // Get user info from imported database
      const stmt = this.db.prepare(`SELECT id FROM users LIMIT 1`);
      const result = stmt.getAsObject();
      stmt.free();

      if (result.id) {
        this.currentUserId = result.id as string;
        await this.saveDatabaseToIndexedDB(this.currentUserId);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error importing database:', error);
      return false;
    }
  }

  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  isUserOwner(authorId: string): boolean {
    return this.currentUserId === authorId;
  }

  // Clear any localStorage remnants and ensure clean state
  clearLegacyStorage(): void {
    // Remove any old localStorage keys that might conflict
    const keysToRemove = [
      'flashcard-app-user',
      'flashcard-app-decks', 
      'flashcard-app-themes',
      'flashcard-app-flashcards',
      'flashcard-app-shared-codes',
      'flashcard-app-session',
      'flashcard-app-stats'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

export default SQLiteManager;
