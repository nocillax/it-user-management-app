import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, Mail, Loader } from "lucide-react";
import { authAPI, apiUtils } from "../../utils/api";

const EmailVerification = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        if (!token) {
          throw new Error("Verification token is missing");
        }

        const response = await authAPI.verifyEmail(token);

        setStatus("success");
        setMessage(
          response.message || "Email verified successfully! You can now login."
        );
      } catch (error) {
        // Verification failed
        setStatus("error");
        setMessage(apiUtils.getErrorMessage(error));
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center">
          {/* Logo */}
          <div className="text-2xl font-bold text-primary-600 mb-8">
            NX IT-UMS
          </div>

          {/* Status Icon and Content */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            {status === "verifying" && (
              <>
                <Loader className="mx-auto h-16 w-16 text-primary-600 animate-spin mb-4" />
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Verifying your email...
                </h2>
                <p className="text-gray-600">
                  Please wait while we verify your email address.
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Email Verified!
                </h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <Link to="/login" className="btn-primary inline-block">
                  Continue to Login
                </Link>
              </>
            )}

            {status === "error" && (
              <>
                <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Verification Failed
                </h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="space-y-3">
                  <Link to="/login" className="btn-primary inline-block w-full">
                    Go to Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-secondary inline-block w-full"
                  >
                    Register Again
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Having trouble? Contact support for assistance.
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
