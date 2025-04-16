
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { User, getUser, updateUser, getBase64 } from "@/lib/localStorage";
import { Pencil, Save, Download, Upload } from "lucide-react";
import UserDecks from "@/components/UserDecks";
import UserDataExport from "@/components/UserDataExport";

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<User>>({});
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    try {
      const userData = getUser();
      if (userData) {
        setUser(userData);
        setEditedUser({
          name: userData.name,
          email: userData.email,
          bio: userData.bio || "",
        });
        setAvatarPreview(userData.avatar);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading user data:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données utilisateur",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }, [toast]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel edit
      if (user) {
        setEditedUser({
          name: user.name,
          email: user.email,
          bio: user.bio || "",
        });
        setAvatarPreview(user.avatar);
      }
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditedUser({
      ...editedUser,
      [e.target.name]: e.target.value,
    });
  };

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
      setAvatarPreview(base64);
      setEditedUser({
        ...editedUser,
        avatar: base64,
      });
    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        title: "Erreur",
        description: "Impossible de traiter l'image",
        variant: "destructive",
      });
    }
  };

  const handleSave = () => {
    if (!user) return;

    try {
      const updatedUser = updateUser({
        name: editedUser.name || user.name,
        email: editedUser.email || user.email,
        bio: editedUser.bio,
        avatar: editedUser.avatar,
      });

      if (updatedUser) {
        setUser(updatedUser);
        setIsEditing(false);
        toast({
          title: "Profil mis à jour",
          description: "Vos informations ont été enregistrées avec succès",
        });
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container px-4 py-8 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Utilisateur non trouvé</h1>
          <p className="text-muted-foreground mb-6">
            Impossible de charger les données utilisateur
          </p>
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="mb-6 bg-secondary/20 w-full md:w-auto">
          <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Mon Profil
          </TabsTrigger>
          <TabsTrigger value="decks" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Mes Decks
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Paramètres
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-0">
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-primary/30 to-purple-500/30 h-32 md:h-48" />
              <div className="relative px-4 sm:px-6">
                <div className="-mt-16 mb-6 sm:mb-8 sm:-mt-24 flex justify-between">
                  <div className="relative">
                    <Avatar className="h-32 w-32 sm:h-48 sm:w-48 border-4 border-background">
                      {avatarPreview ? (
                        <AvatarImage src={avatarPreview} alt={user.name} />
                      ) : (
                        <AvatarFallback className="text-3xl sm:text-5xl bg-primary/20 text-primary">
                          {user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    {isEditing && (
                      <label htmlFor="avatar-upload" className="absolute bottom-2 right-2 h-8 w-8 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90">
                        <Pencil className="h-4 w-4" />
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                      </label>
                    )}
                  </div>
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    onClick={handleEditToggle}
                    className="mt-auto"
                  >
                    {isEditing ? "Annuler" : "Modifier"}
                  </Button>
                </div>
              </div>

              <CardContent className="space-y-6 px-4 sm:px-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nom</Label>
                        <Input
                          id="name"
                          name="name"
                          value={editedUser.name || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={editedUser.email || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        value={editedUser.bio || ""}
                        onChange={handleInputChange}
                        placeholder="Parlez-nous de vous..."
                      />
                    </div>
                    <Button onClick={handleSave} className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary">
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h1 className="text-2xl font-bold">{user.name}</h1>
                      <p className="text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="pt-4 border-t">
                      <h2 className="font-medium mb-2">Bio</h2>
                      <p className="text-muted-foreground whitespace-pre-line">
                        {user.bio || "Aucune bio renseignée."}
                      </p>
                    </div>
                    <div className="pt-4 border-t">
                      <h2 className="font-medium mb-2">Membre depuis</h2>
                      <p className="text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="decks" className="mt-0">
          <UserDecks />
        </TabsContent>

        <TabsContent value="settings" className="mt-0">
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold mb-4">Paramètres</h2>
            
            <UserDataExport />
            
            <Card>
              <CardHeader>
                <CardTitle>Préférences d'affichage</CardTitle>
                <CardDescription>
                  Personnalisez l'apparence de l'application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Les options de personnalisation seront bientôt disponibles
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
