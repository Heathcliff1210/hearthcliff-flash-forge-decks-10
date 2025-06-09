
import NewSessionManager from './newSessionManager';

const sessionManager = NewSessionManager.getInstance();

// Re-export functions with the same interface for compatibility
export const generateSessionKey = () => sessionManager.generateSessionKey();

export const saveSessionKey = async (key: string) => {
  // In the new system, session creation is handled differently
  console.warn('saveSessionKey is deprecated, use createSession instead');
};

export const getSessionKey = () => sessionManager.getSessionKey();

export const clearSessionKey = () => sessionManager.clearSession();

export const hasSession = () => sessionManager.hasSession();

export const isSessionExpired = () => false; // SQLite sessions don't expire

export const extendSession = () => sessionManager.updateLastActivity();

export const updateLastActivity = () => sessionManager.updateLastActivity();

export const verifySession = async () => {
  return await sessionManager.hasSession();
};

export const updateSessionStats = (updates: any) => {
  sessionManager.updateStats(updates);
};

export const getSessionStats = () => sessionManager.getStats();

export const recordCardStudy = (isCorrect: boolean, studyTimeMinutes = 1) => {
  sessionManager.updateStats({
    cardsReviewed: 1,
    correctAnswers: isCorrect ? 1 : 0,
    incorrectAnswers: isCorrect ? 0 : 1,
    totalStudyTime: studyTimeMinutes,
    studySessions: 1,
    lastStudyDate: new Date().toISOString()
  });
};

export const getStudyStreak = async () => {
  const stats = await sessionManager.getStats();
  return stats?.streakDays || 0;
};

export const exportSessionData = async () => {
  const blob = await sessionManager.exportSessionToFile();
  if (blob) {
    const text = await blob.text();
    return text;
  }
  return '';
};

export const importSessionData = async (data: string) => {
  // For file import, this would be handled differently
  console.warn('importSessionData with string is deprecated, use file import instead');
  return false;
};

// New functions for the SQLite system
export const createNewSession = () => sessionManager.createSession();
export const loadSession = (sessionKey: string) => sessionManager.loadSession(sessionKey);
export const importSessionFromFile = (file: File) => sessionManager.importSessionFromFile(file);
export const exportSessionToFile = () => sessionManager.exportSessionToFile();
