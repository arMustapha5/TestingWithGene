import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface AuthState {
  isAuthenticated: boolean;
  method: "password" | "fingerprint" | "face" | null;
  user: string | null;
  attempts: number;
  isLocked: boolean;
  lastError: string | null;
}

interface LoginFormProps {
  authState: AuthState;
  setAuthState: (state: AuthState) => void;
}

export const LoginForm = ({ authState, setAuthState }: LoginFormProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Validation Error",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }

    if (authState.isLocked) {
      toast({
        title: "Account Locked",
        description: "Too many failed attempts. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call to backend
      const response = await fetch('/api/auth/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        setAuthState({
          ...authState,
          isAuthenticated: true,
          method: "password",
          user: username,
          attempts: 0,
          lastError: null,
        });
        
        toast({
          title: "Authentication Successful",
          description: `Welcome back, ${username}!`,
        });
      } else {
        const newAttempts = authState.attempts + 1;
        const isLocked = newAttempts >= 3;
        
        setAuthState({
          ...authState,
          attempts: newAttempts,
          isLocked,
          lastError: data.message,
        });

        toast({
          title: "Authentication Failed",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      setAuthState({
        ...authState,
        lastError: "Network error occurred",
      });
      
      toast({
        title: "Network Error",
        description: "Unable to connect to authentication server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {authState.isAuthenticated && authState.method === "password" && (
        <Alert className="border-secondary bg-secondary/10">
          <CheckCircle className="h-4 w-4 text-secondary" />
          <AlertDescription className="text-secondary-foreground">
            Successfully authenticated with password
          </AlertDescription>
        </Alert>
      )}

      {authState.isLocked && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Account locked due to multiple failed attempts. Try again in 5 minutes.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handlePasswordAuth} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-foreground">Username</Label>
          <Input
            id="username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={authState.isLocked || isLoading}
            className="bg-input border-border focus:border-primary"
            data-testid="username-input"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-foreground">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={authState.isLocked || isLoading}
            className="bg-input border-border focus:border-primary"
            data-testid="password-input"
          />
        </div>

        <Button
          type="submit"
          disabled={authState.isLocked || isLoading}
          className="w-full"
          variant="default"
          data-testid="login-button"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Authenticating...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      {authState.attempts > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Failed attempts: {authState.attempts}/3
        </div>
      )}
    </div>
  );
};