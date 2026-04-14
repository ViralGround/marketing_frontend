import Link from "next/link";
import SignupForm from "@/components/auth/SignupForm";

export default function CreatorSignupPage() {
  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center">
      <div className="w-full max-w-md space-y-6 rounded border border-gray-200 bg-white p-8">
        <h1 className="text-center text-2xl font-bold text-gray-900">
          크리에이터 회원가입
        </h1>
        <SignupForm role="CREATOR" />
        <p className="text-center text-sm text-gray-500">
          기업이신가요?{" "}
          <Link href="/signup/company" className="text-primary underline">
            기업으로 가입하기
          </Link>
        </p>
      </div>
    </div>
  );
}
