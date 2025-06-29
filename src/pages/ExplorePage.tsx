
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { SearchIcon, Filter, X } from "lucide-react";
import DeckCard, { DeckCardProps } from "@/components/DeckCard";
import { getDecks, getFlashcardsByDeck, Deck, getUser } from "@/lib/localStorage";

const ExplorePage = () => {
  const [decks, setDecks] = useState<DeckCardProps[]>([]);
  const [filteredDecks, setFilteredDecks] = useState<DeckCardProps[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    // Get user for author name
    const user = getUser();

    // Load decks from localStorage
    const allDecks = getDecks();
    
    // Get unique tags from all decks
    const tags = new Set<string>();
    allDecks.forEach(deck => {
      deck.tags.forEach(tag => tags.add(tag));
    });
    setAllTags(Array.from(tags));

    // Convert to DeckCardProps
    const deckCards = allDecks.filter(deck => deck.isPublic).map(deck => {
      const cards = getFlashcardsByDeck(deck.id);
      return {
        id: deck.id,
        title: deck.title,
        description: deck.description,
        coverImage: deck.coverImage,
        cardCount: cards.length,
        tags: deck.tags,
        author: user?.name || "Anonyme",
        isPublic: deck.isPublic,
        authorId: deck.authorId, // Add the authorId property
        themeCount: 0, // Include default themeCount
      };
    });

    setDecks(deckCards);
    setFilteredDecks(deckCards);
  }, []);

  useEffect(() => {
    filterDecks();
  }, [searchTerm, activeFilters, decks]);

  const filterDecks = () => {
    let result = [...decks];

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

  return (
    <div className="container px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Explorer les Decks</h1>
          <p className="text-muted-foreground">
            Découvrez et importez des decks de flashcards créés par la communauté
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher des decks..."
            className="pl-9"
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

        <div className="flex gap-2 flex-wrap">
          {activeFilters.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="mr-1 h-3 w-3" />
              Effacer les filtres
            </Button>
          )}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <div className="flex items-center mr-2">
          <Filter className="mr-1 h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtres:</span>
        </div>
        {allTags.map(tag => (
          <Badge
            key={tag}
            variant={activeFilters.includes(tag) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => toggleFilter(tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="recent">Récents</TabsTrigger>
          <TabsTrigger value="popular">Populaires</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          {filteredDecks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDecks.map((deck) => (
                <DeckCard key={deck.id} {...deck} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                Aucun deck ne correspond à votre recherche
              </p>
              <Button variant="link" onClick={clearFilters}>
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDecks
              .sort((a, b) => {
                const deckA = getDecks().find(d => d.id === a.id);
                const deckB = getDecks().find(d => d.id === b.id);
                if (!deckA || !deckB) return 0;
                return new Date(deckB.createdAt).getTime() - new Date(deckA.createdAt).getTime();
              })
              .map((deck) => (
                <DeckCard key={deck.id} {...deck} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="popular" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDecks
              .sort((a, b) => b.cardCount - a.cardCount)
              .map((deck) => (
                <DeckCard key={deck.id} {...deck} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExplorePage;
