import { AdminDashboard } from "@/components/admin-dashboard";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import { useTheme } from "@/context/ThemeContext";

export default function AdminPage() {
  const { color, setColor } = useTheme();
  const [draft, setDraft] = React.useState<string>(color);
  const [, navigate] = useLocation();
  const [checked, setChecked] = useState(false);

  // Password change dialog states
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest("GET", "/api/admin/me");
        const data = await res.json();
        if (!data?.authenticated) {
          navigate("/admin-login");
        } else {
          setChecked(true);
        }
      } catch (e) {
        // 인증 확인 실패 시 랜딩으로
        navigate("/");
      }
    })();
  }, [navigate]);

  if (!checked) return null;

  const onSubmitChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiRequest(
        "POST",
        "/api/admin/change-password",
        { currentPassword, newPassword }
      );
      const data = await res.json();
      if (data?.success) {
        alert("비밀번호가 변경되었습니다.");
        setOpen(false);
        setCurrentPassword("");
        setNewPassword("");
      } else {
        alert(data?.message || "변경 실패. 현재 비밀번호를 확인하세요.");
      }
    } catch (err: any) {
      alert(err?.message || "비밀번호 변경 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* 메인 대시보드 */}
      <div className="container mx-auto px-4 py-12">
        <AdminDashboard />
      </div>

      {/* 우측 하단 고정 버튼 */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 rounded-full px-4 py-3 bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition"
        title="비밀번호 변경"
        aria-label="비밀번호 변경"
      >
        비밀번호 변경
      </button>

      {/* 비밀번호 변경 다이얼로그 */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>비밀번호 변경</DialogTitle>
          </DialogHeader>

          <form onSubmit={onSubmitChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">현재 비밀번호</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">새 비밀번호</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                취소
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "변경 중..." : "변경"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Theme Color Config */}
      <div className="mt-6 p-4 border rounded-xl bg-white shadow-sm">
        <h3 className="text-lg font-semibold mb-3">테마 색상 설정</h3>
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-12 h-12 border rounded cursor-pointer"
            title="테마 색상 선택"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">현재 선택</span>
            <span className="px-2 py-1 rounded border" style={{ background: draft, color: '#fff' }}>{draft}</span>
          </div>
          <button
            className="ml-auto px-4 py-2 rounded-lg bg-theme text-white font-medium shadow hover:opacity-90 transition"
            onClick={() => { setColor(draft); try { localStorage.setItem('theme-color', draft); } catch (e) {}; navigate('/'); }}
          >
            테마 적용
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">버튼을 누르면 테마가 적용되고 랜딩 페이지로 이동합니다.</p>
      </div>

</div>
  );
}