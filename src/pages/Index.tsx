import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Key, Copy, Plus, BookOpen, Check, Download, Upload, Info, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSessionKey, saveSessionKey, generateSessionKey, exportSessionData, importSessionData, verifySession } from '@/lib/sessionManager';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const Index = () => {
  const navigate = useNavigate();
  const [sessionKey, setSessionKey] = useState(getSessionKey() || '');
  const [isCopied, setIsCopied] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [exportData, setExportData] = useState('');
  const [importData, setImportData] = useState('');
  
  useEffect(() => {
    // Check if user has a valid session key
    const hasValidSession = verifySession();
    
    // Update the session key state
    setSessionKey(getSessionKey() || '');
  }, []);

  const handleCopyKey = () => {
    const currentSessionKey = getSessionKey();
    if (currentSessionKey) {
      navigator.clipboard.writeText(currentSessionKey);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      
      toast({
        title: "Clé copiée!",
        description: "Votre clé de session a été copiée dans le presse-papier.",
      });
    }
  };
  
  const handleGenerateKey = () => {
    const newKey = generateSessionKey();
    saveSessionKey(newKey);
    setSessionKey(newKey);
    
    toast({
      title: "Nouvelle clé générée!",
      description: "N'oubliez pas de la sauvegarder pour accéder à vos données ultérieurement.",
    });
  };
  
  const handleExportData = async () => {
    try {
      const data = await exportSessionData();
      setExportData(data);
      setShowExportDialog(true);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'exporter les données.",
        variant: "destructive",
      });
    }
  };
  
  const handleImportData = async () => {
    if (!importData.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer des données valides.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const success = await importSessionData(importData);
      
      if (success) {
        toast({
          title: "Données importées",
          description: "Vos données ont été importées avec succès.",
        });
        setSessionKey(getSessionKey() || '');
        setShowImportDialog(false);
        setImportData('');
      } else {
        toast({
          title: "Erreur",
          description: "Les données importées sont invalides.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error importing data:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'import des données.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500/10 to-purple-500/10 text-foreground">
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 lg:py-16 flex flex-col items-center justify-center text-center">
        {/* Hero Section with Horizontal Title */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6 flex-wrap">
          <span className="text-3xl sm:text-4xl lg:text-5xl">🎭</span>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight whitespace-nowrap">
            CDS FLASHCARD-BASE
          </h1>
          <span className="text-3xl sm:text-4xl lg:text-5xl">🎭</span>
        </div>
        
        <p className="text-base sm:text-lg lg:text-xl mb-8 sm:mb-12 max-w-xs sm:max-w-lg lg:max-w-2xl px-2 sm:px-0 leading-relaxed">
          Créez des flashcards sur les verses de votre choix et accédez aux notes de d'autres quizzeurs ⚡
        </p>
        
        <Button 
          size="lg" 
          asChild
          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white transition-all duration-300 mb-6 sm:mb-8 group shadow-lg hover:shadow-xl w-full sm:w-auto max-w-xs sm:max-w-none"
        >
          <Link to="/explore" className="flex items-center justify-center">
            <span className="text-sm sm:text-base">Commencer l'aventure</span>
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
        
        {/* Navigation Links with Better Mobile Layout */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 w-full sm:w-auto">
          <Link 
            to="/login" 
            className="text-foreground hover:text-primary flex items-center justify-center transition-colors text-sm sm:text-base px-4 py-2 rounded-lg hover:bg-white/10"
          >
            <Key className="mr-2 h-4 w-4" />
            <span>Avez-vous une clé de session?</span>
          </Link>
          <span className="hidden sm:inline text-muted-foreground self-center">ou</span>
          <button 
            onClick={handleGenerateKey}
            className="text-foreground hover:text-primary flex items-center justify-center transition-colors text-sm sm:text-base px-4 py-2 rounded-lg hover:bg-white/10"
          >
            <span>générer une nouvelle clé</span>
          </button>
        </div>
        
        {/* Session Key Card with Enhanced Mobile Design */}
        {sessionKey && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-indigo-200/30 dark:border-indigo-800/30 shadow-lg w-full max-w-sm sm:max-w-md mb-8 sm:mb-12">
            <Badge variant="gradient" className="mb-3 text-xs sm:text-sm">Session active</Badge>
            <h3 className="text-base sm:text-lg font-medium mb-2">Votre clé de session:</h3>
            <div className="bg-indigo-500/5 rounded-lg p-2 sm:p-3 mb-3 font-mono text-sm sm:text-lg tracking-wider border border-indigo-200/20 dark:border-indigo-800/20 break-all">
              {sessionKey}
            </div>
            <p className="text-xs sm:text-sm mb-4 text-muted-foreground leading-relaxed">
              Conservez cette clé pour accéder à vos données ultérieurement
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button 
                onClick={handleCopyKey} 
                variant="outline"
                className="border-indigo-200/40 dark:border-indigo-800/40 hover:bg-indigo-500/10 w-full sm:w-auto"
                size="sm"
              >
                {isCopied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                <span className="text-xs sm:text-sm">{isCopied ? "Copié!" : "Copier"}</span>
              </Button>
              <Button 
                onClick={handleExportData}
                variant="outline"
                className="border-indigo-200/40 dark:border-indigo-800/40 hover:bg-indigo-500/10 w-full sm:w-auto"
                size="sm"
              >
                <Download className="h-4 w-4 mr-1" />
                <span className="text-xs sm:text-sm">Exporter</span>
              </Button>
              <Button 
                onClick={() => setShowImportDialog(true)}
                variant="outline"
                className="border-indigo-200/40 dark:border-indigo-800/40 hover:bg-indigo-500/10 w-full sm:w-auto"
                size="sm"
              >
                <Upload className="h-4 w-4 mr-1" />
                <span className="text-xs sm:text-sm">Importer</span>
              </Button>
            </div>
          </div>
        )}
        
        {/* Feature Cards with Improved Mobile Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8 w-full max-w-5xl px-2 sm:px-0">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-indigo-200/30 dark:border-indigo-800/30 shadow-md hover:shadow-lg transition-shadow">
            <div className="p-2 sm:p-3 w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mx-auto">
              <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">Créez</h3>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Créez facilement vos propres flashcards avec texte, images et audio
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-indigo-200/30 dark:border-indigo-800/30 shadow-md hover:shadow-lg transition-shadow">
            <div className="p-2 sm:p-3 w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mx-auto">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">Apprenez</h3>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Étudiez efficacement avec des modes d'apprentissage adaptés à votre style
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-indigo-200/30 dark:border-indigo-800/30 shadow-md hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1">
            <div className="p-2 sm:p-3 w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mx-auto">
              <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">Partagez</h3>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Partagez vos decks avec d'autres utilisateurs grâce à un simple code
            </p>
          </div>
        </div>
        
        {/* Info Section with Better Mobile Typography */}
        <div className="mt-12 sm:mt-16 p-4 sm:p-6 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-xl border border-indigo-200/20 dark:border-indigo-800/20 w-full max-w-sm sm:max-w-2xl">
          <div className="flex items-center gap-2 mb-3 justify-center sm:justify-start">
            <Info className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500" />
            <h3 className="text-base sm:text-lg font-medium">À propos des clés de session</h3>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground text-left leading-relaxed">
            Les clés de session sont la façon la plus simple de sauvegarder vos progrès dans CDS Flashcard-Base. 
            Chaque clé est unique et vous permet d'accéder à vos decks et flashcards depuis n'importe quel appareil. 
            Conservez votre clé en lieu sûr ou exportez vos données pour une sauvegarde supplémentaire.
          </p>
        </div>
      </div>
      
      {/* Export Dialog with Mobile Optimizations */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-md w-[95vw] max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Exporter vos données</DialogTitle>
            <DialogDescription className="text-sm">
              Copiez ce code et conservez-le en lieu sûr pour restaurer vos données ultérieurement.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Textarea 
              value={exportData} 
              readOnly 
              className="h-32 sm:h-40 font-mono text-xs leading-relaxed"
            />
          </div>
          <DialogFooter className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowExportDialog(false)}
              className="w-full sm:w-auto"
            >
              Fermer
            </Button>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(exportData);
                toast({
                  title: "Données copiées",
                  description: "Les données ont été copiées dans le presse-papier.",
                });
              }}
              className="w-full sm:w-auto"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Import Dialog with Mobile Optimizations */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="sm:max-w-md w-[95vw] max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Importer vos données</DialogTitle>
            <DialogDescription className="text-sm">
              Collez le code d'exportation pour restaurer vos données.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Textarea 
              value={importData} 
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Collez votre code d'exportation ici..." 
              className="h-32 sm:h-40 font-mono text-xs leading-relaxed"
            />
          </div>
          <DialogFooter className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowImportDialog(false)}
              className="w-full sm:w-auto"
            >
              Annuler
            </Button>
            <Button
              onClick={handleImportData}
              className="w-full sm:w-auto"
            >
              <Upload className="h-4 w-4 mr-1" />
              Importer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
