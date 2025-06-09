
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  useEffect(() => {
    console.error(
      "404 Error: Page non trouvée"
    );
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500/30 to-purple-500/30 text-white flex flex-col items-center justify-center px-3 sm:px-4 py-12 sm:py-16 text-center">
      <div className="mb-6 flex h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg">
        <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-white" />
      </div>
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-2 sm:mb-3 text-white">404</h1>
      <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 max-w-xs sm:max-w-md leading-relaxed px-2 sm:px-0">
        Oups! Cette page n'existe pas ou a été déplacée.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto max-w-xs sm:max-w-none">
        <Button asChild className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/10 shadow-lg text-white w-full sm:w-auto">
          <Link to="/" className="flex items-center justify-center">
            <Home className="mr-2 h-4 w-4" />
            <span className="text-sm sm:text-base">Retour à l'accueil</span>
          </Link>
        </Button>
        <Button variant="outline" asChild className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm shadow-lg w-full sm:w-auto">
          <Link to="/explore" className="flex items-center justify-center">
            <Search className="mr-2 h-4 w-4" />
            <span className="text-sm sm:text-base">Explorer les decks</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
