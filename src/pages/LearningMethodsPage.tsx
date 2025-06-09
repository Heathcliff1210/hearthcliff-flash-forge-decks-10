
import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Brain, Lightbulb, Clock, BarChart4, RepeatIcon, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const LearningMethodsPage = () => {
  return (
    <div className="container max-w-6xl px-3 sm:px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
      <header className="text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight px-2 sm:px-0">
          Méthodes d'apprentissage efficaces
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-sm sm:max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
          Découvrez les techniques d'apprentissage les plus efficaces pour mémoriser vos flashcards et améliorer vos résultats.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <LearningMethodCard
          title="Répétition espacée"
          description="Technique qui consiste à réviser les informations à des intervalles de temps croissants pour une mémorisation optimale."
          icon={<Clock className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-500" />}
          badgeText="Très efficace"
          badgeVariant="success"
        >
          <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-xs sm:text-sm">
            <li>Revoir les flashcards à intervalles croissants (1, 3, 7, 14 jours...)</li>
            <li>Se concentrer davantage sur les cartes difficiles</li>
            <li>Utiliser un système de notation pour suivre la progression</li>
          </ul>
        </LearningMethodCard>

        <LearningMethodCard
          title="Récupération active"
          description="Au lieu de simplement relire, testez-vous activement en essayant de vous souvenir des informations."
          icon={<Brain className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />}
          badgeText="Recommandée"
          badgeVariant="info"
        >
          <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-xs sm:text-sm">
            <li>Toujours essayer de répondre avant de voir la solution</li>
            <li>S'expliquer les concepts à voix haute</li>
            <li>Reformuler les informations avec vos propres mots</li>
          </ul>
        </LearningMethodCard>

        <LearningMethodCard
          title="Chunking"
          description="Diviser les informations complexes en petits groupes logiques pour faciliter la mémorisation."
          icon={<BarChart4 className="h-6 w-6 sm:h-8 sm:w-8 text-pink-500" />}
          badgeText="Pour débutants"
          badgeVariant="purple"
        >
          <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-xs sm:text-sm">
            <li>Regrouper les flashcards par thèmes ou concepts</li>
            <li>Créer des associations entre différents éléments</li>
            <li>Limiter chaque session d'étude à 5-7 nouveaux éléments</li>
          </ul>
        </LearningMethodCard>

        <LearningMethodCard
          title="Interleaving"
          description="Alterner entre différents sujets ou types de problèmes au lieu de se concentrer sur un seul à la fois."
          icon={<RepeatIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />}
          badgeText="Avancée"
          badgeVariant="warning"
        >
          <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-xs sm:text-sm">
            <li>Mélanger différents thèmes dans une même session d'étude</li>
            <li>Passer d'un sujet à l'autre pour renforcer la rétention</li>
            <li>Idéal pour la préparation aux examens couvrant plusieurs sujets</li>
          </ul>
        </LearningMethodCard>

        <LearningMethodCard
          title="Élaboration"
          description="Enrichir les informations en créant des connexions avec ce que vous savez déjà."
          icon={<Lightbulb className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />}
          badgeText="Créative"
          badgeVariant="pink"
        >
          <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-xs sm:text-sm">
            <li>Ajouter des exemples personnels aux flashcards</li>
            <li>Créer des métaphores ou des analogies</li>
            <li>Relier les nouvelles informations à des connaissances existantes</li>
          </ul>
        </LearningMethodCard>

        <LearningMethodCard
          title="Dual Coding"
          description="Combiner le texte et les éléments visuels pour améliorer la mémorisation."
          icon={<BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />}
          badgeText="Visuelle"
          badgeVariant="gradient"
        >
          <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-xs sm:text-sm">
            <li>Ajouter des images pertinentes à vos flashcards</li>
            <li>Créer des schémas ou des diagrammes</li>
            <li>Visualiser mentalement les concepts lors de la révision</li>
          </ul>
        </LearningMethodCard>
      </div>

      <Separator className="my-6 sm:my-8" />

      <section className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl p-4 sm:p-6 md:p-8 shadow-sm">
        <div className="max-w-sm sm:max-w-3xl mx-auto space-y-3 sm:space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-center px-2 sm:px-0">Commencez à apprendre plus efficacement</h2>
          <p className="text-center text-muted-foreground text-sm sm:text-base leading-relaxed px-2 sm:px-0">
            Appliquez ces méthodes à vos sessions d'étude avec nos flashcards et transformez votre apprentissage.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-3 sm:pt-4">
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
              <Link to="/explore" className="text-sm sm:text-base">Découvrir les decks</Link>
            </Button>
            <Button asChild variant="outline" className="border-indigo-200 dark:border-indigo-800/30 w-full sm:w-auto">
              <Link to="/create" className="text-sm sm:text-base">Créer vos flashcards</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

interface LearningMethodCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  badgeText?: string;
  badgeVariant?: 
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning" 
    | "info"
    | "purple"
    | "pink"
    | "gradient";
  children?: React.ReactNode;
}

const LearningMethodCard = ({
  title,
  description,
  icon,
  badgeText,
  badgeVariant = "default",
  children,
}: LearningMethodCardProps) => {
  return (
    <Card className="overflow-hidden border-indigo-100 dark:border-indigo-900/30 shadow-sm transition-all duration-300 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/30 h-full">
      <CardHeader className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 pb-3 sm:pb-4">
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {icon}
            <CardTitle className="text-base sm:text-lg font-semibold leading-tight">{title}</CardTitle>
          </div>
          {badgeText && <Badge variant={badgeVariant as any} className="text-xs shrink-0">{badgeText}</Badge>}
        </div>
        <CardDescription className="text-xs sm:text-sm leading-relaxed">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-3 sm:pt-4 flex-1">
        {children}
      </CardContent>
      <CardFooter className="pt-2 pb-3 sm:pb-4 flex justify-between">
        <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:text-indigo-300 dark:hover:bg-indigo-950/30 px-2 h-8 text-xs sm:text-sm">
          En savoir plus
          <ChevronRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LearningMethodsPage;
