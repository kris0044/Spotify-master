import AuthShell from "@/components/AuthShell";
import { SignUp } from "@clerk/clerk-react";

const SignUpPage = () => {
	return (
		<AuthShell
			title='Create Account'
			subtitle='One signup flow for user, artist, and admin access'
			footerText='Already have an account?'
			footerLinkLabel='Sign in'
			footerLinkTo='/login'
		>
			<SignUp
				routing='path'
				path='/signup'
				signInUrl='/login'
				afterSignUpUrl='/auth-callback'
				redirectUrl='/auth-callback'
				appearance={{
					variables: {
						colorText: "#ffffff",
						colorTextSecondary: "#a1a1aa",
						colorBackground: "transparent",
						colorInputBackground: "#27272a",
						colorInputText: "#ffffff",
						colorPrimary: "#22c55e",
					},
					elements: {
						otpCodeFieldInput: "text-white bg-zinc-800 border-zinc-700",
						formFieldInput: "text-white bg-zinc-800 border-zinc-700",
						formFieldLabel: "text-zinc-300",
						formResendCodeLink: "text-emerald-400",
						identityPreviewText: "text-white",
						alertText: "text-white",
						formFieldSuccessText: "text-emerald-400",
					},
				}}
			/>
		</AuthShell>
	);
};

export default SignUpPage;
