import { cn } from "@/lib/utils";
import {
  ComponentPropsWithoutRef,
  type SyntheticEvent,
  useRef,
} from "react";

interface VideoWithPreviewProps
  extends Omit<ComponentPropsWithoutRef<"video">, "children" | "src"> {
  /**
   * 비디오 소스 URL.
   */
  src: string;
  /**
   * <source> 요소에 사용할 MIME 타입. 기본값은 `video/mp4`.
   */
  type?: string;
}

/**
 * JPG 미리보기 이미지 없이 바로 MP4 비디오를 렌더링하는 컴포넌트입니다.
 */
export function VideoWithPreview({
  className,
  src,
  type = "video/mp4",
  autoPlay = true,
  loop = true,
  muted = true,
  playsInline = true,
  onLoadedData,
  onCanPlay,
  onPlaying,
  onWaiting,
  onStalled,
  onError,
  ...videoProps
}: VideoWithPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleLoadedData = (event: SyntheticEvent<HTMLVideoElement, Event>) => {
    onLoadedData?.(event);
  };

  const handleCanPlay = (event: SyntheticEvent<HTMLVideoElement, Event>) => {
    const videoElement = videoRef.current;
    if (autoPlay && videoElement) {
      const playPromise = videoElement.play();
      playPromise?.catch(() => {
        // 자동 재생이 실패하더라도 추가 처리는 하지 않습니다.
      });
    }
    onCanPlay?.(event);
  };

  const handlePlaying = (event: SyntheticEvent<HTMLVideoElement, Event>) => {
    onPlaying?.(event);
  };

  const handleWaiting = (event: SyntheticEvent<HTMLVideoElement, Event>) => {
    onWaiting?.(event);
  };

  const handleStalled = (event: SyntheticEvent<HTMLVideoElement, Event>) => {
    onStalled?.(event);
  };

  const handleError = (event: SyntheticEvent<HTMLVideoElement, Event>) => {
    onError?.(event);
  };

  return (
    <video
      ref={videoRef}
      className={cn("h-full w-full object-cover", className)}
      muted={muted}
      loop={loop}
      playsInline={playsInline}
      autoPlay={autoPlay}
      onLoadedData={handleLoadedData}
      onCanPlay={handleCanPlay}
      onPlaying={handlePlaying}
      onWaiting={handleWaiting}
      onStalled={handleStalled}
      onError={handleError}
      {...videoProps}
    >
      <source src={src} type={type} />
    </video>
  );
}
