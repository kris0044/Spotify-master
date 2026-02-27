import { SignUp } from '@clerk/clerk-react';

export default function SignUpPage() {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <SignUp
        routing="path"
        path="/signup"
        signInUrl="/login"
        afterSignUpUrl="/auth-callback"  // Changed to sync via callback
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