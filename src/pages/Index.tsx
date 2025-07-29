import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigate("/dashboard");
      } else {
        navigate("/auth");
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-brand-gradient flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 icon-gradient-primary rounded-2xl flex items-center justify-center mx-auto">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold gradient-text-primary">
            Sprint Board Hub
          </h2>
          <p className="text-muted-foreground">Loading your workspace...</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
