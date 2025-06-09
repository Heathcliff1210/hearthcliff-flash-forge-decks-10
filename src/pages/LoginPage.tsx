
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LogIn, UserPlus, Key } from "lucide-react";
import { loadSession, createNewSession } from "@/lib/sessionManager";

const LoginPage = () => {
  const [sessionKey, setSessionKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreateAccount = async () => {
    setIsLoading(true);
    
    try {
      const newSessionKey = await createNewSession();
      
      toast({
        title: "Compte créé avec succès",
        description: `Votre clé de session est : ${newSessionKey}`,
      });
      
      navigate("/home");
    } catch (error) {
      console.error("Error creating account:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le compte",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!sessionKey.trim()) {
      toast({
        title: "Clé requise",
        description: "Veuillez saisir votre clé de session",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const success = await loadSession(sessionKey.trim());
      
      if (success) {
        toast({
          title: "Connexion réussie",
          description: "Bienvenue !",
        });
        navigate("/home");
      } else {
        toast({
          title: "Échec de la connexion",
          description: "Clé de session invalide",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la connexion",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 p-3 sm:p-4">
      <div className="w-full max-w-sm sm:max-w-md space-y-4 sm:space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            CDS FLASHCARD-BASE
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base px-2 sm:px-0">
            Connectez-vous à votre compte ou créez-en un nouveau
          </p>
        </div>

        <Card className="border-indigo-100 dark:border-indigo-900/30">
          <CardHeader className="space-y-1 pb-4 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl text-center">Connexion</CardTitle>
            <CardDescription className="text-center text-sm sm:text-base px-2 sm:px-0">
              Saisissez votre clé de session pour accéder à vos flashcards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sessionKey" className="text-sm sm:text-base">Clé de session</Label>
              <Input
                id="sessionKey"
                type="text"
                placeholder="ABCD1234EFGH56"
                value={sessionKey}
                onChange={(e) => setSessionKey(e.target.value.toUpperCase())}
                className="font-mono text-center tracking-wider text-sm sm:text-base"
                disabled={isLoading}
              />
            </div>

            <Button 
              onClick={handleLogin} 
              className="w-full bg-indigo-600 hover:bg-indigo-700" 
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  <span className="text-sm sm:text-base">Connexion...</span>
                </div>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  <span className="text-sm sm:text-base">Se connecter</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Ou
            </span>
          </div>
        </div>

        <Card className="border-indigo-100 dark:border-indigo-900/30">
          <CardHeader className="space-y-1 pb-4 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl text-center">Nouveau compte</CardTitle>
            <CardDescription className="text-center text-sm sm:text-base px-2 sm:px-0">
              Créez un nouveau compte avec une base de données SQLite privée
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleCreateAccount} 
              variant="outline" 
              className="w-full border-indigo-200 dark:border-indigo-800/30"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  <span className="text-sm sm:text-base">Création...</span>
                </div>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  <span className="text-sm sm:text-base">Créer un nouveau compte</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="text-center text-xs sm:text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-1">
            <Key className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Votre clé de session est votre identifiant unique et sécurisé</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
