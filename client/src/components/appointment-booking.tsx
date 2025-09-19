import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Calendar as CalendarIcon, Clock, User, Phone, Mail, Send, MapPin } from "lucide-react";
import { format, addDays, setHours, setMinutes } from "date-fns";
import { ko } from "date-fns/locale";
import type { ServiceType } from "@shared/schema";
import { LocationSearch, type LocationData } from "@/components/location-search";

interface BookingFormData {
  name: string;
  phone: string;
  email: string;
  serviceTypeId: string;
  appointmentDate: Date | undefined;
  appointmentTime: string;
  notes: string;
  location: LocationData | null;
}

export function AppointmentBooking() {
  const sectionRef = useRef<HTMLElement>(null);
  const [formData, setFormData] = useState<BookingFormData>({
    name: "",
    phone: "",
    email: "",
    serviceTypeId: "",
    appointmentDate: undefined,
    appointmentTime: "",
    notes: "",
    location: null,
  });
  const [selectedDate, setSelectedDate] = useState<Date>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Fetch service types
  const { data: serviceTypes, isLoading: serviceTypesLoading } = useQuery<ServiceType[]>({
    queryKey: ["/api/service-types"],
  });

  // Available time slots
  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
  ];

  const bookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      if (!data.appointmentDate || !data.appointmentTime) {
        throw new Error("날짜와 시간을 선택해주세요.");
      }

      const [hours, minutes] = data.appointmentTime.split(':').map(Number);
      const appointmentDateTime = setMinutes(setHours(data.appointmentDate, hours), minutes);

      const bookingData = {
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        serviceTypeId: data.serviceTypeId,
        appointmentDate: appointmentDateTime.toISOString(),
        notes: data.notes || undefined,
        address: data.location?.address || undefined,
        latitude: data.location?.latitude?.toString() || undefined,
        longitude: data.location?.longitude?.toString() || undefined,
      };

      return await apiRequest("POST", "/api/appointments", bookingData);
    },
    onSuccess: () => {
      toast({
        title: "예약 접수 완료",
        description: "예약이 성공적으로 접수되었습니다. 확인 연락을 드리겠습니다.",
      });
      setFormData({
        name: "",
        phone: "",
        email: "",
        serviceTypeId: "",
        appointmentDate: undefined,
        appointmentTime: "",
        notes: "",
        location: null,
      });
      setSelectedDate(undefined);
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
    },
    onError: (error: Error) => {
      console.error("Booking error:", error);
      toast({
        title: "예약 접수 실패",
        description: error.message || "예약 접수 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim() || !formData.serviceTypeId || 
        !formData.appointmentDate || !formData.appointmentTime) {
      toast({
        title: "입력 오류",
        description: "필수 항목을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    bookingMutation.mutate(formData);
  };

  const handleChange = (field: keyof BookingFormData, value: string | Date | undefined | LocationData | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (location: LocationData | null) => {
    handleChange('location', location);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    handleChange('appointmentDate', date);
  };

  // Disable past dates and Sundays (휴진)
  const disabledDays = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today || date.getDay() === 0; // Sunday = 0
  };

  return (
    <section ref={sectionRef} className="py-20 bg-secondary" data-testid="section-booking">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h3 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              온라인 예약
            </h3>
            <p className="text-lg text-muted-foreground">
              편리한 온라인 예약으로 원하는 시간에 전문 진료를 받으세요
            </p>
          </div>

          <Card className="p-8 shadow-lg animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <CalendarIcon className="w-5 h-5" />
                진료 예약하기
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      이름 *
                    </Label>
                    <Input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="w-full p-4"
                      placeholder="이름을 입력해주세요"
                      data-testid="input-booking-name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      연락처 *
                    </Label>
                    <Input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="w-full p-4"
                      placeholder="연락처를 입력해주세요"
                      data-testid="input-booking-phone"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      이메일
                    </Label>
                    <Input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="w-full p-4"
                      placeholder="이메일을 입력해주세요 (선택사항)"
                      data-testid="input-booking-email"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      진료 유형 *
                    </Label>
                    <Select
                      value={formData.serviceTypeId}
                      onValueChange={(value) => handleChange("serviceTypeId", value)}
                      data-testid="select-service-type"
                    >
                      <SelectTrigger className="w-full p-4">
                        <SelectValue placeholder="진료 유형을 선택해주세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceTypesLoading ? (
                          <SelectItem value="loading" disabled>로딩 중...</SelectItem>
                        ) : (
                          serviceTypes?.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name} ({service.duration}분 - {Number(service.price).toLocaleString()}원)
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      예약 날짜 *
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full p-4 justify-start text-left font-normal"
                          data-testid="button-date-picker"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? (
                            format(selectedDate, "PPP", { locale: ko })
                          ) : (
                            "날짜를 선택해주세요"
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={handleDateSelect}
                          disabled={disabledDays}
                          locale={ko}
                          fromDate={new Date()}
                          toDate={addDays(new Date(), 60)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      예약 시간 *
                    </Label>
                    <Select
                      value={formData.appointmentTime}
                      onValueChange={(value) => handleChange("appointmentTime", value)}
                      data-testid="select-time-slot"
                    >
                      <SelectTrigger className="w-full p-4">
                        <SelectValue placeholder="시간을 선택해주세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="col-span-full">
                  <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    거주지 주소 (선택사항)
                  </Label>
                  <LocationSearch
                    value={formData.location}
                    onChange={handleLocationChange}
                    placeholder="주소를 검색하거나 지도에서 위치를 선택하세요 (더 나은 서비스를 위해)"
                    className="w-full"
                  />
                </div>

                <div>
                  <Label htmlFor="notes" className="text-sm font-medium mb-2">
                    추가 요청사항
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    rows={3}
                    className="w-full p-4"
                    placeholder="특별한 요청사항이나 궁금한 점을 적어주세요"
                    data-testid="textarea-booking-notes"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={bookingMutation.isPending}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 text-lg font-medium"
                  data-testid="button-submit-booking"
                >
                  <Send className="w-5 h-5 mr-2" />
                  {bookingMutation.isPending ? "예약 접수 중..." : "예약하기"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 text-center animate-fade-in">
            <div className="bg-muted/50 p-6 rounded-lg">
              <h4 className="font-medium mb-3 text-primary">진료시간 안내</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <p><strong>평일:</strong> 09:00 - 18:00</p>
                  <p><strong>토요일:</strong> 09:00 - 15:00</p>
                </div>
                <div>
                  <p><strong>점심시간:</strong> 12:00 - 14:00</p>
                  <p><strong>일요일:</strong> 휴진</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}