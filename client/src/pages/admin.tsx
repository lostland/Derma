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
import { cn } from "@/lib/utils";

export default function AdminPage() {

  const { theme, themes, setTheme } = useTheme();
  const [draft, setDraft] = useState<string>(theme.id);

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

  useEffect(() => {

    setDraft(theme.id);
  }, [theme.id]);


  if (!checked) return null;

  const handleApplyTheme = () => {

    setTheme(draft);

    navigate("/");
  };

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

      {/* Theme Config */}
      <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold">테마 선택</h3>
          <p className="text-sm text-muted-foreground">
            몇 가지 추천 조합 중에서 원하는 분위기를 골라 랜딩 페이지 전체에 적용해보세요.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {themes.map((option) => {
            const selected = option.id === draft;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setDraft(option.id)}
                className={cn(
                  "group flex h-full flex-col overflow-hidden rounded-2xl border text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                  selected
                    ? "border-primary shadow-lg ring-2 ring-primary/50"
                    : "border-border hover:border-primary/40 hover:shadow-md"
                )}
              >
                <div
                  className="h-24 w-full"
                  style={{
                    background: `linear-gradient(135deg, ${option.preview[0]}, ${option.preview[1]}, ${option.preview[2]})`,
                  }}
                />
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold">{option.name}</span>
                    {selected && <span className="text-xs font-medium text-primary">선택됨</span>}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{option.description}</p>
                </div>
              </button>
            );
          })}

        </div>
      </div>

      <Button
        size="lg"
        className="fixed bottom-6 left-6 z-50 shadow-lg"
        onClick={handleApplyTheme}
        disabled={draft === theme.id}
      >
        {draft === theme.id ? "현재 테마 적용 중" : "테마 적용"}
      </Button>

    </div>
  );
}