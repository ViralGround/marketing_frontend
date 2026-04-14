import Link from "next/link";
import SignupForm from "@/components/auth/SignupForm";

export default function CompanySignupPage() {
  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center">
      <div className="w-full max-w-md space-y-6 rounded border border-gray-200 bg-white p-8">
        <h1 className="text-center text-2xl font-bold text-gray-900">
          Company Sign Up
        </h1>
        <SignupForm role="COMPANY" />
        <p className="text-center text-sm text-gray-500">
          Are you a creator?{" "}
          <Link href="/signup/creator" className="text-gray-900 underline">
            Sign up as Creator
          </Link>
        </p>
      </div>
    </div>
  );
}
