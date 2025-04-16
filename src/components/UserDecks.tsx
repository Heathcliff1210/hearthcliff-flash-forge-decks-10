
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDecks, getUser, Deck } from "@/lib/localStorage";
import DeckCard from "@/components/DeckCard";

const UserDecks = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [filteredDecks, setFilteredDecks] = useState<Deck[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const user = getUser();

  useEffect(() => {
    if (!user) return;
    
    try {
      const allDecks = getDecks();
      // Filtrer les decks de l'utilisateur
      const userDecks = allDecks.filter(deck => deck.authorId === user.id);
      setDecks(userDecks);
      setFilteredDecks(userDecks);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading user decks:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos decks",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredDecks(decks);
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    const filtered = decks.filter(
      deck => 
        deck.title.toLowerCase().includes(query) || 
        deck.description.toLowerCase().includes(query) ||
        deck.tags.some(tag => tag.toLowerCase().includes(query))
    );
    
    setFilteredDecks(filtered);
  }, [searchQuery, decks]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Mes decks</h2>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              className="pl-9 w-full sm:w-[250px]"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          
          <Button asChild className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow">
            <Link to="/create">
              <Plus className="mr-2 h-4 w-4" />
              Créer un deck
            </Link>
          </Button>
        </div>
      </div>
      
      {filteredDecks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDecks.map(deck => (
            <DeckCard
              key={deck.id}
              id={deck.id}
              title={deck.title}
              description={deck.description}
              cardCount={0} // Cela sera calculé dans le composant
              themeCount={0} // Cela sera calculé dans le composant
              coverImage={deck.coverImage}
              isPublic={deck.isPublic}
              tags={deck.tags}
              authorId={deck.authorId}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border rounded-lg bg-secondary/10">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          
          {searchQuery ? (
            <>
              <h3 className="text-xl font-medium mb-2">Aucun résultat</h3>
              <p className="text-muted-foreground mb-6">
                Aucun deck ne correspond à votre recherche
              </p>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Réinitialiser la recherche
              </Button>
            </>
          ) : (
            <>
              <h3 className="text-xl font-medium mb-2">Aucun deck</h3>
              <p className="text-muted-foreground mb-6">
                Vous n'avez pas encore créé de deck
              </p>
              <Button asChild>
                <Link to="/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer mon premier deck
                </Link>
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UserDecks;
