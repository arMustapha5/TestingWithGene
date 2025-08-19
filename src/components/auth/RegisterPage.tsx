import { useState } from "react";
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
  CheckSquare,
  Square
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService, type AuthUser, type RegisterCredentials } from "@/lib/auth-service";
import { startRegistration } from '@simplewebauthn/browser';

interface RegisterPageProps {
  onRegisterSuccess: (user: AuthUser) => void;
  onSwitchToLogin: () => void;
}

export const RegisterPage = ({ onRegisterSuccess, onSwitchToLogin }: RegisterPageProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [authState, setAuthState] = useState<"idle" | "scanning" | "success" | "error">("idle");
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  
  // Form states
  const [registerCredentials, setRegisterCredentials] = useState<RegisterCredentials>({
    email: "",
    username: "",
    password: ""
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Biometric states
  const [biometricUsername, setBiometricUsername] = useState("");
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [registerBiometricAfterAccount, setRegisterBiometricAfterAccount] = useState(false);
  
  const { toast } = useToast();

  // Check if WebAuthn is supported
  useState(() => {
    setIsBiometricSupported(window.PublicKeyCredential !== undefined);
  });

  // Handle account registration
  const handleAccountRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!registerCredentials.email || !registerCredentials.username || !registerCredentials.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (registerCredentials.password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (registerCredentials.password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.register(registerCredentials);
      
      if (result.success && result.user) {
        setCurrentUser(result.user);
        setBiometricUsername(result.user.username);
        
        toast({
          title: "Account Created Successfully",
          description: `Welcome, ${result.user.username}!`,
        });

        // If user wants to register biometric credentials, do it automatically
        if (registerBiometricAfterAccount) {
          await handleBiometricRegistration(result.user.id);
        } else {
          // Show success and redirect
          setAuthState("success");
          setTimeout(() => {
            onRegisterSuccess(result.user!);
          }, 2000);
        }
      } else {
        setAuthState("error");
        toast({
          title: "Registration Failed",
          description: result.error || "Failed to create account",
          variant: "destructive",
        });
        
        setTimeout(() => setAuthState("idle"), 3000);
      }
    } catch (error) {
      setAuthState("error");
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      
      setTimeout(() => setAuthState("idle"), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle biometric registration
  const handleBiometricRegistration = async (userId: string) => {
    setIsLoading(true);
    setAuthState("scanning");

    try {
      // Get registration options
      const regOptions = await authService.registerWebAuthn(userId);
      if (!regOptions.success || !regOptions.options) {
        throw new Error(regOptions.error || "Failed to get registration options");
      }

      // Start WebAuthn registration
      const credential = await startRegistration(regOptions.options);

      // Verify registration
      const verification = await authService.verifyWebAuthnRegistration(userId, credential);
      
      if (verification.success) {
        setAuthState("success");
        toast({
          title: "Biometric Registration Successful",
          description: "Your biometric credentials have been registered successfully",
        });
        
        setTimeout(() => {
          onRegisterSuccess(currentUser!);
        }, 2000);
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
            <p className="text-sm text-secondary-foreground">Registration successful!</p>
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
            <p className="text-sm text-destructive">Registration failed</p>
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
              onClick={() => onSwitchToLogin()} 
              className="w-full"
              variant="outline"
            >
              Continue with Login
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
              <UserPlus className="h-6 w-6 text-primary-foreground" />
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Create Account
          </CardTitle>
          <CardDescription className="text-lg">
            Join SecureAuth AI with biometric authentication
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="account" className="flex items-center space-x-2">
                <UserPlus className="h-4 w-4" />
                <span>Account</span>
              </TabsTrigger>
              <TabsTrigger value="biometric" className="flex items-center space-x-2">
                <Fingerprint className="h-4 w-4" />
                <span>Biometric</span>
              </TabsTrigger>
            </TabsList>

            {/* Account Registration Tab */}
            <TabsContent value="account" className="space-y-6">
              <form onSubmit={handleAccountRegistration} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={registerCredentials.email}
                      onChange={(e) => setRegisterCredentials(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Choose a username"
                      value={registerCredentials.username}
                      onChange={(e) => setRegisterCredentials(prev => ({ ...prev, username: e.target.value }))}
                      className="pl-10"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password (min 8 characters)"
                      value={registerCredentials.password}
                      onChange={(e) => setRegisterCredentials(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10 pr-10"
                      disabled={isLoading}
                      required
                      minLength={8}
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

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10"
                      disabled={isLoading}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Biometric Registration Option */}
                <div className="flex items-center space-x-2 p-4 bg-muted/30 rounded-lg">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto"
                    onClick={() => setRegisterBiometricAfterAccount(!registerBiometricAfterAccount)}
                  >
                    {registerBiometricAfterAccount ? (
                      <CheckSquare className="h-5 w-5 text-primary" />
                    ) : (
                      <Square className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                  <Label className="text-sm cursor-pointer" onClick={() => setRegisterBiometricAfterAccount(!registerBiometricAfterAccount)}>
                    Register biometric credentials after account creation
                  </Label>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !registerCredentials.email || !registerCredentials.username || !registerCredentials.password || !confirmPassword}
                  className="w-full h-14"
                  data-testid="account-register-button"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Biometric Registration Tab */}
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

                {/* Biometric Registration Button */}
                <Button
                  onClick={() => handleBiometricRegistration(currentUser?.id || "")}
                  disabled={isLoading || !biometricUsername.trim() || !currentUser}
                  variant="default"
                  size="lg"
                  className="h-14 w-full"
                  data-testid="biometric-register-button"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Registering Biometric...
                    </>
                  ) : (
                    <>
                      <Fingerprint className="h-5 w-5" />
                      Register Biometric Credentials
                    </>
                  )}
                </Button>

                {/* Biometric Info */}
                <Card className="bg-muted/30 border-border/50 p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Biometric Registration</p>
                      <p className="text-xs text-muted-foreground">
                        {currentUser 
                          ? "Ready to register biometric credentials for your account."
                          : "Please create an account first to register biometric credentials."
                        }
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Switch to Login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-semibold"
                onClick={onSwitchToLogin}
              >
                Sign in here
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
