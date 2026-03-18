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
			/>
		</AuthShell>
	);
};

export default SignUpPage;
