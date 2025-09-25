import { cn } from "@/lib/utils";
import {
  ComponentPropsWithoutRef,
  type SyntheticEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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
  /**
   * Explicit preview image source. When omitted, the component attempts to
   * locate an image with the same base name and a `.jpg` extension.
   */
  posterSrc?: string;
};

type PosterModule = { default: string } | string;

const posterModules = import.meta.glob<PosterModule>("@assets/*.jpg", {
  eager: true,
});

const posterByBasename = Object.entries(posterModules).reduce<Record<string, string>>(
  (acc, [path, module]) => {
    const fileName = path.split("/").pop();
    if (!fileName) return acc;

    const base = fileName.replace(/\.[^.]+$/, "");
    acc[base] = typeof module === "string" ? module : module.default;
    return acc;
  },
  {}
);

function getPosterFromSrc(src: string) {
  const fileNameWithHash = src.split("/").pop();
  if (!fileNameWithHash) return undefined;

  const withoutQuery = fileNameWithHash.split(/[?#]/)[0] ?? fileNameWithHash;
  const withoutExtension = withoutQuery.replace(/\.[^.]+$/, "");
  const [base] = withoutExtension.split("-");

  if (!base) return undefined;

  return posterByBasename[base];
}

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
  posterSrc,
  onLoadedData,
  onCanPlay,
  onPlaying,
  onWaiting,
  onStalled,
  onError,
  ...videoProps
}: VideoWithPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const resolvedPoster = useMemo(() => posterSrc ?? getPosterFromSrc(src), [posterSrc, src]);
  const [showPreview, setShowPreview] = useState(Boolean(resolvedPoster));

  useEffect(() => {
    setShowPreview(Boolean(resolvedPoster));
  }, [resolvedPoster, src]);

  const handleLoadedData = (event: SyntheticEvent<HTMLVideoElement, Event>) => {
    onLoadedData?.(event);
  };

  const handleCanPlay = (event: SyntheticEvent<HTMLVideoElement, Event>) => {
    const videoElement = videoRef.current;
    if (autoPlay && videoElement) {
      const playPromise = videoElement.play();
      if (playPromise?.catch) {
        playPromise.catch(() => {
          setShowPreview(Boolean(resolvedPoster));
        });
      }
    }
    onCanPlay?.(event);
  };

  const handlePlaying = (event: SyntheticEvent<HTMLVideoElement, Event>) => {
    setShowPreview(false);
    onPlaying?.(event);
  };

  const handleWaiting = (event: SyntheticEvent<HTMLVideoElement, Event>) => {
    setShowPreview(Boolean(resolvedPoster));
    onWaiting?.(event);
  };

  const handleStalled = (event: SyntheticEvent<HTMLVideoElement, Event>) => {
    setShowPreview(Boolean(resolvedPoster));
    onStalled?.(event);
  };

  const handleError = (event: SyntheticEvent<HTMLVideoElement, Event>) => {
    setShowPreview(Boolean(resolvedPoster));
    onError?.(event);
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      {resolvedPoster ? (
        <img
          aria-hidden
          alt={previewAlt}
          src={resolvedPoster}
          className={cn(
            "pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
            showPreview ? "opacity-100" : "opacity-0"
          )}
        />
      ) : null}
      <video
        ref={videoRef}
        className={cn(
          "relative z-10 h-full w-full object-cover transition-opacity duration-300",
          resolvedPoster && showPreview ? "opacity-0" : "opacity-100",
          className
        )}
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
    </div>
  );
}
