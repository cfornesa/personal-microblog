import { SignIn } from "@clerk/react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center py-12 px-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
      </div>
    </div>
  );
}
