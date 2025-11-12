import { checkSessionAndRedirect } from "./actions";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  await checkSessionAndRedirect();

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-8 px-6 py-16">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-semibold text-slate-900">Welcome back</h1>
        <p className="text-sm text-slate-600">
          Sign in to access your personalized dashboard and manage live music events.
        </p>
      </div>
      <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <LoginForm />
      </div>
    </div>
  );
}
