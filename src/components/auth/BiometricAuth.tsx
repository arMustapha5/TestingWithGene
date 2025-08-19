import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Fingerprint, Scan, Loader2, CheckCircle, X, UserPlus, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

interface AuthState {
  isAuthenticated: boolean;
  method: "password" | "fingerprint" | "face" | "webauthn" | null;
  user: string | null;
  attempts: number;
  isLocked: boolean;
  lastError: string | null;
}

interface BiometricAuthProps {
  authState: AuthState;
  setAuthState: (state: AuthState) => void;
}

export const BiometricAuth = ({ authState, setAuthState }: BiometricAuthProps) => {
  const [username, setUsername] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [biometricState, setBiometricState] = useState<"idle" | "scanning" | "success" | "error">("idle");
  const [isRegistered, setIsRegistered] = useState(false);
  const { toast } = useToast();

  // Check if WebAuthn is supported
  const isWebAuthnSupported = () => {
    return window.PublicKeyCredential !== undefined;
  };

  // Handle WebAuthn registration
  const handleWebAuthnRegistration = async () => {
    if (!username.trim()) {
      toast({
        title: "Username Required",
        description: "Please enter a username for registration",
        variant: "destructive",
      });
      return;
    }

    setIsRegistering(true);
    setBiometricState("scanning");

    try {
      // Get registration options from server
      const optionsResponse = await fetch('http://localhost:3001/api/webauthn/register/options', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.trim() }),
      });

      if (!optionsResponse.ok) {
        throw new Error('Failed to get registration options');
      }

      const options = await optionsResponse.json();

      // Start WebAuthn registration
      const credential = await startRegistration(options);

      // Verify registration with server
      const verificationResponse = await fetch('http://localhost:3001/api/webauthn/register/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          response: credential,
        }),
      });

      if (!verificationResponse.ok) {
        throw new Error('Registration verification failed');
      }

      const verification = await verificationResponse.json();

      if (verification.success) {
        setBiometricState("success");
        setIsRegistered(true);
        toast({
          title: "Registration Successful",
          description: "Your biometric credentials have been registered",
        });
        
        setTimeout(() => setBiometricState("idle"), 2000);
      } else {
        throw new Error(verification.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setBiometricState("error");
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : 'Registration failed',
        variant: "destructive",
      });
      
      setTimeout(() => setBiometricState("idle"), 2000);
    } finally {
      setIsRegistering(false);
    }
  };

  // Handle WebAuthn authentication
  const handleWebAuthnAuthentication = async () => {
    if (!username.trim()) {
      toast({
        title: "Username Required",
        description: "Please enter a username for authentication",
        variant: "destructive",
      });
      return;
    }

    setIsAuthenticating(true);
    setBiometricState("scanning");

    try {
      // Get authentication options from server
      const optionsResponse = await fetch('http://localhost:3001/api/webauthn/authenticate/options', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.trim() }),
      });

      if (!optionsResponse.ok) {
        throw new Error('Failed to get authentication options');
      }

      const options = await optionsResponse.json();

      // Start WebAuthn authentication
      const credential = await startAuthentication(options);

      // Verify authentication with server
      const verificationResponse = await fetch('http://localhost:3001/api/webauthn/authenticate/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          response: credential,
        }),
      });

      if (!verificationResponse.ok) {
        throw new Error('Authentication verification failed');
      }

      const verification = await verificationResponse.json();

      if (verification.success) {
        setBiometricState("success");
        setAuthState({
          ...authState,
          isAuthenticated: true,
          method: "webauthn",
          user: username.trim(),
          attempts: 0,
          lastError: null,
        });
        
        toast({
          title: "Authentication Successful",
          description: "Biometric authentication completed successfully",
        });
        
        setTimeout(() => setBiometricState("idle"), 2000);
      } else {
        throw new Error(verification.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setBiometricState("error");
      const newAttempts = authState.attempts + 1;
      const isLocked = newAttempts >= 3;
      
      setAuthState({
        ...authState,
        attempts: newAttempts,
        isLocked,
        lastError: error instanceof Error ? error.message : 'Authentication failed',
      });

      toast({
        title: "Authentication Failed",
        description: error instanceof Error ? error.message : 'Authentication failed',
        variant: "destructive",
      });
      
      setTimeout(() => setBiometricState("idle"), 2000);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Fallback to simulated biometric for testing
  const handleSimulatedBiometric = async (type: "fingerprint" | "face") => {
    if (authState.isLocked) {
      toast({
        title: "Account Locked",
        description: "Too many failed attempts. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    setBiometricState("scanning");

    try {
      // Simulate biometric scanning
      await new Promise(resolve => setTimeout(resolve, type === "fingerprint" ? 2000 : 3000));

      // Make API call to backend
      const response = await fetch(`http://localhost:3001/api/auth/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: username || "demo-user",
          biometricData: `simulated-${type}-data` 
        }),
      });

      const data = await response.json();

      if (data.success) {
        setBiometricState("success");
        setAuthState({
          ...authState,
          isAuthenticated: true,
          method: type,
          user: username || "Demo User",
          attempts: 0,
          lastError: null,
        });
        
        toast({
          title: "Biometric Authentication Successful",
          description: `Authenticated using ${type === "fingerprint" ? "fingerprint" : "Face ID"}`,
        });
        
        setTimeout(() => setBiometricState("idle"), 2000);
      } else {
        setBiometricState("error");
        const newAttempts = authState.attempts + 1;
        const isLocked = newAttempts >= 3;
        
        setAuthState({
          ...authState,
          attempts: newAttempts,
          isLocked,
          lastError: data.message,
        });

        toast({
          title: "Biometric Authentication Failed",
          description: data.message,
          variant: "destructive",
        });
        
        setTimeout(() => setBiometricState("idle"), 2000);
      }
    } catch (error) {
      setBiometricState("error");
      setAuthState({
        ...authState,
        lastError: "Network error occurred",
      });
      
      toast({
        title: "Network Error",
        description: "Unable to connect to biometric authentication server",
        variant: "destructive",
      });
      
      setTimeout(() => setBiometricState("idle"), 2000);
    }
  };

  const BiometricStatus = () => {
    if (biometricState === "scanning") {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-full bg-primary/20 animate-pulse mx-auto flex items-center justify-center">
                <Scan className="h-10 w-10 text-primary animate-spin" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping" />
            </div>
            <p className="text-sm text-muted-foreground">Scanning biometric data...</p>
          </div>
        </div>
      );
    }

    if (biometricState === "success") {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-secondary/20 mx-auto flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-secondary" />
            </div>
            <p className="text-sm text-secondary-foreground">Authentication successful!</p>
          </div>
        </div>
      );
    }

    if (biometricState === "error") {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-destructive/20 mx-auto flex items-center justify-center mb-4">
              <X className="h-10 w-10 text-destructive" />
            </div>
            <p className="text-sm text-destructive">Authentication failed</p>
          </div>
        </div>
      );
    }

    return null;
  };

  if (!isWebAuthnSupported()) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            WebAuthn is not supported in this browser. Please use a modern browser that supports WebAuthn.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {authState.isAuthenticated && authState.method !== "password" && (
        <Alert className="border-secondary bg-secondary/10">
          <CheckCircle className="h-4 w-4 text-secondary" />
          <AlertDescription className="text-secondary-foreground">
            Successfully authenticated with {authState.method === "webauthn" ? "WebAuthn" : authState.method}
          </AlertDescription>
        </Alert>
      )}

      {authState.isLocked && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Biometric authentication locked due to multiple failed attempts.
          </AlertDescription>
        </Alert>
      )}

      {/* Username Input */}
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isRegistering || isAuthenticating}
        />
      </div>

      {/* Biometric Status Display */}
      {biometricState !== "idle" && (
        <Card className="bg-card/50 border-border/50">
          <BiometricStatus />
        </Card>
      )}

      {/* WebAuthn Authentication */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">WebAuthn (Recommended)</span>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          <Button
            onClick={handleWebAuthnRegistration}
            disabled={authState.isLocked || isRegistering || isAuthenticating}
            variant="outline"
            size="lg"
            className="h-14"
            data-testid="webauthn-register-button"
          >
            {isRegistering ? (
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

          <Button
            onClick={handleWebAuthnAuthentication}
            disabled={authState.isLocked || isRegistering || isAuthenticating || !isRegistered}
            variant="default"
            size="lg"
            className="h-14"
            data-testid="webauthn-auth-button"
          >
            {isAuthenticating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                <Shield className="h-5 w-5" />
                Authenticate with WebAuthn
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Fallback Simulated Biometric */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <AlertCircle className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Simulated Fallback (Testing)</span>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          <Button
            onClick={() => handleSimulatedBiometric("fingerprint")}
            disabled={authState.isLocked || isRegistering || isAuthenticating}
            variant="fingerprint"
            size="lg"
            className="h-14"
            data-testid="fingerprint-button"
          >
            <Fingerprint className="h-5 w-5" />
            Simulate Fingerprint
          </Button>

          <Button
            onClick={() => handleSimulatedBiometric("face")}
            disabled={authState.isLocked || isRegistering || isAuthenticating}
            variant="faceid"
            size="lg"
            className="h-14"
            data-testid="faceid-button"
          >
            <Scan className="h-5 w-5" />
            Simulate Face ID
          </Button>
        </div>
      </div>

      {authState.attempts > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Failed biometric attempts: {authState.attempts}/3
        </div>
      )}

      {/* WebAuthn Status */}
      <Card className="bg-muted/30 border-border/50 p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">WebAuthn Status</p>
            <p className="text-xs text-muted-foreground">
              {isRegistered 
                ? "Biometric credentials registered. Ready for authentication."
                : "No biometric credentials registered. Please register first."
              }
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};