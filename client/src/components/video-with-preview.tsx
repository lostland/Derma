import { cn } from "@/lib/utils";
import {
  ComponentPropsWithoutRef,
  type SyntheticEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

function captureFrame(video: HTMLVideoElement) {
  if (!video.videoWidth || !video.videoHeight) return undefined;

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext("2d");
  if (!context) return undefined;

  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  try {
    return canvas.toDataURL("image/jpeg", 0.92);
  } catch (error) {
    console.warn("Failed to capture video frame", error);
    return undefined;
  }
}

type VideoWithPreviewProps = Omit<ComponentPropsWithoutRef<"video">, "children" | "poster"> & {
  /**
   * Video source url.
   */
  src: string;
  /**
   * Mime type for the source element. Defaults to `video/mp4`.
   */
  type?: string;
  /**
   * Optional alt text for the generated preview image.
   */
  previewAlt?: string;
};

/**
 * Video component that keeps a preview frame visible when the video is waiting or stalled.
 */
export function VideoWithPreview({
  className,
  src,
  type = "video/mp4",
  previewAlt = "Video preview",
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
  const [preview, setPreview] = useState<string>();
  const [showPreview, setShowPreview] = useState(true);

  // Reset preview when the source changes.
  useEffect(() => {
    setPreview(undefined);
    setShowPreview(true);
  }, [src]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const ensurePreview = () => {
      if (!preview) {
        const frame = captureFrame(videoElement);
        if (frame) {
          setPreview(frame);
        }
      }
    };

    const toSynthetic = (event: Event) => event as unknown as SyntheticEvent<HTMLVideoElement, Event>;

    const handleLoadedData = (event: Event) => {
      ensurePreview();
      onLoadedData?.(toSynthetic(event));
    };

    const handleCanPlay = (event: Event) => {
      ensurePreview();
      setShowPreview(videoElement.paused);
      onCanPlay?.(toSynthetic(event));
    };

    const handlePlaying = (event: Event) => {
      setShowPreview(false);
      onPlaying?.(toSynthetic(event));
    };

    const handleWaiting = (event: Event) => {
      ensurePreview();
      setShowPreview(true);
      onWaiting?.(toSynthetic(event));
    };

    const handleStalled = (event: Event) => {
      ensurePreview();
      setShowPreview(true);
      onStalled?.(toSynthetic(event));
    };

    const handleError = (event: Event) => {
      ensurePreview();
      setShowPreview(true);
      onError?.(toSynthetic(event));
    };

    videoElement.addEventListener("loadeddata", handleLoadedData);
    videoElement.addEventListener("canplay", handleCanPlay);
    videoElement.addEventListener("playing", handlePlaying);
    videoElement.addEventListener("waiting", handleWaiting);
    videoElement.addEventListener("stalled", handleStalled);
    videoElement.addEventListener("error", handleError);

    return () => {
      videoElement.removeEventListener("loadeddata", handleLoadedData);
      videoElement.removeEventListener("canplay", handleCanPlay);
      videoElement.removeEventListener("playing", handlePlaying);
      videoElement.removeEventListener("waiting", handleWaiting);
      videoElement.removeEventListener("stalled", handleStalled);
      videoElement.removeEventListener("error", handleError);
    };
  }, [onCanPlay, onError, onLoadedData, onPlaying, onStalled, onWaiting, preview, src]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (autoPlay) {
      const playPromise = videoElement.play();
      if (playPromise?.catch) {
        playPromise.catch(() => {
          // Keep the preview visible when autoplay is not allowed.
          setShowPreview(true);
        });
      }
    }
  }, [autoPlay, src]);

  const previewImage = useMemo(() => {
    if (!preview) return null;
    return (
      <img
        aria-hidden
        alt={previewAlt}
        src={preview}
        className={cn(
          "pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
          showPreview ? "opacity-100" : "opacity-0"
        )}
      />
    );
  }, [preview, previewAlt, showPreview]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {previewImage}
      <video
        ref={videoRef}
        className={cn("relative z-10 h-full w-full object-cover", className)}
        muted={muted}
        loop={loop}
        playsInline={playsInline}
        autoPlay={autoPlay}
        {...videoProps}
      >
        <source src={src} type={type} />
      </video>
    </div>
  );
}
