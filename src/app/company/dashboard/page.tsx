"use client";

import { useAuthStore } from "@/store/useAuthStore";

export default function CompanyDashboard() {
  const { user } = useAuthStore();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">
        Company Dashboard
      </h1>
      <p className="mb-8 text-gray-500">Welcome, {user?.name}</p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded border border-gray-200 p-6">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Campaigns
          </h2>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-500">Active campaigns</p>
        </div>
        <div className="rounded border border-gray-200 p-6">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Creators
          </h2>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-500">Connected creators</p>
        </div>
        <div className="rounded border border-gray-200 p-6">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Contents
          </h2>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-500">Published contents</p>
        </div>
      </div>
    </div>
  );
}
