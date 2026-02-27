import { SignIn } from '@clerk/clerk-react';

export default function LoginPage() {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <SignIn
        routing="path"
        path="/login"
        signUpUrl="/signup"
        afterSignInUrl="/auth-callback"  // Changed to sync via callback
        appearance={{
          elements: {
            formButtonPrimary: 'bg-green-500 hover:bg-green-600 text-white',
            // Add more customizations if needed
          },
        }}
      />
    </div>
  );
}