import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { verifyAuthAsync } from "@/store/slices/authSlice";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  useEffect(() => {
    // Only verify auth if we don't have a user but might have a token
    if (!user && !isAuthenticated) {
      dispatch(verifyAuthAsync());
    }
  }, [dispatch, user, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-gradient flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 icon-gradient-primary rounded-2xl flex items-center justify-center mx-auto">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold gradient-text-primary">
              Loading
            </h2>
            <p className="text-muted-foreground">
              Please wait while we verify your session...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
