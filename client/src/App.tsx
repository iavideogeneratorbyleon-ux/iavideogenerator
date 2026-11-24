import { useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext";
import { useTranslation } from "./hooks/useTranslations";
import LandingPage from "./pages/landing-page/LandingPage";
import Footer from "./components/footer/Footer";
import Navbar, { type ProductMenuItem } from "./components/navbar/Navbar";
import ProductDetailModal from "./components/product-detail-modal/ProductDetailModal";
import Dashboard from "./pages/dashboard/Dashboard";
import Workspace from "./pages/workspace/Workspace";
import AppSidebar from "./components/app-sidebar/AppSidebar";
import RouteErrorPage from "./pages/route-error/RouteErrorPage";
import UpgrateModal from "./components/upgrate-modal/UpgrateModal";
import AuthModal from "./components/auth/AuthModal";
import { getPlanWizardPolicy } from "./components/wizard/wizardPlanConfig";
import {
  loadWizardState,
  saveWizardState,
  type PlanTier,
  type StudioLiteDraft,
} from "./components/wizard/wizardStorage";
import { shouldShowAppSidebar, type AppRouteId } from "./navigation/appRoutes";

function normalizePlanTier(planId: string): PlanTier {
  if (planId === "pay_per_video" || planId === "pay-per-video") {
    return "pay_per_video";
  }
  if (planId === "pro") return "pro";
  if (planId === "unlimited") return "unlimited";
  return "free_trial";
}

function App() {
  const {
    user,
    isAuthenticated,
    planTier,
    selectedPlanForAuth,
    setSelectedPlanForAuth,
    logout,
  } = useAuth();
  const { language } = useTranslation();
  const isEn = language === "en";

  const [currentRoute, setCurrentRoute] = useState<AppRouteId>("landing");
  const [isCompactLayout, setIsCompactLayout] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.innerWidth <= 860 : false
  );
  const [initialPrompt, setInitialPrompt] = useState<string>("");
  const [upgradeModalOpen, setUpgradeModalOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">(
    "signup"
  );
  const [selectedProduct, setSelectedProduct] =
    useState<ProductMenuItem | null>(null);

  const initialPolicy = getPlanWizardPolicy(planTier);
  const [credits, setCredits] = useState<number>(
    typeof (user as { credits?: number } | null)?.credits === "number"
      ? (user as { credits?: number }).credits!
      : initialPolicy.initialCredits
  );

  const activeView: "landing" | "workspace" =
    currentRoute === "landing" ? "landing" : "workspace";
  const showSidebar = shouldShowAppSidebar(currentRoute);
  const currentPlanPolicy = getPlanWizardPolicy(normalizePlanTier(planTier));

  useEffect(() => {
    const handleResize = () => {
      setIsCompactLayout(window.innerWidth <= 860);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const userCredits = (user as { credits?: number } | null)?.credits;
    if (typeof userCredits === "number") {
      setCredits(userCredits);
    } else if (
      !isAuthenticated &&
      normalizePlanTier(planTier) === "free_trial"
    ) {
      setCredits(getPlanWizardPolicy("free_trial").initialCredits);
    }
  }, [isAuthenticated, planTier, user]);

  useEffect(() => {
    const handleCreditsEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ credits?: number }>;
      if (typeof customEvent.detail?.credits === "number") {
        setCredits(customEvent.detail.credits);
      }
    };
    window.addEventListener("cempa:credits-updated", handleCreditsEvent);
    return () =>
      window.removeEventListener("cempa:credits-updated", handleCreditsEvent);
  }, []);

  useEffect(() => {
    if (isAuthenticated && authModalOpen) {
      setAuthModalOpen(false);
      setCurrentRoute("studio-lite");
    }
  }, [isAuthenticated, authModalOpen]);

  const handleStartWizard = (promptText?: string) => {
    if (typeof promptText === "string") {
      setInitialPrompt(promptText);
      const current = loadWizardState(promptText);
      saveWizardState({
        ...current,
        draft: {
          ...current.draft,
          prompt: promptText,
        },
      });
    }
    setCurrentRoute("studio-lite");
  };

  const handleSelectPlanFromLanding = (planId: string) => {
    const normalized = normalizePlanTier(planId);
    setSelectedPlanForAuth(normalized);
    setUpgradeModalOpen(true);
  };

  const handleRequireAuthFromWizard = (draft: StudioLiteDraft) => {
    const current = loadWizardState();
    saveWizardState({
      ...current,
      draft,
      pendingGenerateAfterAuth: true,
    });
    setUpgradeModalOpen(true);
  };

  const handleSelectPlanAndContinueToAuth = (plan: PlanTier) => {
    setSelectedPlanForAuth(plan);
    setUpgradeModalOpen(false);
    setAuthModalMode("signup");
    setAuthModalOpen(true);
  };

  const handleLoginSuccess = () => {
    setAuthModalOpen(false);
    setCurrentRoute("studio-lite");
  };

  const handleNavbarSection = (section: "products" | "plans" | "pricing") => {
    if (section === "plans" || section === "pricing") {
      setUpgradeModalOpen(true);
      return;
    }

    if (activeView !== "landing") {
      setCurrentRoute("landing");
      window.setTimeout(() => {
        const el =
          document.getElementById("products") ||
          document.getElementById("features");
        el?.scrollIntoView({ behavior: "smooth" });
      }, 60);
      return;
    }

    const el =
      document.getElementById("products") ||
      document.getElementById("features");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  const handleGoToProductSection = (product: ProductMenuItem) => {
    setSelectedProduct(null);

    if (product.id === "studio-lite") {
      setCurrentRoute("studio-lite");
      return;
    }

    if (product.id === "text-to-speech") {
      setCurrentRoute("text-to-speech");
      return;
    }

    setCurrentRoute("products");
  };

  const handleFooterNavigate = (target: string) => {
    if (target === "studio-lite" || target === "wizard") {
      setCurrentRoute("studio-lite");
      return;
    }
    if (target === "dashboard") {
      setCurrentRoute("dashboard");
      return;
    }
    if (target === "text-to-speech") {
      setCurrentRoute("text-to-speech");
      return;
    }
    if (target === "plans" || target === "pricing") {
      setUpgradeModalOpen(true);
      return;
    }

    const element = document.getElementById(target);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogoutAndGoLanding = () => {
    logout();
    setCurrentRoute("landing");
  };

  return (
    <>
      <Navbar
        activeView={activeView}
        credits={credits}
        onSelectBrand={() => setCurrentRoute("landing")}
        onToggleView={() =>
          setCurrentRoute((prev) =>
            prev === "landing" ? "studio-lite" : "landing"
          )
        }
        onGoToDashboard={() => setCurrentRoute("dashboard")}
        onNavigateSection={handleNavbarSection}
        onSelectProduct={(product) => setSelectedProduct(product)}
        onOpenLogin={() => {
          setAuthModalMode("login");
          setAuthModalOpen(true);
        }}
        onOpenSignup={() => {
          setAuthModalMode("signup");
          setAuthModalOpen(true);
        }}
        onOpenPlansModal={() => setUpgradeModalOpen(true)}
        onSignOut={handleLogoutAndGoLanding}
      />

      {currentRoute === "landing" ? (
        <LandingPage
          onStartWizard={handleStartWizard}
          onSelectPlan={handleSelectPlanFromLanding}
        />
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: isCompactLayout ? "column" : "row",
            minHeight: "calc(100vh - 64px)",
            width: "100%",
          }}
        >
          {showSidebar && (
            <AppSidebar
              currentRoute={currentRoute}
              isEn={isEn}
              isAuthenticated={isAuthenticated}
              userEmail={user?.email}
              planLabel={
                currentPlanPolicy.label[language === "es" ? "es" : "en"]
              }
              credits={credits}
              logoutLabel={isEn ? "Log out" : "Cerrar sesión"}
              onNavigate={(route) => setCurrentRoute(route)}
              onOpenUpgrade={() => setUpgradeModalOpen(true)}
              onBackToLanding={() => setCurrentRoute("landing")}
              onLogout={handleLogoutAndGoLanding}
            />
          )}

          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {currentRoute === "dashboard" ? (
              <Dashboard
                key={currentRoute}
                onOpenStudioLite={() => setCurrentRoute("studio-lite")}
                onCreditsChange={setCredits}
              />
            ) : (
              <Workspace
                key={currentRoute}
                activeRoute={currentRoute}
                initialPrompt={initialPrompt}
                onGoToStudioLite={() => setCurrentRoute("studio-lite")}
                onGoToDashboard={() => setCurrentRoute("dashboard")}
                onGoToLanding={() => setCurrentRoute("landing")}
                onRequireAuthFromWizard={handleRequireAuthFromWizard}
                onCreditsChange={setCredits}
              />
            )}
          </div>
        </div>
      )}

      <Footer onNavigate={handleFooterNavigate} />

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onGoToSection={handleGoToProductSection}
      />

      <UpgrateModal
        isOpen={upgradeModalOpen}
        initialPlan={selectedPlanForAuth || planTier}
        onClose={() => setUpgradeModalOpen(false)}
        onSelectPlanAndAuth={handleSelectPlanAndContinueToAuth}
      />

      <AuthModal
        isOpen={authModalOpen}
        mode={authModalMode}
        selectedPlan={selectedPlanForAuth}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}

export default App;
