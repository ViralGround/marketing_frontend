import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center">
      <div className="w-full max-w-md space-y-6 rounded border border-gray-200 bg-white p-8">
        <h1 className="text-center text-2xl font-bold text-gray-900">로그인</h1>
        <LoginForm />
        <p className="text-center text-sm text-gray-500">
          계정이 없으신가요?{" "}
          <Link href="/signup" className="text-gray-900 underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
