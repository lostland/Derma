import { AdminDashboard } from "@/components/admin-dashboard";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function AdminPage() {
  const [, navigate] = useLocation();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest("/api/admin/me", "GET");
        const data = await res.json();
        if (!data?.authenticated) {
          navigate("/admin-login");
        } else {
          setChecked(true);
        }
      } catch {
        navigate("/admin-login");
      }
    })();
  }, [navigate]);

  if (!checked) return null;
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-purple-50">
      <div className="container mx-auto p-6">
        <AdminDashboard />
        <PasswordChanger />
      </div>
    </div>
  );
}

function PasswordChanger() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest("/api/admin/change-password", "POST", { currentPassword, newPassword });
      await res.json();
      alert("비밀번호가 변경되었습니다.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (e) {
      alert("변경 실패. 현재 비밀번호를 확인하세요.");
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-6 bg-card border rounded-xl p-4 shadow-lg">
      <h2 className="font-bold mb-3">비밀번호 변경</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input className="border rounded px-3 py-2" placeholder="현재 비밀번호" type="password" value={currentPassword} onChange={(e)=>setCurrentPassword(e.target.value)} required />
        <input className="border rounded px-3 py-2" placeholder="새 비밀번호" type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} required />
      </div>
      <button className="mt-3 px-4 py-2 rounded bg-primary text-white">변경</button>
    </form>
  );
}
