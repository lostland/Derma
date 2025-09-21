import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";

import Landing from "@/pages/landing";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

/**
 * 라우트 가이드
 * - "/"    : 누구나 접근 (랜딩)
 * - "/home": 관리자 전용 (로그인 성공 시 진입), 비로그인 시 랜딩으로 리다이렉트
 */
function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen grid place-items-center">Loading...</div>;
  }

  return (
    <Switch>
      {/* 공개 페이지 */}
      <Route path="/">
        <Landing />
      </Route>

      {/* 관리자 전용 페이지 */}
      <Route path="/admin">
        {isAuthenticated ? <Home /> : <Landing />}
      </Route>

      {/* (선택) 기존 /home 유지하려면 아래 유지 */}
      <Route path="/home">
        {isAuthenticated ? <Home /> : <Landing />}
      </Route>

      {/* 404 */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
