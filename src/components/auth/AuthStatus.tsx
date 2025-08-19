import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, User, Clock, AlertTriangle, RotateCcw } from "lucide-react";

interface AuthState {
  isAuthenticated: boolean;
  method: "password" | "fingerprint" | "face" | null;
  user: string | null;
  attempts: number;
  isLocked: boolean;
  lastError: string | null;
}

interface AuthStatusProps {
  authState: AuthState;
  onReset: () => void;
}

export const AuthStatus = ({ authState, onReset }: AuthStatusProps) => {
  const getStatusColor = () => {
    if (authState.isAuthenticated) return "bg-secondary";
    if (authState.isLocked) return "bg-destructive";
    if (authState.attempts > 0) return "bg-accent";
    return "bg-muted";
  };

  const getMethodIcon = () => {
    switch (authState.method) {
      case "password":
        return <Shield className="h-4 w-4" />;
      case "fingerprint":
        return <span className="text-sm">👆</span>;
      case "face":
        return <span className="text-sm">👤</span>;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getMethodLabel = () => {
    switch (authState.method) {
      case "password":
        return "Password";
      case "fingerprint":
        return "Fingerprint";
      case "face":
        return "Face ID";
      default:
        return "None";
    }
  };

  return (
    <Card className="bg-card border-border p-6 shadow-card-security">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${getStatusColor()}`}>
            <Shield className="h-6 w-6 text-background" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">Authentication Status</h3>
            <p className="text-sm text-muted-foreground">Real-time security monitoring</p>
          </div>
        </div>
        
        <Button 
          onClick={onReset} 
          variant="outline" 
          size="sm"
          data-testid="reset-button"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Session
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Authentication Status */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${authState.isAuthenticated ? 'bg-secondary animate-pulse' : 'bg-muted-foreground'}`} />
            <span className="text-sm font-medium text-foreground">Status</span>
          </div>
          <Badge variant={authState.isAuthenticated ? "default" : "secondary"} className="text-xs">
            {authState.isAuthenticated ? "Authenticated" : "Not Authenticated"}
          </Badge>
        </div>

        {/* Authentication Method */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            {getMethodIcon()}
            <span className="text-sm font-medium text-foreground">Method</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {getMethodLabel()}
          </Badge>
        </div>

        {/* User Info */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">User</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {authState.user || "Guest"}
          </Badge>
        </div>
      </div>

      {/* Security Alerts */}
      {authState.isLocked && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">Account Locked</p>
              <p className="text-xs text-destructive/80">Multiple failed authentication attempts detected</p>
            </div>
          </div>
        </div>
      )}

      {authState.attempts > 0 && !authState.isLocked && (
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-accent" />
            <div>
              <p className="text-sm font-medium text-accent">Failed Attempts: {authState.attempts}/3</p>
              <p className="text-xs text-accent/80">Account will be locked after 3 failed attempts</p>
            </div>
          </div>
        </div>
      )}

      {authState.lastError && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">Last Error</p>
              <p className="text-xs text-destructive/80">{authState.lastError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Test Automation Info */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-xs font-medium text-primary">Test Automation Active</span>
        </div>
        <p className="text-xs text-muted-foreground">
          This interface includes test selectors for Playwright automation. 
          All authentication flows are monitored and logged for AI analysis.
        </p>
      </div>
    </Card>
  );
};