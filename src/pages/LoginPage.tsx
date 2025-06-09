
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LogIn, UserPlus, Key } from "lucide-react";
import { hasSession, loadSession, createNewSession } from "@/lib/sessionManager";

const LoginPage = () => {
  const [sessionKey, setSessionKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect if already logged in
    const checkSession = async () => {
      const loggedIn = await hasSession();
      if (loggedIn) {
        navigate("/home");
      }
    };
    
    checkSession();
  }, [navigate]);

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            CDS FLASHCARD-BASE
          </h1>
          <p className="text-muted-foreground">
            Connectez-vous à votre compte ou créez-en un nouveau
          </p>
        </div>

        <Card className="border-indigo-100 dark:border-indigo-900/30">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Connexion</CardTitle>
            <CardDescription className="text-center">
              Saisissez votre clé de session pour accéder à vos flashcards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sessionKey">Clé de session</Label>
              <Input
                id="sessionKey"
                type="text"
                placeholder="ABCD1234EFGH56"
                value={sessionKey}
                onChange={(e) => setSessionKey(e.target.value.toUpperCase())}
                className="font-mono text-center tracking-wider"
                disabled={isLoading}
              />
            </div>

            <Button 
              onClick={handleLogin} 
              className="w-full bg-indigo-600 hover:bg-indigo-700" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Connexion...
                </div>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Se connecter
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
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Nouveau compte</CardTitle>
            <CardDescription className="text-center">
              Créez un nouveau compte avec une base de données SQLite privée
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleCreateAccount} 
              variant="outline" 
              className="w-full border-indigo-200 dark:border-indigo-800/30"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Création...
                </div>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Créer un nouveau compte
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-1">
            <Key className="h-4 w-4" />
            Votre clé de session est votre identifiant unique et sécurisé
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
