
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, X, BookOpen, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import DeckCard from "@/components/DeckCard";
import { getDecks, getFlashcardsByDeck, getUser, getThemesByDeck, deleteDeck } from "@/lib/localStorage";
import { getSessionKey } from "@/lib/sessionManager";

const MyDecksPage = () => {
  const [myDecks, setMyDecks] = useState<any[]>([]);
  const [filteredDecks, setFilteredDecks] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get current user
    const userData = getUser();
    setUser(userData);
    
    // Load decks from localStorage
    loadDecks();
  }, []);

  const loadDecks = () => {
    const userData = getUser();
    const userId = userData?.id || getSessionKey() || "anonymous";
    
    // Get all decks
    const allDecks = getDecks();
    
    // Filter to only show user's decks
    const userDecks = allDecks.filter(deck => {
      // Check if the current user is the author of the deck
      return deck.authorId === userId;
    });
    
    // Get unique tags from user's decks
    const tags = new Set<string>();
    userDecks.forEach(deck => {
      deck.tags.forEach(tag => tags.add(tag));
    });
    setAllTags(Array.from(tags));

    // Convert to deck cards format
    const deckCards = userDecks.map(deck => {
      const cards = getFlashcardsByDeck(deck.id);
      const themes = getThemesByDeck(deck.id);
      
      return {
        id: deck.id,
        title: deck.title,
        description: deck.description,
        coverImage: deck.coverImage,
        cardCount: cards.length,
        themeCount: themes.length,
        tags: deck.tags,
        author: userData?.name || "Anonyme",
        isPublic: deck.isPublic,
        authorId: deck.authorId,
        createdAt: deck.createdAt,
      };
    });

    setMyDecks(deckCards);
    setFilteredDecks(deckCards);
  };

  useEffect(() => {
    filterDecks();
  }, [searchTerm, activeFilters, myDecks]);

  const filterDecks = () => {
    let result = [...myDecks];

    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        deck => 
          deck.title.toLowerCase().includes(term) || 
          deck.description.toLowerCase().includes(term) ||
          deck.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Apply tag filters
    if (activeFilters.length > 0) {
      result = result.filter(deck => 
        activeFilters.some(filter => deck.tags.includes(filter))
      );
    }

    setFilteredDecks(result);
  };

  const toggleFilter = (tag: string) => {
    setActiveFilters(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setActiveFilters([]);
  };

  const handleDeleteDeck = (deckId: string) => {
    // Show confirmation before deleting
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce deck ? Cette action est irréversible.")) {
      const deleted = deleteDeck(deckId);
      
      if (deleted) {
        toast({
          title: "Deck supprimé",
          description: "Le deck a été supprimé avec succès",
        });
        
        // Reload decks
        loadDecks();
      } else {
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la suppression du deck",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="container px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between mb-6 sm:mb-8">
        <div className="text-center md:text-left">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Mes Decks
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground px-2 sm:px-0">
            Gérez et organisez vos decks de flashcards personnels
          </p>
        </div>
        <Button asChild variant="default" size="sm" className="w-full md:w-auto">
          <Link to="/create" className="flex items-center justify-center">
            <Plus className="mr-2 h-4 w-4" />
            <span className="text-sm sm:text-base">Créer un nouveau deck</span>
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher dans mes decks..."
            className="pl-9 text-sm sm:text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {activeFilters.length > 0 && (
          <div className="flex justify-center md:justify-start">
            <Button variant="outline" size="sm" onClick={clearFilters} className="text-xs sm:text-sm">
              <X className="mr-1 h-3 w-3" />
              Effacer les filtres
            </Button>
          </div>
        )}
      </div>

      {allTags.length > 0 && (
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
            <div className="flex items-center">
              <Filter className="mr-1 h-4 w-4 text-muted-foreground" />
              <span className="text-xs sm:text-sm font-medium">Filtres:</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={activeFilters.includes(tag) ? "default" : "outline"}
                className="cursor-pointer text-xs sm:text-sm px-2 py-1"
                onClick={() => toggleFilter(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 max-w-sm mx-auto md:mx-0">
          <TabsTrigger value="grid" className="text-xs sm:text-sm">Grille</TabsTrigger>
          <TabsTrigger value="list" className="text-xs sm:text-sm">Liste</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-0">
          {filteredDecks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredDecks.map((deck) => (
                <DeckCard 
                  key={deck.id} 
                  {...deck} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 px-4">
              <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
              <p className="text-base sm:text-lg text-muted-foreground mb-2">
                Aucun deck ne correspond à votre recherche
              </p>
              {activeFilters.length > 0 || searchTerm ? (
                <Button variant="link" onClick={clearFilters} className="text-sm sm:text-base">
                  Réinitialiser les filtres
                </Button>
              ) : (
                <div className="mt-4 space-y-3">
                  <p className="text-sm sm:text-base mb-4">Vous n'avez pas encore créé de deck</p>
                  <Button asChild size="sm" className="w-full sm:w-auto">
                    <Link to="/create">
                      <Plus className="mr-2 h-4 w-4" />
                      Créer un deck
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          {filteredDecks.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {filteredDecks.map((deck) => (
                <Card key={deck.id} className="border-indigo-100 dark:border-indigo-900/30">
                  <CardHeader className="pb-2 px-4 sm:px-6">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg sm:text-xl truncate">
                          <Link to={`/deck/${deck.id}`} className="hover:underline">
                            {deck.title}
                          </Link>
                        </CardTitle>
                        <CardDescription className="mt-1 line-clamp-2 text-sm sm:text-base">
                          {deck.description}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-more-vertical"
                            >
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="12" cy="5" r="1" />
                              <circle cx="12" cy="19" r="1" />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem asChild>
                            <Link to={`/deck/${deck.id}`} className="text-sm">
                              <BookOpen className="h-4 w-4 mr-2" />
                              Voir
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/deck/${deck.id}/edit`} className="text-sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive text-sm"
                            onClick={() => handleDeleteDeck(deck.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2 px-4 sm:px-6">
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {deck.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs px-2 py-1">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="px-4 sm:px-6">
                    <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex gap-3 sm:gap-4">
                        <span>{deck.cardCount} cartes</span>
                        <span>{deck.themeCount} thèmes</span>
                      </div>
                      <Badge variant={deck.isPublic ? "default" : "outline"} className="text-xs">
                        {deck.isPublic ? "Public" : "Privé"}
                      </Badge>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 px-4">
              <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
              <p className="text-base sm:text-lg text-muted-foreground mb-2">
                Aucun deck ne correspond à votre recherche
              </p>
              {activeFilters.length > 0 || searchTerm ? (
                <Button variant="link" onClick={clearFilters} className="text-sm sm:text-base">
                  Réinitialiser les filtres
                </Button>
              ) : (
                <div className="mt-4 space-y-3">
                  <p className="text-sm sm:text-base mb-4">Vous n'avez pas encore créé de deck</p>
                  <Button asChild size="sm" className="w-full sm:w-auto">
                    <Link to="/create">
                      <Plus className="mr-2 h-4 w-4" />
                      Créer un deck
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyDecksPage;
