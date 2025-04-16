
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, FileDown, FileUp, Save, UserCog, Shield, Database, Clock, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  getUser, 
  updateUser, 
  getDecks, 
  getBase64,
  Deck 
} from "@/lib/localStorage";
import { 
  getSessionKey, 
  getSessionStats, 
  hasSession, 
  saveSessionKey, 
  generateSessionKey,
  exportSessionData,
  importSessionData
} from "@/lib/sessionManager";

const ProfilePage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userBio, setUserBio] = useState("");
  const [userAvatar, setUserAvatar] = useState<string | undefined>(undefined);
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [exportedData, setExportedData] = useState<string>("");
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState("");

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    if (!hasSession()) {
      navigate("/login");
      return;
    }

    // Charger les données utilisateur
    const user = getUser();
    if (user) {
      setUserName(user.name || "");
      setUserEmail(user.email || "");
      setUserBio(user.bio || "");
      setUserAvatar(user.avatar);
    }

    // Charger la clé de session
    const key = getSessionKey();
    setSessionKey(key);

    // Charger les decks
    const userDecks = getDecks();
    setDecks(userDecks);

    // Charger les statistiques
    const userStats = getSessionStats();
    setStats(userStats);
  }, [navigate]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setUserAvatar(base64);
    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        title: "Erreur",
        description: "Impossible de traiter l'image",
        variant: "destructive",
      });
    }
  };

  const handleProfileUpdate = () => {
    if (!userName.trim()) {
      toast({
        title: "Nom requis",
        description: "Veuillez saisir un nom",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedUser = updateUser({
        name: userName.trim(),
        email: userEmail.trim(),
        bio: userBio.trim(),
        avatar: userAvatar,
      });

      if (updatedUser) {
        toast({
          title: "Profil mis à jour",
          description: "Vos informations ont été mises à jour avec succès",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive",
      });
    }
  };

  const generateNewSessionKey = () => {
    const newKey = generateSessionKey();
    saveSessionKey(newKey);
    setSessionKey(newKey);
    
    toast({
      title: "Nouvelle clé générée",
      description: "Une nouvelle clé de session a été créée avec succès",
    });
  };

  const handleExportData = () => {
    try {
      const data = exportSessionData();
      setExportedData(data);
      setShowExportDialog(true);
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'exporter les données",
        variant: "destructive",
      });
    }
  };

  const handleDownloadExport = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(exportedData);
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "flashcard_data_export.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } catch (error) {
      console.error("Error downloading data:", error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger les données",
        variant: "destructive",
      });
    }
  };

  const handleImportData = () => {
    try {
      if (!importData.trim()) {
        toast({
          title: "Données requises",
          description: "Veuillez entrer les données JSON à importer",
          variant: "destructive",
        });
        return;
      }

      const success = importSessionData(importData);
      if (success) {
        toast({
          title: "Importation réussie",
          description: "Les données ont été importées avec succès. L'application va se recharger.",
        });
        
        // Recharger la page après quelques secondes pour actualiser les données
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast({
          title: "Erreur",
          description: "Format de données invalide ou incompatible",
          variant: "destructive",
        });
      }
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
    <div className="container px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar - Informations utilisateur */}
          <div className="md:w-1/3">
            <Card className="bg-card/60 backdrop-blur-sm">
              <CardHeader className="flex flex-col items-center">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-2 border-primary mb-2">
                    {userAvatar ? (
                      <AvatarImage src={userAvatar} alt={userName} />
                    ) : (
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                        {userName.substring(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <label 
                    htmlFor="avatar-upload" 
                    className="absolute bottom-0 right-0 p-1 rounded-full bg-primary text-white cursor-pointer hover:bg-primary/80 transition-colors"
                  >
                    <UserCog className="h-4 w-4" />
                    <input 
                      id="avatar-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleAvatarChange} 
                    />
                  </label>
                </div>
                <CardTitle className="mt-2 text-xl">{userName}</CardTitle>
                <CardDescription className="text-center">{userEmail}</CardDescription>
                {userBio && (
                  <p className="text-sm text-muted-foreground mt-2 text-center">{userBio}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" />
                    <span>Decks créés</span>
                  </h3>
                  <p className="text-2xl font-bold">{decks.length}</p>
                </div>
                
                {stats && (
                  <>
                    <div>
                      <h3 className="text-sm font-medium flex items-center gap-2">
                        <BarChart className="h-4 w-4 text-green-500" />
                        <span>Score moyen</span>
                      </h3>
                      <p className="text-2xl font-bold">{stats.averageScore || 0}%</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span>Temps d'étude</span>
                      </h3>
                      <p className="text-2xl font-bold">{stats.totalStudyTime || 0} min</p>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={handleExportData}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Exporter mes données
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowImportDialog(true)}
                >
                  <FileUp className="h-4 w-4 mr-2" />
                  Importer des données
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Section principale */}
          <div className="md:w-2/3">
            <Tabs defaultValue="profile">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="profile">Profil</TabsTrigger>
                <TabsTrigger value="security">Sécurité</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="space-y-6">
                <Card className="bg-card/60 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Informations personnelles
                    </CardTitle>
                    <CardDescription>
                      Modifiez vos informations personnelles
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom d'utilisateur</Label>
                      <Input
                        id="name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Votre nom"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="votre.email@exemple.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Biographie</Label>
                      <Textarea
                        id="bio"
                        value={userBio}
                        onChange={(e) => setUserBio(e.target.value)}
                        placeholder="Parlez-nous de vous..."
                        rows={4}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="justify-end">
                    <Button onClick={handleProfileUpdate}>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="security" className="space-y-6">
                <Card className="bg-card/60 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Clé de session
                    </CardTitle>
                    <CardDescription>
                      Votre clé de session permet d'accéder à votre compte
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="session-key-box">
                      <div className="mb-4">
                        <span className="text-sm text-muted-foreground block mb-2">Votre clé de session actuelle</span>
                        <span className="session-key">{sessionKey}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Cette clé vous permet d'accéder à votre compte et à vos données. 
                        Conservez-la précieusement.
                      </p>
                      <Button variant="outline" onClick={generateNewSessionKey}>
                        Générer une nouvelle clé
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Dialog pour exporter les données */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Exporter mes données</DialogTitle>
            <DialogDescription>
              Voici vos données au format JSON. Vous pouvez les copier ou les télécharger pour les sauvegarder.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted p-3 rounded-md max-h-[300px] overflow-auto">
            <pre className="text-xs whitespace-pre-wrap break-all">
              {exportedData}
            </pre>
          </div>
          <DialogFooter className="flex sm:justify-between">
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Fermer
            </Button>
            <Button onClick={handleDownloadExport}>
              <FileDown className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog pour importer les données */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Importer des données</DialogTitle>
            <DialogDescription>
              Collez le contenu JSON d'une sauvegarde précédente pour restaurer vos données.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder='{"sessionKey":"ABCD1234", ...}'
              rows={10}
              className="font-mono text-xs"
            />
            <p className="text-sm text-destructive font-medium">
              Attention : Cette action remplacera toutes vos données actuelles !
            </p>
          </div>
          <DialogFooter className="flex sm:justify-between">
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleImportData}>
              <FileUp className="h-4 w-4 mr-2" />
              Importer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
