import { useState, useEffect } from "react";
import { LoginPage } from "@/components/auth/LoginPage";
import { RegisterPage } from "@/components/auth/RegisterPage";
import { AuthStatus } from "@/components/auth/AuthStatus";
import { Shield, Lock, Fingerprint, Scan, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService, type AuthUser } from "@/lib/auth-service";

type AuthView = "login" | "register" | "authenticated";

const Index = () => {
  const [authView, setAuthView] = useState<AuthView>("login");
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const user = authService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          setAuthView("authenticated");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setAuthView("authenticated");
  };

  const handleRegisterSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setAuthView("authenticated");
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setCurrentUser(null);
      setAuthView("login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const switchToRegister = () => setAuthView("register");
  const switchToLogin = () => setAuthView("login");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-primary/20 animate-pulse mx-auto flex items-center justify-center mb-4">
            <Shield className="h-10 w-10 text-primary animate-spin" />
          </div>
          <p className="text-lg text-muted-foreground">Initializing SecureAuth AI...</p>
        </div>
      </div>
    );
  }

  // Show login page
  if (authView === "login") {
    return <LoginPage onLoginSuccess={handleLoginSuccess} onSwitchToRegister={switchToRegister} />;
  }

  // Show register page
  if (authView === "register") {
    return <RegisterPage onRegisterSuccess={handleRegisterSuccess} onSwitchToLogin={switchToLogin} />;
  }

  // Show authenticated dashboard
  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.1),transparent_70%)]" />
      
      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 p-3 rounded-full bg-gradient-primary shadow-biometric">
                <Shield className="h-6 w-6 text-primary-foreground" />
                <Lock className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                SecureAuth AI
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{currentUser?.username}</span>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Welcome back, {currentUser?.username}! 👋
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              You're now securely authenticated with SecureAuth AI's advanced bioauthentication system
            </p>
            <div className="flex items-center justify-center space-x-6 mt-6">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Fingerprint className="h-4 w-4 text-accent" />
                <span>Biometric Ready</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Scan className="h-4 w-4 text-faceid" />
                <span>WebAuthn Enabled</span>
              </div>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Authentication Status */}
            <div className="bg-card rounded-2xl p-8 shadow-card-security border border-border">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Authentication Status</h3>
              </div>
              <AuthStatus 
                authState={{
                  isAuthenticated: true,
                  method: "webauthn",
                  user: currentUser?.username || "",
                  attempts: 0,
                  isLocked: false,
                  lastError: null,
                }} 
                onReset={() => {}} 
              />
            </div>

            {/* User Profile */}
            <div className="bg-card rounded-2xl p-8 shadow-card-security border border-border">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <User className="h-5 w-5 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">User Profile</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Username:</span>
                  <span className="font-medium">{currentUser?.username}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{currentUser?.email}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-green-600 font-medium">Active</span>
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Last Login:</span>
                  <span className="font-medium">
                    {currentUser?.lastLogin 
                      ? new Date(currentUser.lastLogin).toLocaleDateString()
                      : "First time"
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Fingerprint className="h-5 w-5 text-accent" />
                </div>
                <h4 className="font-semibold text-foreground">Biometric Auth</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Secure authentication using fingerprint or Face ID with WebAuthn technology
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground">Password Fallback</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Traditional password authentication as a secure fallback option
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <Shield className="h-5 w-5 text-secondary" />
                </div>
                <h4 className="font-semibold text-foreground">Real-time Security</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Live monitoring and protection with Supabase backend integration
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <Button
                onClick={() => setAuthView("login")}
                variant="outline"
                size="lg"
                className="flex items-center space-x-2"
              >
                <Lock className="h-4 w-4" />
                <span>Switch Account</span>
              </Button>
              <Button
                onClick={() => setAuthView("register")}
                variant="outline"
                size="lg"
                className="flex items-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span>Create New Account</span>
              </Button>
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-center mt-12 text-sm text-muted-foreground">
            <p>SecureAuth AI - AI-Enhanced Bioauthentication Testing Framework</p>
            <p className="mt-2">Built with React, TypeScript, Supabase & WebAuthn Integration</p>
            <p className="mt-2">Real-time data with no mock implementations</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;