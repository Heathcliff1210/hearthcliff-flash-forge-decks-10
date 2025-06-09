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
  generateSessionKey,
  saveSessionKey,
  exportSessionToFile,
  importSessionFromFile,
  createNewSession
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
    const initializeProfile = async () => {
      // Vérifier si l'utilisateur est connecté
      const sessionExists = await hasSession();
      if (!sessionExists) {
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
      const userStats = await getSessionStats();
      setStats(userStats);
    };

    initializeProfile();
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

  const generateNewSessionKey = async () => {
    const newKey = await createNewSession();
    setSessionKey(newKey);
    
    toast({
      title: "Nouvelle session créée",
      description: "Une nouvelle session a été créée avec succès",
    });
  };

  const handleExportData = async () => {
    try {
      const blob = await exportSessionToFile();
      if (blob) {
        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `flashcard_backup_${new Date().toISOString().slice(0, 10)}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "Export réussi",
          description: "Votre sauvegarde a été téléchargée",
        });
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'exporter les données",
        variant: "destructive",
      });
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImportData(file);
    }
  };

  const handleImportData = async (file: File) => {
    try {
      const success = await importSessionFromFile(file);
      if (success) {
        toast({
          title: "Import réussi",
          description: "Les données ont été importées avec succès. L'application va se recharger.",
        });
        
        // Recharger la page après quelques secondes pour actualiser les données
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast({
          title: "Erreur",
          description: "Fichier invalide ou incompatible",
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
                  Exporter ma base de données
                </Button>
                
                <div className="w-full">
                  <input
                    type="file"
                    accept=".zip"
                    onChange={handleFileImport}
                    style={{ display: 'none' }}
                    id="import-file"
                  />
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => document.getElementById('import-file')?.click()}
                  >
                    <FileUp className="h-4 w-4 mr-2" />
                    Importer une base de données
                  </Button>
                </div>
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
    </div>
  );
};

export default ProfilePage;
