import CreatorSignupForm from "@/components/auth/CreatorSignupForm";

export default function CreatorSignupPage() {
  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center py-12">
      <div className="w-full max-w-md space-y-6 rounded border border-gray-200 bg-white p-8">
        <h1 className="text-center text-2xl font-bold text-gray-900">
          크리에이터 가입 신청
        </h1>
        <CreatorSignupForm />
      </div>
    </div>
  );
}
