import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Database, FileText, ExternalLink } from "lucide-react";

interface DatabaseSetupAlertProps {
  onDismiss?: () => void;
}

export const DatabaseSetupAlert = ({ onDismiss }: DatabaseSetupAlertProps) => {
  const openSetupGuide = () => {
    window.open('/SUPABASE_SETUP.md', '_blank');
  };

  const openSupabaseDashboard = () => {
    window.open('https://supabase.com/dashboard', '_blank');
  };

  return (
    <Alert className="border-orange-200 bg-orange-50 text-orange-800">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-800">Database Setup Required</AlertTitle>
      <AlertDescription className="text-orange-700 mt-2">
        <div className="space-y-3">
          <p>
            The Supabase database tables haven't been created yet. You need to set up the database schema before using the authentication system.
          </p>
          
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={openSetupGuide}
              variant="outline"
              size="sm"
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              <FileText className="h-4 w-4 mr-2" />
              View Setup Guide
            </Button>
            
            <Button
              onClick={openSupabaseDashboard}
              variant="outline"
              size="sm"
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Supabase
            </Button>
          </div>
          
          <div className="bg-orange-100 p-3 rounded-md text-sm">
            <p className="font-medium mb-2">Quick Setup Steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Go to your Supabase project dashboard</li>
              <li>Navigate to SQL Editor</li>
              <li>Copy and paste the contents of <code className="bg-orange-200 px-1 rounded">supabase/schema.sql</code></li>
              <li>Click "Run" to execute the schema</li>
              <li>Refresh this page</li>
            </ol>
          </div>
          
          {onDismiss && (
            <Button
              onClick={onDismiss}
              variant="ghost"
              size="sm"
              className="text-orange-600 hover:text-orange-800 hover:bg-orange-100"
            >
              Dismiss
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};
