
// Helper pour les fonctionnalités d'IA

interface AIRequest {
  question: string;
  answer: string;
  additionalContext?: string;
  model?: string;
}

/**
 * Applique l'IA pour générer des explications, des conseils, etc.
 * @param params Paramètres de la requête d'IA
 * @returns Texte généré par l'IA
 */
export const applyAI = async (params: AIRequest): Promise<string> => {
  const { question, answer, additionalContext, model = "gemini-1.5-flash" } = params;
  
  // Dans une vraie implémentation, vous feriez appel à une API externe
  // Pour cette démonstration, nous simulons une réponse
  
  // Simulation d'une requête API avec un délai
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Exemples de réponses simulées basées sur le contenu
  if (question.toLowerCase().includes("gemini") || answer.toLowerCase().includes("gemini")) {
    return "Gemini est un modèle d'IA développé par Google DeepMind. Gemini 1.5 Flash est une version optimisée pour des réponses rapides. Ce modèle se distingue par sa capacité à comprendre du texte, des images et même des vidéos.";
  }
  
  if (question.toLowerCase().includes("flashcard") || answer.toLowerCase().includes("flashcard")) {
    return "Les flashcards sont un outil d'apprentissage basé sur la répétition espacée. Elles améliorent la mémorisation en exploitant le principe de la récupération active, c'est-à-dire en vous forçant à vous rappeler l'information plutôt que simplement la relire.";
  }
  
  // Réponses génériques basées sur la longueur du texte
  if (question.length + answer.length < 20) {
    return "Cette carte semble contenir des informations concises, comme une définition ou un terme spécifique. Pour mieux mémoriser, essayez de créer des associations mentales ou des mnémoniques.";
  }
  
  if (answer.length > 100) {
    return "Cette information est assez détaillée. Pour mieux la retenir, essayez de la découper en éléments plus petits et de créer des connections avec ce que vous connaissez déjà. La technique du \"chunking\" (regroupement d'informations) est particulièrement efficace pour ce type de contenu.";
  }
  
  // Réponse par défaut
  return "Pour mieux retenir cette information, essayez de la reformuler avec vos propres mots et de l'associer à quelque chose que vous connaissez déjà. La répétition espacée est également une technique efficace : revoyez cette carte aujourd'hui, puis dans 2 jours, puis dans une semaine.";
};

/**
 * Détecte les erreurs potentielles dans les réponses
 * @param studentAnswer Réponse de l'étudiant
 * @param correctAnswer Réponse correcte
 * @returns Analyse des erreurs
 */
export const analyzeAnswer = async (studentAnswer: string, correctAnswer: string): Promise<string> => {
  // Simulation d'une analyse d'erreur
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Comparer les réponses (version simplifiée)
  const similarity = calculateSimilarity(studentAnswer, correctAnswer);
  
  if (similarity > 0.8) {
    return "Votre réponse est globalement correcte, avec quelques légères différences dans la formulation.";
  } else if (similarity > 0.5) {
    return "Votre réponse contient des éléments corrects, mais il manque des informations importantes ou certains points sont imprécis.";
  } else {
    return "Votre réponse s'écarte significativement de la réponse attendue. Revoyez attentivement les concepts clés.";
  }
};

// Fonction utilitaire pour calculer la similarité entre deux chaînes (version simplifiée)
const calculateSimilarity = (a: string, b: string): number => {
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();
  
  // Diviser en mots
  const aWords = aLower.split(/\s+/).filter(w => w.length > 2);
  const bWords = bLower.split(/\s+/).filter(w => w.length > 2);
  
  // Compter les mots communs
  const commonWords = aWords.filter(word => bWords.includes(word));
  
  // Calculer la similarité comme le rapport entre les mots communs et le total des mots uniques
  const uniqueWords = new Set([...aWords, ...bWords]);
  return commonWords.length / uniqueWords.size;
};
