import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertCircle, 
  Fingerprint, 
  Scan, 
  Loader2, 
  CheckCircle, 
  X, 
  UserPlus, 
  Shield, 
  Lock,
  Eye,
  EyeOff,
  Mail,
  User,
  Camera
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService, type AuthUser, type LoginCredentials, type RegisterCredentials } from "@/lib/auth-service";
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { DatabaseSetupAlert } from "@/components/ui/DatabaseSetupAlert";
import { captureFaceSignature } from "@/lib/face-utils";

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
  onSwitchToRegister: () => void;
}

export const LoginPage = ({ onLoginSuccess, onSwitchToRegister }: LoginPageProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [authState, setAuthState] = useState<"idle" | "scanning" | "success" | "error">("idle");
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [hasBiometricCredentials, setHasBiometricCredentials] = useState(false);
  const [showDatabaseAlert, setShowDatabaseAlert] = useState(false);
  
  // Form states
  const [loginCredentials, setLoginCredentials] = useState<LoginCredentials>({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  
  // Biometric states
  const [biometricUsername, setBiometricUsername] = useState("");
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isFaceSupported, setIsFaceSupported] = useState(false);
  const [hasFaceCredentials, setHasFaceCredentials] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    // Check if WebAuthn is supported
    setIsBiometricSupported(window.PublicKeyCredential !== undefined);
    // Check camera support
    setIsFaceSupported(!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia));
    
    // Check if user is already authenticated
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      onLoginSuccess(user);
    }

    // Check database status
    const checkDatabase = async () => {
      const isReady = await authService.isDatabaseReady();
      setShowDatabaseAlert(!isReady);
    };
    
    checkDatabase();
  }, [onLoginSuccess]);

  // Check if user has biometric credentials by username
  const checkBiometricCredentials = async (username: string) => {
    try {
      const user = await authService.getUserByUsername(username);
      if (user) {
        const hasCredentials = await authService.hasBiometricCredentials(user.id);
        setHasBiometricCredentials(hasCredentials);
        return hasCredentials;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  // Check if user has face credentials by username
  const checkFaceCredentials = async (username: string) => {
    try {
      const user = await authService.getUserByUsername(username);
      if (user) {
        const hasFace = await authService.hasFaceCredentials(user.id);
        setHasFaceCredentials(hasFace);
        return hasFace;
      }
      setHasFaceCredentials(false);
      return false;
    } catch (error) {
      setHasFaceCredentials(false);
      return false;
    }
  };

  // Handle password-based login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginCredentials.email || !loginCredentials.password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.loginWithPassword(loginCredentials);
      
      if (result.success && result.user) {
        setCurrentUser(result.user);
        setAuthState("success");
        toast({
          title: "Login Successful",
          description: `Welcome back, ${result.user.username}!`,
        });
        
        setTimeout(() => {
          onLoginSuccess(result.user!);
        }, 1000);
      } else {
        setAuthState("error");
        toast({
          title: "Login Failed",
          description: result.error || "Invalid credentials",
          variant: "destructive",
        });
        
        setTimeout(() => setAuthState("idle"), 3000);
      }
    } catch (error) {
      setAuthState("error");
      toast({
        title: "Login Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      
      setTimeout(() => setAuthState("idle"), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle biometric authentication
  const handleBiometricAuth = async () => {
    if (!biometricUsername.trim()) {
      toast({
        title: "Username Required",
        description: "Please enter your username for biometric authentication",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAuthState("scanning");

    try {
      // Find user by username
      const user = await authService.getUserByUsername(biometricUsername.trim());

      if (!user) {
        throw new Error("User not found");
      }

      // Check if user has biometric credentials
      const hasCredentials = await authService.hasBiometricCredentials(user.id);
      if (!hasCredentials) {
        throw new Error("No biometric credentials found for this user");
      }

      // Get authentication options
      const authOptions = await authService.authenticateWebAuthn(user.id);
      if (!authOptions.success || !authOptions.options) {
        throw new Error(authOptions.error || "Failed to get authentication options");
      }

      // Start WebAuthn authentication
      const credential = await startAuthentication(authOptions.options);

      // Verify authentication
      const verification = await authService.verifyWebAuthnAuthentication(user.id, credential);
      
      if (verification.success && verification.user) {
        setCurrentUser(verification.user);
        setAuthState("success");
        toast({
          title: "Biometric Authentication Successful",
          description: `Welcome back, ${verification.user.username}!`,
        });
        
        setTimeout(() => {
          onLoginSuccess(verification.user!);
        }, 1000);
      } else {
        throw new Error(verification.error || "Authentication failed");
      }
    } catch (error) {
      setAuthState("error");
      toast({
        title: "Biometric Authentication Failed",
        description: error instanceof Error ? error.message : "Authentication failed",
        variant: "destructive",
      });
      
      setTimeout(() => setAuthState("idle"), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle biometric registration
  const handleBiometricRegistration = async () => {
    if (!biometricUsername.trim()) {
      toast({
        title: "Username Required",
        description: "Please enter your username for biometric registration",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAuthState("scanning");

    try {
      // Find user by username
      const user = await authService.getUserByUsername(biometricUsername.trim());

      if (!user) {
        throw new Error("User not found");
      }

      // Check if user already has biometric credentials
      const hasCredentials = await authService.hasBiometricCredentials(user.id);
      if (hasCredentials) {
        throw new Error("User already has biometric credentials registered");
      }

      // Get registration options
      const regOptions = await authService.registerWebAuthn(user.id);
      if (!regOptions.success || !regOptions.options) {
        throw new Error(regOptions.error || "Failed to get registration options");
      }

      // Start WebAuthn registration
      const credential = await startRegistration(regOptions.options);

      // Verify registration
      const verification = await authService.verifyWebAuthnRegistration(user.id, credential);
      
      if (verification.success) {
        setAuthState("success");
        setHasBiometricCredentials(true);
        toast({
          title: "Biometric Registration Successful",
          description: "Your biometric credentials have been registered successfully",
        });
        
        setTimeout(() => setAuthState("idle"), 2000);
      } else {
        throw new Error(verification.error || "Registration failed");
      }
    } catch (error) {
      setAuthState("error");
      toast({
        title: "Biometric Registration Failed",
        description: error instanceof Error ? error.message : "Registration failed",
        variant: "destructive",
      });
      
      setTimeout(() => setAuthState("idle"), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle face authentication
  const handleFaceAuth = async () => {
    if (!biometricUsername.trim()) {
      toast({
        title: "Username Required",
        description: "Please enter your username for face authentication",
        variant: "destructive",
      });
      return;
    }

    if (!isFaceSupported) {
      toast({ title: "Camera Not Available", description: "This device cannot capture face images", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setAuthState("scanning");

    try {
      const user = await authService.getUserByUsername(biometricUsername.trim());
      if (!user) throw new Error("User not found");

      const hasFace = await authService.hasFaceCredentials(user.id);
      if (!hasFace) throw new Error("No face credentials found for this user");

      const options = await authService.authenticateFaceOptions(user.id);
      if (!options.success || !options.options) throw new Error(options.error || "Failed to prepare face authentication");

      const signature = await captureFaceSignature();
      const verification = await authService.verifyFaceAuthentication(user.id, signature);

      if (verification.success && verification.user) {
        setCurrentUser(verification.user);
        setAuthState("success");
        toast({ title: "Face Authentication Successful", description: `Welcome back, ${verification.user.username}!` });
        setTimeout(() => {
          onLoginSuccess(verification.user!);
        }, 1000);
      } else {
        throw new Error(verification.error || "Authentication failed");
      }
    } catch (error) {
      setAuthState("error");
      toast({
        title: "Face Authentication Failed",
        description: error instanceof Error ? error.message : "Authentication failed",
        variant: "destructive",
      });
      setTimeout(() => setAuthState("idle"), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle face registration
  const handleFaceRegistration = async () => {
    if (!biometricUsername.trim()) {
      toast({
        title: "Username Required",
        description: "Please enter your username for face registration",
        variant: "destructive",
      });
      return;
    }

    if (!isFaceSupported) {
      toast({ title: "Camera Not Available", description: "This device cannot capture face images", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setAuthState("scanning");

    try {
      const user = await authService.getUserByUsername(biometricUsername.trim());
      if (!user) throw new Error("User not found");

      const hasFace = await authService.hasFaceCredentials(user.id);
      if (hasFace) throw new Error("User already has face credentials registered");

      const options = await authService.registerFaceOptions(user.id);
      if (!options.success || !options.options) throw new Error(options.error || "Failed to get face registration options");

      const signature = await captureFaceSignature();
      const verification = await authService.verifyFaceRegistration(user.id, signature, options.options.method, options.options.threshold);

      if (verification.success) {
        setAuthState("success");
        setHasFaceCredentials(true);
        toast({ title: "Face Registration Successful", description: "Your face credentials have been registered successfully" });
        setTimeout(() => setAuthState("idle"), 2000);
      } else {
        throw new Error(verification.error || "Registration failed");
      }
    } catch (error) {
      setAuthState("error");
      toast({
        title: "Face Registration Failed",
        description: error instanceof Error ? error.message : "Registration failed",
        variant: "destructive",
      });
      setTimeout(() => setAuthState("idle"), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Check biometric credentials when username changes
  useEffect(() => {
    if (biometricUsername.trim()) {
      checkBiometricCredentials(biometricUsername.trim());
      checkFaceCredentials(biometricUsername.trim());
    } else {
      setHasBiometricCredentials(false);
      setHasFaceCredentials(false);
    }
  }, [biometricUsername]);

  const BiometricStatus = () => {
    if (authState === "scanning") {
      return (
        <div className="flex items-center justify-center p-6">
          <div className="text-center">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 animate-pulse mx-auto flex items-center justify-center">
                <Scan className="h-8 w-8 text-primary animate-spin" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping" />
            </div>
            <p className="text-sm text-muted-foreground">Scanning biometric data...</p>
          </div>
        </div>
      );
    }

    if (authState === "success") {
      return (
        <div className="flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-secondary/20 mx-auto flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-secondary" />
            </div>
            <p className="text-sm text-secondary-foreground">Authentication successful!</p>
          </div>
        </div>
      );
    }

    if (authState === "error") {
      return (
        <div className="flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/20 mx-auto flex items-center justify-center mb-4">
              <X className="h-8 w-8 text-destructive" />
            </div>
            <p className="text-sm text-destructive">Authentication failed</p>
          </div>
        </div>
      );
    }

    return null;
  };

  if (!isBiometricSupported) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-destructive">WebAuthn Not Supported</CardTitle>
            <CardDescription>
              Your browser doesn't support WebAuthn. Please use a modern browser for biometric authentication.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => onSwitchToRegister()} 
              className="w-full"
              variant="outline"
            >
              Continue with Registration
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-2 p-3 rounded-full bg-gradient-primary shadow-biometric">
              <Shield className="h-6 w-6 text-primary-foreground" />
              <Lock className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            SecureAuth AI
          </CardTitle>
          <CardDescription className="text-lg">
            Advanced Bioauthentication System with Real-time Supabase Integration
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Database Setup Alert */}
          {showDatabaseAlert && (
            <div className="mb-6">
              <DatabaseSetupAlert onDismiss={() => setShowDatabaseAlert(false)} />
            </div>
          )}

          <Tabs defaultValue="biometric" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="biometric" className="flex items-center space-x-2">
                <Fingerprint className="h-4 w-4" />
                <span>Biometric</span>
              </TabsTrigger>
              <TabsTrigger value="password" className="flex items-center space-x-2">
                <Lock className="h-4 w-4" />
                <span>Password</span>
              </TabsTrigger>
              <TabsTrigger value="face" className="flex items-center space-x-2">
                <Camera className="h-4 w-4" />
                <span>Face</span>
              </TabsTrigger>
            </TabsList>

            {/* Biometric Authentication Tab */}
            <TabsContent value="biometric" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="biometric-username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="biometric-username"
                      type="text"
                      placeholder="Enter your username"
                      value={biometricUsername}
                      onChange={(e) => setBiometricUsername(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Biometric Status Display */}
                {authState !== "idle" && (
                  <Card className="bg-card/50 border-border/50">
                    <BiometricStatus />
                  </Card>
                )}

                {/* Biometric Actions */}
                <div className="grid grid-cols-1 gap-3">
                  {!hasBiometricCredentials ? (
                    <Button
                      onClick={handleBiometricRegistration}
                      disabled={isLoading || !biometricUsername.trim()}
                      variant="outline"
                      size="lg"
                      className="h-14"
                      data-testid="biometric-register-button"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Registering Biometric...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-5 w-5" />
                          Register Biometric Credentials
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleBiometricAuth}
                      disabled={isLoading || !biometricUsername.trim()}
                      variant="default"
                      size="lg"
                      className="h-14"
                      data-testid="biometric-auth-button"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Authenticating...
                        </>
                      ) : (
                        <>
                          <Shield className="h-5 w-5" />
                          Authenticate with Biometrics
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Biometric Status Info */}
                <Card className="bg-muted/30 border-border/50 p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Biometric Status</p>
                      <p className="text-xs text-muted-foreground">
                        {hasBiometricCredentials 
                          ? "Biometric credentials registered. Ready for authentication."
                          : "No biometric credentials registered. Please register first."
                        }
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Password Authentication Tab */}
            <TabsContent value="password" className="space-y-6">
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginCredentials.email}
                      onChange={(e) => setLoginCredentials(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={loginCredentials.password}
                      onChange={(e) => setLoginCredentials(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10 pr-10"
                      disabled={isLoading}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !loginCredentials.email || !loginCredentials.password}
                  className="w-full h-14"
                  data-testid="password-login-button"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5" />
                      Sign In with Password
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Face Authentication Tab */}
            <TabsContent value="face" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="face-username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="face-username"
                      type="text"
                      placeholder="Enter your username"
                      value={biometricUsername}
                      onChange={(e) => setBiometricUsername(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {authState !== "idle" && (
                  <Card className="bg-card/50 border-border/50">
                    <BiometricStatus />
                  </Card>
                )}

                <div className="grid grid-cols-1 gap-3">
                  {!hasFaceCredentials ? (
                    <Button
                      onClick={handleFaceRegistration}
                      disabled={isLoading || !biometricUsername.trim() || !isFaceSupported}
                      variant="outline"
                      size="lg"
                      className="h-14"
                      data-testid="face-register-button"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Registering Face...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-5 w-5" />
                          Register Face Credentials
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleFaceAuth}
                      disabled={isLoading || !biometricUsername.trim() || !isFaceSupported}
                      variant="default"
                      size="lg"
                      className="h-14"
                      data-testid="face-auth-button"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Authenticating with Face...
                        </>
                      ) : (
                        <>
                          <Camera className="h-5 w-5" />
                          Authenticate with Face
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <Card className="bg-muted/30 border-border/50 p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Face Authentication</p>
                      <p className="text-xs text-muted-foreground">
                        Your face signature is computed locally and stored as a compact hash for matching.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Switch to Registration */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-semibold"
                onClick={onSwitchToRegister}
              >
                Create one here
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
