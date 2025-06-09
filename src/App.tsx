
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { generateSampleData } from "./lib/localStorage";
import { hasSession } from "./lib/sessionManager";

// Components
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Pages
import HomePage from "@/pages/HomePage";
import ExplorePage from "@/pages/ExplorePage";
import CreatePage from "@/pages/CreatePage";
import ProfilePage from "@/pages/ProfilePage";
import DeckPage from "@/pages/DeckPage";
import EditDeckPage from "@/pages/EditDeckPage";
import ThemePage from "@/pages/ThemePage";
import StudyPage from "@/pages/StudyPage";
import NotFound from "@/pages/NotFound";
import ImportPage from "@/pages/ImportPage";
import LoginPage from "@/pages/LoginPage";
import Index from "@/pages/Index";
import LearningMethodsPage from "@/pages/LearningMethodsPage";
import StatsPage from "@/pages/StatsPage";
import SharePage from "@/pages/SharePage";
import MyDecksPage from "@/pages/MyDecksPage";

const queryClient = new QueryClient();

// Protected route wrapper component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await hasSession();
      setIsAuthenticated(authenticated);
    };
    
    checkAuth();
  }, []);

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  useEffect(() => {
    // Initialize storage structure on first load
    generateSampleData();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
            <Routes>
              {/* Public routes without Navbar/Footer */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<Index />} />
              
              {/* Protected routes with Navbar and Footer */}
              <Route path="/home" element={
                <ProtectedRoute>
                  <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-1 w-full">
                      <HomePage />
                    </main>
                    <Footer />
                  </div>
                </ProtectedRoute>
              } />
              
              <Route path="/explore" element={
                <ProtectedRoute>
                  <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-1 w-full">
                      <ExplorePage />
                    </main>
                    <Footer />
                  </div>
                </ProtectedRoute>
              } />
              
              <Route path="/create" element={
                <ProtectedRoute>
                  <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-1 w-full">
                      <CreatePage />
                    </main>
                    <Footer />
                  </div>
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-1 w-full">
                      <ProfilePage />
                    </main>
                    <Footer />
                  </div>
                </ProtectedRoute>
              } />
              
              <Route path="/my-decks" element={
                <ProtectedRoute>
                  <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-1 w-full">
                      <MyDecksPage />
                    </main>
                    <Footer />
                  </div>
                </ProtectedRoute>
              } />
              
              <Route path="/deck/:id" element={
                <ProtectedRoute>
                  <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-1 w-full">
                      <DeckPage />
                    </main>
                    <Footer />
                  </div>
                </ProtectedRoute>
              } />
              
              <Route path="/deck/:id/edit" element={
                <ProtectedRoute>
                  <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-1 w-full">
                      <EditDeckPage />
                    </main>
                    <Footer />
                  </div>
                </ProtectedRoute>
              } />
              
              <Route path="/deck/:deckId/theme/:themeId" element={
                <ProtectedRoute>
                  <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-1 w-full">
                      <ThemePage />
                    </main>
                    <Footer />
                  </div>
                </ProtectedRoute>
              } />
              
              <Route path="/deck/:id/study" element={
                <ProtectedRoute>
                  <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-1 w-full">
                      <StudyPage />
                    </main>
                    <Footer />
                  </div>
                </ProtectedRoute>
              } />
              
              <Route path="/import/:code" element={
                <ProtectedRoute>
                  <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-1 w-full">
                      <ImportPage />
                    </main>
                    <Footer />
                  </div>
                </ProtectedRoute>
              } />
              
              <Route path="/import" element={
                <ProtectedRoute>
                  <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-1 w-full">
                      <ImportPage />
                    </main>
                    <Footer />
                  </div>
                </ProtectedRoute>
              } />
              
              {/* New routes */}
              <Route path="/learning-methods" element={
                <ProtectedRoute>
                  <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-1 w-full">
                      <LearningMethodsPage />
                    </main>
                    <Footer />
                  </div>
                </ProtectedRoute>
              } />
              
              <Route path="/stats" element={
                <ProtectedRoute>
                  <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-1 w-full">
                      <StatsPage />
                    </main>
                    <Footer />
                  </div>
                </ProtectedRoute>
              } />
              
              <Route path="/share" element={
                <ProtectedRoute>
                  <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-1 w-full">
                      <SharePage />
                    </main>
                    <Footer />
                  </div>
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
