
import { useState } from "react";
import { Download, Upload, Info, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getUser, setUser, getDecks, getThemes, getFlashcards } from "@/lib/localStorage";

const UserDataExport = () => {
  const { toast } = useToast();
  const [jsonData, setJsonData] = useState("");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState("");
  const [isValidJson, setIsValidJson] = useState(false);

  const handleExport = () => {
    try {
      const user = getUser();
      const decks = getDecks().filter(deck => deck.authorId === user?.id);
      
      // Récupérer les IDs des decks de l'utilisateur
      const deckIds = decks.map(deck => deck.id);
      
      // Filtrer les thèmes et flashcards associés aux decks de l'utilisateur
      const themes = getThemes().filter(theme => deckIds.includes(theme.deckId));
      const flashcards = getFlashcards().filter(card => deckIds.includes(card.deckId));
      
      // Créer l'objet de données à exporter
      const exportData = {
        user,
        decks,
        themes,
        flashcards,
        exportDate: new Date().toISOString(),
        appVersion: "1.0.0"
      };
      
      // Convertir en JSON avec formatage
      const jsonString = JSON.stringify(exportData, null, 2);
      setJsonData(jsonString);
      
      toast({
        title: "Données exportées",
        description: "Vos données ont été générées avec succès",
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'exporter vos données",
        variant: "destructive",
      });
    }
  };

  const downloadJson = () => {
    try {
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `flashcard-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading JSON:", error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le fichier",
        variant: "destructive",
      });
    }
  };

  const handleImportDataChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setImportData(value);
    
    try {
      if (value) {
        JSON.parse(value);
        setIsValidJson(true);
      } else {
        setIsValidJson(false);
      }
    } catch (error) {
      setIsValidJson(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== "application/json") {
      toast({
        title: "Format invalide",
        description: "Veuillez sélectionner un fichier JSON",
        variant: "destructive",
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportData(content);
      
      try {
        JSON.parse(content);
        setIsValidJson(true);
      } catch (error) {
        setIsValidJson(false);
        toast({
          title: "Format invalide",
          description: "Le fichier JSON n'est pas valide",
          variant: "destructive",
        });
      }
    };
    
    reader.readAsText(file);
  };

  const handleImport = () => {
    try {
      if (!isValidJson) {
        toast({
          title: "Données invalides",
          description: "Le JSON fourni n'est pas valide",
          variant: "destructive",
        });
        return;
      }
      
      const data = JSON.parse(importData);
      
      // Vérifier la structure des données
      if (!data.user || !data.decks || !data.themes || !data.flashcards) {
        toast({
          title: "Structure invalide",
          description: "La structure des données importées est incorrecte",
          variant: "destructive",
        });
        return;
      }
      
      // Importer l'utilisateur
      setUser(data.user);
      
      // Pour les decks, thèmes et flashcards, nous devrions les fusionner avec les données existantes
      // Cette implémentation simplifiée remplace juste l'utilisateur
      
      toast({
        title: "Données importées",
        description: "Vos données utilisateur ont été importées avec succès",
      });
      
      setShowImportDialog(false);
      
      // Recharger la page pour refléter les changements
      window.location.reload();
    } catch (error) {
      console.error("Error importing data:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'importer les données",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Exporter/Importer vos données</CardTitle>
        <CardDescription>
          Sauvegardez vos données utilisateur ou importez-les depuis un fichier JSON
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 bg-secondary/10">
              <h3 className="font-medium mb-2 flex items-center">
                <Download className="h-4 w-4 mr-2 text-primary" />
                Exporter mes données
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Téléchargez toutes vos données utilisateur dans un fichier JSON
              </p>
              <Button onClick={handleExport} className="w-full">
                Générer l'export
              </Button>
            </div>
            
            <div className="border rounded-lg p-4 bg-secondary/10">
              <h3 className="font-medium mb-2 flex items-center">
                <Upload className="h-4 w-4 mr-2 text-primary" />
                Importer mes données
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Restaurez vos données à partir d'un fichier JSON exporté précédemment
              </p>
              <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Importer des données
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Importer mes données</DialogTitle>
                    <DialogDescription>
                      Collez le contenu JSON ou importez un fichier
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <Alert variant="warning">
                      <Info className="h-4 w-4" />
                      <AlertTitle>Attention</AlertTitle>
                      <AlertDescription>
                        Cette action remplacera vos données utilisateur actuelles. Assurez-vous d'avoir une sauvegarde si nécessaire.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-2">
                      <label htmlFor="file-upload" className="block text-sm font-medium">
                        Importer depuis un fichier
                      </label>
                      <input
                        id="file-upload"
                        type="file"
                        accept="application/json"
                        onChange={handleFileUpload}
                        className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="json-import" className="block text-sm font-medium">
                        Ou collez le contenu JSON
                      </label>
                      <Textarea
                        id="json-import"
                        placeholder="Collez le JSON ici..."
                        rows={8}
                        value={importData}
                        onChange={handleImportDataChange}
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                      Annuler
                    </Button>
                    <Button 
                      onClick={handleImport} 
                      disabled={!isValidJson}
                      className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Importer
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {jsonData && (
            <div className="mt-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Données exportées</h3>
                <Button size="sm" onClick={downloadJson}>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
              </div>
              <div className="relative">
                <Textarea
                  value={jsonData}
                  readOnly
                  rows={8}
                  className="font-mono text-xs bg-secondary/5"
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserDataExport;
