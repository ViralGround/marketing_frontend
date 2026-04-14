import Link from "next/link";
import SignupForm from "@/components/auth/SignupForm";

export default function CreatorSignupPage() {
  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center">
      <div className="w-full max-w-md space-y-6 rounded border border-gray-200 bg-white p-8">
        <h1 className="text-center text-2xl font-bold text-gray-900">
          Creator Sign Up
        </h1>
        <SignupForm role="CREATOR" />
        <p className="text-center text-sm text-gray-500">
          Are you a company?{" "}
          <Link href="/signup/company" className="text-gray-900 underline">
            Sign up as Company
          </Link>
        </p>
      </div>
    </div>
  );
}
