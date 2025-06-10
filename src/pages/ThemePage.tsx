import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  ChevronLeft, 
  PlusCircle, 
  ArrowLeft,
  Check,
  X,
  Info,
  Edit,
  Trash2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import FlashCard from "@/components/FlashCard";
import FlashCardItem from "@/components/FlashCardItem";

import { 
  getDeck, 
  getTheme, 
  getFlashcardsByTheme, 
  getUser, 
  createFlashcard, 
  getBase64,
  updateFlashcard,
  deleteFlashcard,
  deleteTheme,
  updateTheme,
  Flashcard,
  Theme,
  Deck
} from "@/lib/localStorage";

const ThemePage = () => {
  const { deckId, themeId } = useParams<{ deckId: string; themeId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [user, setUser] = useState(getUser());
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCardDialog, setShowCardDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showFrontAdditionalInfo, setShowFrontAdditionalInfo] = useState(false);
  const [showBackAdditionalInfo, setShowBackAdditionalInfo] = useState(false);

  const [editingTheme, setEditingTheme] = useState({
    title: "",
    description: "",
  });

  const [newCard, setNewCard] = useState({
    front: {
      text: "",
      image: undefined as string | undefined,
      audio: undefined as string | undefined,
      additionalInfo: "",
    },
    back: {
      text: "",
      image: undefined as string | undefined,
      audio: undefined as string | undefined,
      additionalInfo: "",
    },
  });

  useEffect(() => {
    if (!deckId || !themeId) return;
    
    const deckData = getDeck(deckId);
    if (!deckData) {
      toast({
        title: "Deck introuvable",
        description: "Le deck que vous recherchez n'existe pas",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
    
    const themeData = getTheme(themeId);
    if (!themeData) {
      toast({
        title: "Thème introuvable",
        description: "Le thème que vous recherchez n'existe pas",
        variant: "destructive",
      });
      navigate(`/deck/${deckId}`);
      return;
    }
    
    setDeck(deckData);
    setTheme(themeData);
    
    const currentUser = getUser();
    setUser(currentUser);
    
    let ownerStatus = false;
    
    if (deckData.authorId === "anonymous") {
      ownerStatus = true;
    } 
    else if (currentUser && deckData.authorId === currentUser.id) {
      ownerStatus = true;
    }
    
    console.log("Theme page owner status check:", {
      deckAuthorId: deckData.authorId,
      userId: currentUser?.id,
      isOwner: ownerStatus
    });
    
    setIsOwner(ownerStatus);
    
    setEditingTheme({
      title: themeData.title,
      description: themeData.description,
    });
    
    const themeCards = getFlashcardsByTheme(themeId);
    setFlashcards(themeCards);
    
    setIsLoading(false);
  }, [deckId, themeId, navigate, toast]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "L'image ne doit pas dépasser 5 Mo",
          variant: "destructive",
        });
        return;
      }
      
      const base64 = await getBase64(file);
      
      if (side === 'front') {
        setNewCard({
          ...newCard,
          front: { ...newCard.front, image: base64 },
        });
      } else {
        setNewCard({
          ...newCard,
          back: { ...newCard.back, image: base64 },
        });
      }
    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        title: "Erreur",
        description: "Impossible de traiter l'image",
        variant: "destructive",
      });
    }
  };
  
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "Le fichier audio ne doit pas dépasser 10 Mo",
          variant: "destructive",
        });
        return;
      }
      
      if (!file.type.startsWith("audio/")) {
        toast({
          title: "Format non supporté",
          description: "Veuillez sélectionner un fichier audio",
          variant: "destructive",
        });
        return;
      }
      
      const base64 = await getBase64(file);
      
      if (side === 'front') {
        setNewCard({
          ...newCard,
          front: { ...newCard.front, audio: base64 },
        });
      } else {
        setNewCard({
          ...newCard,
          back: { ...newCard.back, audio: base64 },
        });
      }
    } catch (error) {
      console.error("Error processing audio:", error);
      toast({
        title: "Erreur",
        description: "Impossible de traiter le fichier audio",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCard = (cardId: string) => {
    const updatedCards = flashcards.filter(card => card.id !== cardId);
    setFlashcards(updatedCards);
  };

  const handleUpdateCard = (updatedCard: Flashcard) => {
    const updatedCards = flashcards.map(card => 
      card.id === updatedCard.id ? updatedCard : card
    );
    setFlashcards(updatedCards);
  };

  const handleUpdateTheme = () => {
    if (!theme || !themeId) return;
    
    if (!editingTheme.title.trim()) {
      toast({
        title: "Titre requis",
        description: "Veuillez saisir un titre pour le thème",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const updated = updateTheme(themeId, {
        title: editingTheme.title.trim(),
        description: editingTheme.description.trim(),
      });
      
      if (updated) {
        setTheme(updated);
        setShowEditDialog(false);
        toast({
          title: "Thème mis à jour",
          description: "Le thème a été modifié avec succès",
        });
      }
    } catch (error) {
      console.error("Error updating theme:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le thème",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTheme = () => {
    if (!theme || !themeId || !deckId) return;
    
    try {
      const success = deleteTheme(themeId);
      if (success) {
        toast({
          title: "Thème supprimé",
          description: "Le thème a été supprimé avec succès",
        });
        navigate(`/deck/${deckId}`);
      }
    } catch (error) {
      console.error("Error deleting theme:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le thème",
        variant: "destructive",
      });
    }
  };

  const createNewCard = () => {
    if (!deckId || !themeId) return;
    
    if (!newCard.front.text.trim() && !newCard.front.image) {
      toast({
        title: "Contenu requis",
        description: "Veuillez ajouter du texte ou une image au recto de la carte",
        variant: "destructive",
      });
      return;
    }
    
    if (!newCard.back.text.trim() && !newCard.back.image) {
      toast({
        title: "Contenu requis",
        description: "Veuillez ajouter du texte ou une image au verso de la carte",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const frontData = {
        text: newCard.front.text.trim(),
        image: newCard.front.image,
        audio: newCard.front.audio,
        additionalInfo: showFrontAdditionalInfo ? newCard.front.additionalInfo.trim() : undefined
      };
      
      const backData = {
        text: newCard.back.text.trim(),
        image: newCard.back.image,
        audio: newCard.back.audio,
        additionalInfo: showBackAdditionalInfo ? newCard.back.additionalInfo.trim() : undefined
      };
      
      const card = createFlashcard({
        deckId,
        themeId,
        front: frontData,
        back: backData,
      });
      
      setFlashcards([...flashcards, card]);
      setShowCardDialog(false);
      
      setNewCard({
        front: {
          text: "",
          image: undefined,
          audio: undefined,
          additionalInfo: "",
        },
        back: {
          text: "",
          image: undefined,
          audio: undefined,
          additionalInfo: "",
        },
      });
      setShowFrontAdditionalInfo(false);
      setShowBackAdditionalInfo(false);
      
      toast({
        title: "Carte créée",
        description: "La flashcard a été ajoutée avec succès",
      });
    } catch (error) {
      console.error("Error creating flashcard:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la flashcard",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container px-3 sm:px-4 py-4 sm:py-8 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!deck || !theme) {
    return (
      <div className="container px-3 sm:px-4 py-4 sm:py-8">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">Thème introuvable</h1>
          <p className="text-muted-foreground mb-6">
            Le thème que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <Button asChild>
            <Link to="/">Retour à l'accueil</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-3 sm:px-4 py-4 sm:py-8">
      <Link to={`/deck/${deckId}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-1 h-4 w-4" />
        Retour au deck
      </Link>
      
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {theme.coverImage ? (
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div className="aspect-video md:aspect-square rounded-xl overflow-hidden border shadow-md transition-all duration-300 hover:shadow-lg">
              <img
                src={theme.coverImage}
                alt={theme.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ) : (
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div className="aspect-video md:aspect-square rounded-xl overflow-hidden border bg-gradient-to-r from-accent/30 to-primary/30 flex items-center justify-center shadow-md transition-all duration-300 hover:shadow-lg">
              <BookOpen className="h-16 w-16 text-primary/50" />
            </div>
          </div>
        )}
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center mb-2">
                <span className="text-sm text-muted-foreground mr-2">
                  {deck.title}
                </span>
                <ChevronLeft className="h-3 w-3 text-muted-foreground mx-1" />
                <h1 className="text-3xl font-bold">{theme.title}</h1>
              </div>
              <p className="text-muted-foreground mb-6">
                {theme.description}
              </p>
            </div>
            
            {isOwner && (
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-primary hover:text-primary/80 hover:bg-primary/10"
                  onClick={() => setShowEditDialog(true)}
                >
                  <Edit className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button asChild className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow transition-all duration-300 hover:shadow-md">
              <Link to={`/deck/${deckId}/theme/${themeId}/study`}>
                <BookOpen className="mr-2 h-4 w-4" />
                Étudier ce thème
              </Link>
            </Button>
            
            {isOwner && (
              <Button 
                variant="outline" 
                onClick={() => setShowCardDialog(true)}
                className="border-primary/30 hover:border-primary/60 transition-all duration-300"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Ajouter une carte
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Cartes dans ce thème ({flashcards.length})</h2>
          {isOwner && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowCardDialog(true)}
              className="border-primary/30 hover:border-primary/60 transition-all duration-300"
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Ajouter une carte
            </Button>
          )}
        </div>
        
        {flashcards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flashcards.map((card) => (
              <FlashCardItem 
                key={card.id} 
                card={card} 
                onDelete={() => handleDeleteCard(card.id)}
                onUpdate={handleUpdateCard}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg bg-secondary/20">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-medium mb-2">Aucune carte</h3>
            <p className="text-muted-foreground mb-6">
              Ce thème ne contient pas encore de flashcards
            </p>
            {isOwner && (
              <Button onClick={() => setShowCardDialog(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Ajouter une carte
              </Button>
            )}
          </div>
        )}
      </div>
      
      <Dialog open={showCardDialog} onOpenChange={setShowCardDialog}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-3 sm:p-6">
          <DialogHeader className="pb-2 sm:pb-4">
            <DialogTitle className="text-lg sm:text-xl">Ajouter une flashcard au thème {theme.title}</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Créez une nouvelle flashcard pour ce thème
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 py-2 sm:py-4">
            <div className="space-y-3 sm:space-y-4 border p-3 sm:p-4 rounded-lg">
              <h3 className="font-medium text-sm sm:text-base">Recto de la carte</h3>
              
              <div className="space-y-2">
                <Label htmlFor="front-text" className="text-sm">Texte</Label>
                <Textarea
                  id="front-text"
                  placeholder="Ex: Définition, question, mot..."
                  rows={3}
                  className="text-sm sm:text-base resize-none"
                  value={newCard.front.text}
                  onChange={(e) => setNewCard({
                    ...newCard,
                    front: { ...newCard.front, text: e.target.value },
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="front-image" className="text-sm">Image (optionnelle)</Label>
                <Input
                  id="front-image"
                  type="file"
                  accept="image/*"
                  className="text-sm"
                  onChange={(e) => handleImageUpload(e, 'front')}
                />
                {newCard.front.image && (
                  <div className="mt-2 relative w-full h-24 sm:h-32 rounded-md overflow-hidden border">
                    <img
                      src={newCard.front.image}
                      alt="Front side"
                      className="w-full h-full object-contain"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full"
                      onClick={() => setNewCard({
                        ...newCard,
                        front: { ...newCard.front, image: undefined },
                      })}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="front-audio" className="text-sm">Audio (optionnel)</Label>
                <Input
                  id="front-audio"
                  type="file"
                  accept="audio/*"
                  className="text-sm"
                  onChange={(e) => handleAudioUpload(e, 'front')}
                />
                {newCard.front.audio && (
                  <div className="mt-2 relative">
                    <audio className="w-full h-8" controls>
                      <source src={newCard.front.audio} />
                      Votre navigateur ne supporte pas l'élément audio.
                    </audio>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-1 right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full"
                      onClick={() => setNewCard({
                        ...newCard,
                        front: { ...newCard.front, audio: undefined },
                      })}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="show-front-additional-info" 
                  checked={showFrontAdditionalInfo}
                  onCheckedChange={(checked) => {
                    setShowFrontAdditionalInfo(checked as boolean);
                  }}
                />
                <label 
                  htmlFor="show-front-additional-info" 
                  className="text-xs sm:text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Ajouter des informations supplémentaires
                </label>
              </div>

              {showFrontAdditionalInfo && (
                <div className="space-y-2">
                  <Label htmlFor="front-additional-info" className="text-sm">Informations supplémentaires</Label>
                  <Textarea
                    id="front-additional-info"
                    placeholder="Notes, contexte ou détails complémentaires..."
                    rows={3}
                    className="text-sm sm:text-base resize-none"
                    value={newCard.front.additionalInfo}
                    onChange={(e) => setNewCard({
                      ...newCard,
                      front: { ...newCard.front, additionalInfo: e.target.value },
                    })}
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-3 sm:space-y-4 border p-3 sm:p-4 rounded-lg">
              <h3 className="font-medium text-sm sm:text-base">Verso de la carte</h3>
              
              <div className="space-y-2">
                <Label htmlFor="back-text" className="text-sm">Texte</Label>
                <Textarea
                  id="back-text"
                  placeholder="Ex: Réponse, traduction..."
                  rows={3}
                  className="text-sm sm:text-base resize-none"
                  value={newCard.back.text}
                  onChange={(e) => setNewCard({
                    ...newCard,
                    back: { ...newCard.back, text: e.target.value },
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="back-image" className="text-sm">Image (optionnelle)</Label>
                <Input
                  id="back-image"
                  type="file"
                  accept="image/*"
                  className="text-sm"
                  onChange={(e) => handleImageUpload(e, 'back')}
                />
                {newCard.back.image && (
                  <div className="mt-2 relative w-full h-24 sm:h-32 rounded-md overflow-hidden border">
                    <img
                      src={newCard.back.image}
                      alt="Back side"
                      className="w-full h-full object-contain"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full"
                      onClick={() => setNewCard({
                        ...newCard,
                        back: { ...newCard.back, image: undefined },
                      })}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="back-audio" className="text-sm">Audio (optionnel)</Label>
                <Input
                  id="back-audio"
                  type="file"
                  accept="audio/*"
                  className="text-sm"
                  onChange={(e) => handleAudioUpload(e, 'back')}
                />
                {newCard.back.audio && (
                  <div className="mt-2 relative">
                    <audio className="w-full h-8" controls>
                      <source src={newCard.back.audio} />
                      Votre navigateur ne supporte pas l'élément audio.
                    </audio>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-1 right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full"
                      onClick={() => setNewCard({
                        ...newCard,
                        back: { ...newCard.back, audio: undefined },
                      })}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="show-back-additional-info" 
                  checked={showBackAdditionalInfo}
                  onCheckedChange={(checked) => {
                    setShowBackAdditionalInfo(checked as boolean);
                  }}
                />
                <label 
                  htmlFor="show-back-additional-info" 
                  className="text-xs sm:text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Ajouter des informations supplémentaires
                </label>
              </div>

              {showBackAdditionalInfo && (
                <div className="space-y-2">
                  <Label htmlFor="back-additional-info" className="text-sm">Informations supplémentaires</Label>
                  <Textarea
                    id="back-additional-info"
                    placeholder="Notes, contexte ou détails complémentaires..."
                    rows={3}
                    className="text-sm sm:text-base resize-none"
                    value={newCard.back.additionalInfo}
                    onChange={(e) => setNewCard({
                      ...newCard,
                      back: { ...newCard.back, additionalInfo: e.target.value },
                    })}
                  />
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 pt-2 sm:pt-4">
            <Button variant="outline" onClick={() => setShowCardDialog(false)} className="w-full sm:w-auto order-2 sm:order-1">
              Annuler
            </Button>
            <Button onClick={createNewCard} className="w-full sm:w-auto order-1 sm:order-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary">
              <Check className="mr-2 h-4 w-4" />
              Ajouter la carte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le thème</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Titre</Label>
              <Input
                id="edit-title"
                value={editingTheme.title}
                onChange={(e) => setEditingTheme({ ...editingTheme, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                rows={3}
                value={editingTheme.description}
                onChange={(e) => setEditingTheme({ ...editingTheme, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateTheme}>
              <Check className="mr-2 h-4 w-4" />
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le thème</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le thème "{theme.title}" ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteTheme}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ThemePage;
