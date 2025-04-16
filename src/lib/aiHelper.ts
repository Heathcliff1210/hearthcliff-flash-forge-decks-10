
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
  
  console.log(`Utilisation du modèle: ${model}`);
  
  // Dans une vraie implémentation, vous feriez appel à une API externe
  // Pour cette démonstration, nous simulons une réponse
  
  // Simulation d'une requête API avec un délai
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Exemples de réponses simulées basées sur le contenu
  if (question.toLowerCase().includes("gemini") || answer.toLowerCase().includes("gemini")) {
    return "Gemini est un modèle d'IA développé par Google DeepMind. Gemini 1.5 Flash est une version optimisée pour des réponses rapides tout en maintenant une haute qualité. Ce modèle multimodal se distingue par sa capacité à comprendre et analyser du texte, des images et même des vidéos.";
  }
  
  if (question.toLowerCase().includes("flashcard") || answer.toLowerCase().includes("flashcard")) {
    return "Les flashcards sont un outil d'apprentissage basé sur la répétition espacée. Elles améliorent la mémorisation en exploitant le principe de la récupération active, c'est-à-dire en vous forçant à vous rappeler l'information plutôt que simplement la relire. Le modèle Gemini 1.5 Flash peut vous aider à générer des explications détaillées pour chaque carte.";
  }
  
  // Réponses basées sur la complexité du contenu
  if (question.length + answer.length < 20) {
    return "Cette carte semble contenir des informations concises, comme une définition ou un terme spécifique. Pour mieux mémoriser, essayez de créer des associations mentales ou des mnémoniques. Gemini 1.5 Flash recommande de revoir cette information fréquemment au début, puis d'espacer progressivement les révisions.";
  }
  
  if (answer.length > 100) {
    return "Cette information est assez détaillée. Pour mieux la retenir, essayez de la découper en éléments plus petits et de créer des connections avec ce que vous connaissez déjà. La technique du \"chunking\" (regroupement d'informations) est particulièrement efficace pour ce type de contenu. Gemini 1.5 Flash suggère également de transformer certains concepts en images mentales pour faciliter la mémorisation.";
  }
  
  // Réponse par défaut
  return "Selon Gemini 1.5 Flash, pour mieux retenir cette information, il est recommandé de la reformuler avec vos propres mots et de l'associer à quelque chose que vous connaissez déjà. La répétition espacée est une technique efficace : revoyez cette carte aujourd'hui, puis dans 2 jours, puis dans une semaine, et enfin dans un mois pour une mémorisation optimale.";
};

/**
 * Détecte les erreurs potentielles dans les réponses
 * @param studentAnswer Réponse de l'étudiant
 * @param correctAnswer Réponse correcte
 * @returns Analyse des erreurs
 */
export const analyzeAnswer = async (studentAnswer: string, correctAnswer: string): Promise<string> => {
  // Simulation d'une analyse d'erreur avec Gemini 1.5 Flash
  await new Promise(resolve => setTimeout(resolve, 600));
  
  console.log("Analyse avec Gemini 1.5 Flash");
  
  // Comparer les réponses (version améliorée)
  const similarity = calculateSimilarity(studentAnswer, correctAnswer);
  
  if (similarity > 0.8) {
    return "Votre réponse est globalement correcte, avec quelques légères différences dans la formulation. D'après l'analyse de Gemini 1.5 Flash, vous maîtrisez bien ce concept.";
  } else if (similarity > 0.5) {
    return "Votre réponse contient des éléments corrects, mais il manque des informations importantes ou certains points sont imprécis. Gemini 1.5 Flash vous suggère de revoir certains détails clés.";
  } else {
    return "Selon Gemini 1.5 Flash, votre réponse s'écarte significativement de la réponse attendue. Il serait bénéfique de revoir en profondeur les concepts fondamentaux de cette carte.";
  }
};

// Fonction utilitaire pour calculer la similarité entre deux chaînes (version améliorée)
const calculateSimilarity = (a: string, b: string): number => {
  const aLower = a.toLowerCase().trim();
  const bLower = b.toLowerCase().trim();
  
  if (aLower === bLower) return 1.0;
  if (aLower.length === 0 || bLower.length === 0) return 0.0;
  
  // Diviser en mots et retirer les mots très courts
  const aWords = aLower.split(/\s+/).filter(w => w.length > 2);
  const bWords = bLower.split(/\s+/).filter(w => w.length > 2);
  
  if (aWords.length === 0 || bWords.length === 0) return 0.1;
  
  // Compter les mots communs
  const commonWords = aWords.filter(word => bWords.includes(word));
  
  // Calculer la similarité comme le rapport entre les mots communs et le total des mots uniques
  const uniqueWords = new Set([...aWords, ...bWords]);
  return commonWords.length / uniqueWords.size;
};

/**
 * Génère des suggestions d'apprentissage basées sur les performances
 * @param correctCount Nombre de réponses correctes
 * @param totalCount Nombre total de questions
 * @returns Suggestions personnalisées
 */
export const generateLearningSuggestions = async (correctCount: number, totalCount: number): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const percentage = (correctCount / totalCount) * 100;
  
  if (percentage >= 90) {
    return "Excellente performance ! Gemini 1.5 Flash suggère de passer à un niveau plus avancé ou d'espacer davantage vos révisions pour ce sujet que vous maîtrisez bien.";
  } else if (percentage >= 70) {
    return "Bonne maîtrise du sujet. D'après Gemini 1.5 Flash, vous devriez continuer à réviser régulièrement, mais vous pouvez réduire la fréquence pour les concepts bien assimilés.";
  } else if (percentage >= 50) {
    return "Progression encourageante. Gemini 1.5 Flash recommande de concentrer vos efforts sur les cartes les plus difficiles et de réviser ce sujet tous les 2-3 jours.";
  } else {
    return "Ce sujet nécessite plus de travail. Selon Gemini 1.5 Flash, vous devriez fractionner votre apprentissage en sessions plus courtes mais plus fréquentes, et utiliser des techniques de mémorisation variées.";
  }
};
