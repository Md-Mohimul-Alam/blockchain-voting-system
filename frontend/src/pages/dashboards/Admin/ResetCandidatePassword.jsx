// src/pages/admin/ResetCandidatePassword.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, RotateCcw, User, Key } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import API from "@/services/api";

const ResetCandidatePassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    candidateDid: "",
    newPassword: "12345678"
  });
  const [resetResult, setResetResult] = useState(null);

  // Check if user is admin
  if (!user || user.role !== "Admin") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Alert variant="destructive" className="max-w-md">
            <AlertDescription>
              Access denied. Admin privileges required.
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }

  // In your ResetCandidatePassword.jsx - use the fixed endpoint
const handleReset = async () => {
  if (!formData.candidateDid.trim()) {
    toast({
      title: "Error",
      description: "Please enter candidate DID",
      variant: "destructive",
    });
    return;
  }

  setIsLoading(true);
  try {
    console.log(`🔐 Resetting password for candidate: ${formData.candidateDid}`);
    
    const response = await API.post(`/candidate/reset-password/${formData.candidateDid}`, {
      newPassword: formData.newPassword
    });

    console.log("✅ Reset response:", response.data);
    
    setResetResult(response.data.data);
    
    toast({
      title: "Password Reset Successful!",
      description: `Password for ${formData.candidateDid} has been reset`,
      variant: "success",
    });

  } catch (error) {
    console.error("❌ Reset error:", error);
    
    // If the main endpoint fails, try the default endpoint
    if (error.response?.data?.message?.includes('parameters')) {
      try {
        console.log('🔄 Trying default password reset...');
        const defaultResponse = await API.post(`/candidate/reset-password-default/${formData.candidateDid}`);
        setResetResult(defaultResponse.data.data);
        toast({
          title: "Password Reset Successful!",
          description: `Password for ${formData.candidateDid} reset to default`,
          variant: "success",
        });
      } catch (defaultError) {
        toast({
          title: "Reset Failed",
          description: "Both reset methods failed",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Reset Failed",
        description: error.response?.data?.error || "Unable to reset password",
        variant: "destructive",
      });
    }
  } finally {
    setIsLoading(false);
  }
};

  const handleQuickReset = (did) => {
    setFormData(prev => ({
      ...prev,
      candidateDid: did
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Shield className="h-12 w-12 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Emergency Password Reset
              </CardTitle>
              <CardDescription>
                Reset candidate passwords for login issues
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Quick Reset Buttons */}
              <div className="space-y-3">
                <h3 className="font-semibold">Quick Reset (Known Issues):</h3>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleQuickReset("C-1")}
                    disabled={isLoading}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Reset C-1
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleQuickReset("CCC-1")}
                    disabled={isLoading}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Reset CCC-1
                  </Button>
                </div>
              </div>

              {/* Manual Reset Form */}
              <div className="space-y-4">
                <h3 className="font-semibold">Manual Reset:</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Candidate DID</label>
                    <Input
                      placeholder="Enter candidate DID (e.g., C-1)"
                      value={formData.candidateDid}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        candidateDid: e.target.value
                      }))}
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">New Password</label>
                    <Input
                      value={formData.newPassword}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        newPassword: e.target.value
                      }))}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Default password: 12345678
                    </p>
                  </div>
                </div>

                <Button 
                  onClick={handleReset}
                  disabled={isLoading || !formData.candidateDid.trim()}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <RotateCcw className="h-4 w-4 animate-spin" />
                      Resetting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      Reset Password
                    </div>
                  )}
                </Button>
              </div>

              {/* Reset Result */}
              {resetResult && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">
                    <div className="font-semibold">✅ Password Reset Successful!</div>
                    <div className="mt-2 space-y-1 text-sm">
                      <div><strong>Candidate:</strong> {resetResult.username}</div>
                      <div><strong>DID:</strong> {formData.candidateDid}</div>
                      <div><strong>New Password:</strong> {resetResult.newPassword}</div>
                      <div><strong>Status:</strong> {resetResult.message}</div>
                    </div>
                    <div className="mt-3 p-2 bg-green-100 rounded text-xs">
                      <strong>Login Instructions:</strong><br />
                      • Role: Candidate<br />
                      • DID: {formData.candidateDid}<br />
                      • Username: {resetResult.username}<br />
                      • Password: {resetResult.newPassword}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Instructions */}
              <Alert variant="default" className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-800 text-sm">
                  <strong>Usage Instructions:</strong><br />
                  1. Enter candidate DID (e.g., C-1)<br />
                  2. Click "Reset Password"<br />
                  3. Candidate can now login with the new password<br />
                  4. Password will be reset for both voter and candidate records
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ResetCandidatePassword;