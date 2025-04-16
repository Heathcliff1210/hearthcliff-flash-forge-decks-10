
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, X, CheckCircle2, XCircle, RotateCcw, Brain, Volume2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getDeck, getFlashcardsByDeck, Flashcard, Deck } from "@/lib/localStorage";
import { recordCardStudy, updateSessionStats } from "@/lib/sessionManager";
import { useIsMobile } from "@/hooks/use-mobile";
import { applyAI } from "@/lib/aiHelper";

const StudyPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyStartTime, setStudyStartTime] = useState<Date | null>(null);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [results, setResults] = useState({ correct: 0, incorrect: 0 });
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [cardsShuffled, setCardsShuffled] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Initialisation des données
  useEffect(() => {
    if (!id) return;

    const deckData = getDeck(id);
    if (!deckData) {
      toast({
        title: "Deck introuvable",
        description: "Le deck demandé n'existe pas",
        variant: "destructive",
      });
      navigate("/home");
      return;
    }

    setDeck(deckData);

    // Récupérer les cartes du deck
    const deckCards = getFlashcardsByDeck(id);
    if (deckCards.length === 0) {
      toast({
        title: "Deck vide",
        description: "Ce deck ne contient aucune flashcard",
        variant: "destructive",
      });
      navigate(`/deck/${id}`);
      return;
    }

    // Mélanger les cartes
    const shuffled = [...deckCards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCardsShuffled(true);
    
    // Démarrer le timer d'étude
    setStudyStartTime(new Date());
    
    // Enregistrer le début d'une session d'étude
    updateSessionStats({
      studySessions: 1,
      lastStudyDate: new Date().toISOString(),
    });
  }, [id, navigate, toast]);

  // Flip de la carte
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // Aller à la carte précédente
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
      setAiExplanation(null);
    }
  };

  // Aller à la carte suivante
  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      setAiExplanation(null);
    } else {
      // Fin de l'étude
      handleEndStudy();
    }
  };

  // Réponse correcte
  const handleCorrect = () => {
    // Enregistrer la réponse correcte
    recordCardStudy(true);
    setResults(prev => ({ ...prev, correct: prev.correct + 1 }));
    handleNext();
  };

  // Réponse incorrecte
  const handleIncorrect = () => {
    // Enregistrer la réponse incorrecte
    recordCardStudy(false);
    setResults(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
    handleNext();
  };

  // Fin de l'étude
  const handleEndStudy = () => {
    if (studyStartTime) {
      // Calculer le temps passé en minutes
      const endTime = new Date();
      const timeSpent = Math.round((endTime.getTime() - studyStartTime.getTime()) / 60000);
      
      // Mettre à jour les statistiques
      updateSessionStats({
        totalStudyTime: timeSpent,
        cardsReviewed: cards.length,
        correctAnswers: results.correct,
        incorrectAnswers: results.incorrect,
      });
    }
    
    // Afficher la boîte de dialogue de fin
    setShowEndDialog(true);
  };

  // Demander une explication à l'IA
  const handleAskAI = async () => {
    if (!cards[currentIndex]) return;
    
    setIsLoadingAI(true);
    try {
      const card = cards[currentIndex];
      const question = card.front.text;
      const answer = card.back.text;
      
      const explanation = await applyAI({
        question,
        answer,
        model: "gemini-1.5-flash"
      });
      
      setAiExplanation(explanation);
    } catch (error) {
      console.error("Erreur lors de la demande d'explication à l'IA:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'obtenir une explication de l'IA",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Jouer l'audio
  const playAudio = (audioSrc: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioSrc;
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error);
      });
    }
  };

  // Recommencer l'étude
  const handleRestartStudy = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setResults({ correct: 0, incorrect: 0 });
    setShowEndDialog(false);
    setStudyStartTime(new Date());
    
    // Mélanger à nouveau les cartes
    setCards(prevCards => [...prevCards].sort(() => Math.random() - 0.5));
  };

  // Revenir au deck
  const handleReturnToDeck = () => {
    if (id) {
      navigate(`/deck/${id}`);
    } else {
      navigate("/home");
    }
  };

  if (!deck || cards.length === 0 || !cardsShuffled) {
    return (
      <div className="container flex flex-col items-center justify-center py-12">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="rounded-full bg-primary/20 h-12 w-12 flex items-center justify-center">
            <Brain className="h-6 w-6 text-primary/50 animate-spin" />
          </div>
          <div className="h-4 bg-primary/20 rounded w-48"></div>
          <div className="h-3 bg-primary/10 rounded w-36"></div>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const progress = Math.round(((currentIndex + 1) / cards.length) * 100);

  return (
    <div className="container px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col space-y-6">
          {/* Header avec informations */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold mb-2">{deck.title}</h1>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {currentIndex + 1}/{cards.length} cartes
                </Badge>
                <Progress value={progress} className="h-2 w-24" />
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleReturnToDeck}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Retour au deck
            </Button>
          </div>

          {/* Carte d'étude */}
          <div className="relative perspective-1000 w-full min-h-[400px]">
            <div 
              className={`relative w-full h-full min-h-[400px] transition-transform duration-500 transform-style-3d ${isFlipped ? "rotate-y-180" : ""}`}
              onClick={handleFlip}
            >
              {/* Face avant */}
              <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-indigo-500/20 to-purple-600/30 dark:from-indigo-900/50 dark:to-purple-800/40 rounded-xl p-6 flex flex-col items-center justify-center gap-4 border border-indigo-200/60 dark:border-indigo-700/60 shadow-lg">
                {currentCard.front.image && (
                  <div className="w-full max-w-md aspect-video overflow-hidden rounded-lg mb-4 border border-indigo-200/60 dark:border-indigo-700/60 shadow-md hover:shadow-lg transition-all duration-300">
                    <img
                      src={currentCard.front.image}
                      alt="Front side"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div className="text-2xl font-medium text-center text-primary dark:text-primary-foreground max-w-lg">
                  {currentCard.front.text}
                </div>
                
                {currentCard.front.additionalInfo && (
                  <div className="p-3 mt-2 bg-indigo-100/80 dark:bg-indigo-950/50 rounded-lg text-sm border border-indigo-200 dark:border-indigo-800 max-w-lg">
                    {currentCard.front.additionalInfo}
                  </div>
                )}

                {currentCard.front.audio && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      playAudio(currentCard.front.audio!);
                    }}
                    variant="outline"
                    size="sm"
                    className="mt-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800 border-indigo-200 dark:border-indigo-700"
                  >
                    <Volume2 className="h-4 w-4 mr-2" />
                    Écouter l'audio
                  </Button>
                )}
                
                <div className="absolute bottom-4 right-4 text-sm text-muted-foreground">
                  Cliquez pour voir la réponse
                </div>
              </div>
              
              {/* Face arrière */}
              <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-purple-500/20 to-pink-600/30 dark:from-purple-900/50 dark:to-pink-800/40 rounded-xl p-6 flex flex-col items-center justify-center gap-4 border border-purple-200/60 dark:border-purple-700/60 shadow-lg">
                {currentCard.back.image && (
                  <div className="w-full max-w-md aspect-video overflow-hidden rounded-lg mb-4 border border-purple-200/60 dark:border-purple-700/60 shadow-md hover:shadow-lg transition-all duration-300">
                    <img
                      src={currentCard.back.image}
                      alt="Back side"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div className="text-2xl font-medium text-center text-primary dark:text-primary-foreground max-w-lg">
                  {currentCard.back.text}
                </div>
                
                {currentCard.back.additionalInfo && (
                  <div className="p-3 mt-2 bg-pink-100/80 dark:bg-pink-950/50 rounded-lg text-sm border border-pink-200 dark:border-pink-800 max-w-lg">
                    {currentCard.back.additionalInfo}
                  </div>
                )}

                {currentCard.back.audio && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      playAudio(currentCard.back.audio!);
                    }}
                    variant="outline"
                    size="sm"
                    className="mt-2 bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-800 border-pink-200 dark:border-pink-700"
                  >
                    <Volume2 className="h-4 w-4 mr-2" />
                    Écouter l'audio
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Explication IA */}
          {aiExplanation && (
            <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  Explication de l'IA
                </h3>
                <div className="text-sm">
                  {aiExplanation}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Boutons de navigation et de réponse */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Précédent
              </Button>
              
              {!isFlipped ? (
                <Button onClick={handleFlip}>
                  Voir la réponse
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  {currentIndex < cards.length - 1 ? (
                    <>
                      Suivant
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </>
                  ) : (
                    "Terminer"
                  )}
                </Button>
              )}
            </div>
            
            {isFlipped && (
              <div className="flex gap-2 ml-auto">
                <Button 
                  variant="outline" 
                  onClick={handleAskAI}
                  disabled={isLoadingAI} 
                  className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                >
                  <Brain className={`h-4 w-4 mr-2 ${isLoadingAI ? 'animate-spin' : ''}`} />
                  {isLoadingAI ? "Chargement..." : aiExplanation ? "Nouvelle explication" : "Expliquer"}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleIncorrect}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Incorrect
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleCorrect}
                  className="bg-green-500/10 hover:bg-green-500/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Correct
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Boîte de dialogue de fin d'étude */}
      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Session d'étude terminée</DialogTitle>
            <DialogDescription>
              Vous avez terminé toutes les cartes de ce deck !
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-muted p-4 rounded-lg space-y-4">
              <h3 className="font-medium text-center">Résultats</h3>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-green-500/10 p-3 rounded-lg">
                  <div className="flex justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mb-1" />
                  </div>
                  <div className="text-sm font-medium">Correct</div>
                  <div className="text-2xl font-bold">{results.correct}</div>
                </div>
                
                <div className="bg-red-500/10 p-3 rounded-lg">
                  <div className="flex justify-center">
                    <XCircle className="h-5 w-5 text-red-500 mb-1" />
                  </div>
                  <div className="text-sm font-medium">Incorrect</div>
                  <div className="text-2xl font-bold">{results.incorrect}</div>
                </div>
              </div>
              
              <div className="bg-primary/10 p-3 rounded-lg text-center">
                <div className="text-sm font-medium">Taux de réussite</div>
                <div className="text-2xl font-bold">
                  {results.correct + results.incorrect > 0
                    ? Math.round((results.correct / (results.correct + results.incorrect)) * 100)
                    : 0}%
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={handleReturnToDeck}>
              <X className="h-4 w-4 mr-2" />
              Quitter
            </Button>
            
            <Button onClick={handleRestartStudy}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Recommencer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default StudyPage;
