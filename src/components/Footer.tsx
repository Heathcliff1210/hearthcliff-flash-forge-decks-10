
import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-background/50 py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Fait avec</span>
            <Heart className="h-4 w-4 text-red-500" fill="currentColor" />
            <span>par Izumi Hearthcliff</span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; 2025 CDS FLASHCARD-BASE. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
