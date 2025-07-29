import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import { useAppSelector } from "@/hooks/redux";

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  // Redirect if already authenticated (e.g., page refresh with valid token)
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-brand-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="text-center lg:text-left space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-6xl font-bold gradient-text-primary">
              Sprint Board Hub
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground">
              Streamline your project management with our intuitive task board
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 justify-center lg:justify-start">
              <div className="w-8 h-8 icon-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">✓</span>
              </div>
              <span className="text-lg">Drag & drop task management</span>
            </div>
            <div className="flex items-center gap-4 justify-center lg:justify-start">
              <div className="w-8 h-8 icon-gradient-secondary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">✓</span>
              </div>
              <span className="text-lg">Real-time collaboration</span>
            </div>
            <div className="flex items-center gap-4 justify-center lg:justify-start">
              <div className="w-8 h-8 icon-gradient-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">✓</span>
              </div>
              <span className="text-lg">Advanced filtering & search</span>
            </div>
          </div>
        </div>

        {/* Right side - Auth Form */}
        <div className="flex justify-center">
          {isLogin ? (
            <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
