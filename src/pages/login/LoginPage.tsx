import AuthShell from "@/components/AuthShell";
import { SignIn } from "@clerk/clerk-react";

const LoginPage = () => {
	return (
		<AuthShell
			title='Sign In'
			subtitle='Continue as user, artist, or admin'
			footerText='New here?'
			footerLinkLabel='Create an account'
			footerLinkTo='/signup'
		>
			<SignIn
				routing='path'
				path='/login'
				signUpUrl='/signup'
				afterSignInUrl='/auth-callback'
				redirectUrl='/auth-callback'
			/>
		</AuthShell>
	);
};

export default LoginPage;
