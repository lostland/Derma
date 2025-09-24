import { useState } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
	e.preventDefault();
	setError(null);
	setLoading(true);
	try {
	  const res = await apiRequest("POST", "/api/admin/login", { username, password });
	  const data = await res.json();
	  if (data?.success) {
		navigate("/admin");
	  } else {
		setError(data?.message || "로그인에 실패했습니다.");
	  }
	} catch (err: any) {
	  setError(err?.message || "로그인 중 오류가 발생했습니다.");
	} finally {
	  setLoading(false);
	}
  };

  return (
	<main className="min-h-screen flex items-center justify-center bg-background px-4">
	  <form onSubmit={onSubmit} className="w-full max-w-md bg-card border rounded-2xl p-6 shadow-lg space-y-4">
		<div className="text-center">
		  <h1 className="text-2xl font-bold">관리자 로그인</h1>
		  <p className="text-sm text-muted-foreground mt-1">권한이 있는 사용자만 접근할 수 있습니다.</p>
		</div>

		<div className="space-y-2">
		  <Label htmlFor="username">아이디</Label>
		  <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
		</div>

		<div className="space-y-2">
		  <Label htmlFor="password">비밀번호</Label>
		  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
		</div>

		{error && <div className="text-sm text-red-600">{error}</div>}

		<Button type="submit" className="w-full" disabled={loading}>
		  {loading ? "로그인 중..." : "로그인"}
		</Button>
	  </form>
	</main>
  );
}
