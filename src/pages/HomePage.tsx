
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRightIcon, Globe, Plus, TrendingUp, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import DeckCard, { DeckCardProps } from "@/components/DeckCard";
import { getDecks, getUser, User } from "@/lib/localStorage";

const HomePage = () => {
  const [recentDecks, setRecentDecks] = useState<DeckCardProps[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = getUser();
    setUser(userData);

    // Get all decks and sort by recent
    const allDecks = getDecks();
    const deckCards = allDecks
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 6)
      .map(deck => ({
        id: deck.id,
        title: deck.title,
        description: deck.description,
        coverImage: deck.coverImage,
        cardCount: 0, // Will be filled in next step
        tags: deck.tags,
        author: userData?.name || "Anonyme",
        isPublic: deck.isPublic,
        authorId: deck.authorId, // Add the authorId property
        themeCount: 0, // Include default themeCount
      }));

    setRecentDecks(deckCards);
  }, []);

  return (
    <div>
      {/* Hero Section with Enhanced Mobile Design */}
      <section className="relative bg-gradient-to-r from-primary/20 via-background to-accent/20 py-12 sm:py-16 lg:py-20">
        <div className="container px-3 sm:px-4 mx-auto flex flex-col items-center text-center">
          <span className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4">🎭</span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight px-2 sm:px-0">
            CDS FLASHCARD-BASE
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-sm sm:max-w-2xl mb-6 sm:mb-8 leading-relaxed px-4 sm:px-0">
            Créez, partagez et apprenez avec des flashcards interactives. 
            L'outil parfait pour mémoriser efficacement tous types de connaissances.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full sm:w-auto max-w-xs sm:max-w-none">
            <Button asChild size="lg" className="animate-float w-full sm:w-auto">
              <Link to="/create" className="flex items-center justify-center">
                <Plus className="mr-2 h-4 w-4" />
                <span className="text-sm sm:text-base">Créer un deck</span>
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="w-full sm:w-auto">
              <Link to="/explore" className="flex items-center justify-center">
                <Globe className="mr-2 h-4 w-4" />
                <span className="text-sm sm:text-base">Explorer</span>
              </Link>
            </Button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-8 sm:h-16 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* Features Section with Improved Mobile Grid */}
      <section className="py-12 sm:py-16">
        <div className="container px-3 sm:px-4 mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 px-2 sm:px-0">Fonctionnalités exceptionnelles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="bg-gradient-to-br from-background to-secondary/50 border-primary/20 h-full">
              <CardHeader className="pb-4">
                <div className="mb-2 p-2 sm:p-3 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Flashcards Multimédia</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Ajoutez du texte, des images et même de l'audio à vos flashcards.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs sm:text-sm text-muted-foreground">
                <p className="leading-relaxed">Nos flashcards supportent une variété de médias pour enrichir votre apprentissage. Intégrez des images représentatives ou des extraits audio pour faciliter la mémorisation.</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-background to-secondary/50 border-primary/20 h-full">
              <CardHeader className="pb-4">
                <div className="mb-2 p-2 sm:p-3 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Organisation par Thèmes</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Organisez vos flashcards par thèmes au sein d'un même deck.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs sm:text-sm text-muted-foreground">
                <p className="leading-relaxed">Catégorisez vos flashcards en thèmes pour une meilleure organisation. Personnalisez chaque thème avec sa propre image de couverture.</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-background to-secondary/50 border-primary/20 h-full md:col-span-2 lg:col-span-1">
              <CardHeader className="pb-4">
                <div className="mb-2 p-2 sm:p-3 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Partage Facile</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Partagez vos decks avec d'autres utilisateurs.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs sm:text-sm text-muted-foreground">
                <p className="leading-relaxed">Générez un code unique pour partager vos decks. Les destinataires peuvent les importer et commencer à étudier instantanément, sans création de compte.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Decks Section with Enhanced Mobile Layout */}
      {recentDecks.length > 0 && (
        <section className="py-12 sm:py-16 bg-secondary/30">
          <div className="container px-3 sm:px-4 mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3 sm:gap-0">
              <h2 className="text-xl sm:text-2xl font-bold">Decks récents</h2>
              <Button variant="ghost" size="sm" asChild className="self-start sm:self-center">
                <Link to="/explore" className="flex items-center text-sm sm:text-base">
                  Voir tous les decks
                  <ChevronRightIcon className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {recentDecks.map((deck) => (
                <DeckCard
                  key={deck.id}
                  id={deck.id}
                  title={deck.title}
                  description={deck.description}
                  cardCount={deck.cardCount}
                  coverImage={deck.coverImage}
                  tags={deck.tags}
                  author={deck.author}
                  isPublic={deck.isPublic}
                  authorId={deck.authorId}
                  themeCount={deck.themeCount}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action with Mobile Optimization */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-accent/20 via-background to-primary/20">
        <div className="container px-3 sm:px-4 mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 px-2 sm:px-0">Prêt à créer vos propres flashcards?</h2>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-sm sm:max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed px-4 sm:px-0">
            Commencez dès maintenant à créer vos propres decks de flashcards. C'est gratuit et ne nécessite pas de compte !
          </p>
          <Button asChild size="lg" className="animate-pulse-slow w-full sm:w-auto max-w-xs sm:max-w-none">
            <Link to="/create" className="flex items-center justify-center">
              <span className="text-sm sm:text-base">Commencer</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
