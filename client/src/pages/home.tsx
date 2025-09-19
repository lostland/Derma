import { AdminDashboard } from "@/components/admin-dashboard";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, User } from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl md:text-2xl font-bold text-primary">
              서울 안티에이징 피부과 의원
            </h1>
            <span className="text-sm text-muted-foreground">관리자 패널</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span className="text-sm">{(user as any)?.email || "관리자"}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-1" />
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">관리자 대시보드</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                환자 문의 내역을 확인하고 관리할 수 있습니다.
              </p>
            </CardContent>
          </Card>
        </div>

        <AdminDashboard />
      </main>
    </div>
  );
}
