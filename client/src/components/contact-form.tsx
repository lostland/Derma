import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Send } from "lucide-react";

export function ContactForm() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const section = sectionRef.current;
    if (section) {
      const animatedElements = section.querySelectorAll('.animate-fade-in');
      animatedElements.forEach((el) => observer.observe(el));
    }

    return () => observer.disconnect();
  }, []);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    inquiry: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("POST", "/api/inquiries", data);
    },
    onSuccess: () => {
      toast({
        title: "문의 접수 완료",
        description: "상담 문의가 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.",
      });
      setFormData({ name: "", phone: "", inquiry: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/inquiries"] });
    },
    onError: (error) => {
      console.error("Contact form error:", error);
      toast({
        title: "문의 접수 실패",
        description: "문의 접수 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.inquiry.trim()) {
      toast({
        title: "입력 오류",
        description: "모든 필드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    mutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section ref={sectionRef} className="py-20 bg-secondary" data-testid="section-contact">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h3 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              온라인 상담 문의
            </h3>
            <p className="text-lg text-muted-foreground">
              궁금한 사항이나 상담 예약은 아래 양식을 통해 문의해 주세요
            </p>
          </div>

          <Card className="p-8 shadow-lg animate-fade-in">
            <CardContent className="p-0">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium mb-2">
                    이름 *
                  </Label>
                  <Input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full p-4"
                    placeholder="이름을 입력해주세요"
                    data-testid="input-name"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium mb-2">
                    연락처 *
                  </Label>
                  <Input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="w-full p-4"
                    placeholder="연락처를 입력해주세요"
                    data-testid="input-phone"
                  />
                </div>

                <div>
                  <Label htmlFor="inquiry" className="text-sm font-medium mb-2">
                    문의 내용 *
                  </Label>
                  <Textarea
                    id="inquiry"
                    value={formData.inquiry}
                    onChange={(e) => handleChange("inquiry", e.target.value)}
                    rows={5}
                    className="w-full p-4"
                    placeholder="문의하실 내용을 자세히 적어주세요"
                    data-testid="textarea-inquiry"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 text-lg font-medium"
                  data-testid="button-submit-inquiry"
                >
                  <Send className="w-5 h-5 mr-2" />
                  {mutation.isPending ? "접수 중..." : "상담 문의 보내기"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
