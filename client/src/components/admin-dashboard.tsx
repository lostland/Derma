import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Loader2, MessageSquare, Phone, User, Calendar } from "lucide-react";
import type { Inquiry } from "@shared/schema";

export function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // compact rows expand/collapse state
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const { data: inquiries, isLoading, error } = useQuery<Inquiry[]>({
    queryKey: ["/api/inquiries"],
    retry: false,
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest("PATCH", `/api/inquiries/${id}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "상태 업데이트 완료",
        description: "문의 상태가 성공적으로 업데이트되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/inquiries"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "인증 오류",
          description: "로그인이 필요합니다. 다시 로그인해주세요.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({
        title: "업데이트 실패",
        description: "상태 업데이트 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (error && isUnauthorizedError(error)) {
      toast({
        title: "인증 오류",
        description: "로그인이 필요합니다. 로그인 페이지로 이동합니다.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
    }
  }, [error, toast]);

  const handleStatusChange = (id: string, status: string) => {
    statusMutation.mutate({ id, status });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "new":
        return "default";
      case "contacted":
        return "secondary";
      case "completed":
        return "outline";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "new":
        return "신규";
      case "contacted":
        return "연락완료";
      case "completed":
        return "처리완료";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12" data-testid="loading-inquiries">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">문의 내역을 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card data-testid="error-inquiries">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            문의 내역을 불러오는 중 오류가 발생했습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!inquiries || (Array.isArray(inquiries) && inquiries.length === 0)) {
    return (
      <Card data-testid="empty-inquiries">
        <CardContent className="py-12 text-center">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">접수된 문의가 없습니다</p>
          <p className="text-muted-foreground">
            새로운 문의가 들어오면 여기에 표시됩니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-dashboard">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">문의 내역 관리</h2>
        <Badge variant="secondary" className="text-sm">
          총 {Array.isArray(inquiries) ? inquiries.length : 0}개
        </Badge>
      </div>

      <div className="grid gap-6">
        {
Array.isArray(inquiries) && inquiries.map((inquiry: Inquiry) => {
          const isCompact = (inquiry.status === "completed" || inquiry.status === "contacted");
          const isOpen = expandedIds[inquiry.id] ?? !isCompact;

          const toggle = () => {
            if (isCompact) {
              setExpandedIds((prev) => ({ ...prev, [inquiry.id]: !isOpen }));
            }
          };

          return (
          <Card key={inquiry.id} className={"shadow-sm " + (isCompact ? "cursor-pointer" : "")} data-testid={`inquiry-${inquiry.id}`}>
            <CardHeader className="pb-3" onClick={toggle}>
              {isCompact ? (
                <div className="flex items-center justify-between">
                  <div className="text-sm md:text-base font-medium truncate">
                    {inquiry.name} <span className="text-muted-foreground">{inquiry.phone}</span>
                    <span className="ml-2 text-xs text-muted-foreground">({getStatusText(inquiry.status || "new")})</span>
                  </div>
                  <div className="text-xs text-muted-foreground hidden md:block">
                    {new Date(inquiry.createdAt!).toLocaleString("ko-KR")}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {inquiry.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(inquiry.status || "new")}>
                      {getStatusText(inquiry.status || "new")}
                    </Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(inquiry.createdAt!).toLocaleString("ko-KR")}
                    </div>
                  </div>
                </div>
              )}
            </CardHeader>

            <CardContent className={isOpen ? "space-y-4 pt-0" : "hidden"}>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4" />
                    {inquiry.phone}
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <MessageSquare className="w-4 h-4 mt-0.5" />
                    <span className="whitespace-pre-wrap">{inquiry.inquiry}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">등록일:&nbsp;</span>
                    {new Date(inquiry.createdAt!).toLocaleString("ko-KR")}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">상태:&nbsp;</span>
                    <Badge variant={getStatusBadgeVariant(inquiry.status || "new")}>
                      {getStatusText(inquiry.status || "new")}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => handleStatusChange(inquiry.id, "contacted")}
                  disabled={statusMutation.isPending}
                  data-testid={`button-contacted-${inquiry.id}`}
                >
                  연락완료
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange(inquiry.id, "completed")}
                  disabled={statusMutation.isPending}
                  data-testid={`button-completed-${inquiry.id}`}
                >
                  처리완료
                </Button>
                <Button
                  onClick={() => handleStatusChange(inquiry.id, "new")}
                  disabled={statusMutation.isPending}
                  data-testid={`button-reset-${inquiry.id}`}
                >
                  신규로 변경
                </Button>
              </div>
            </CardContent>
          </Card>
        )})}
      </div>
    </div>
  );
}
