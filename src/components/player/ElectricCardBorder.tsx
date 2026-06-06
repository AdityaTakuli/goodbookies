import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ElectricCardBorderProps = {
  children: ReactNode;
  className?: string;
  captureId?: string;
};

export function ElectricCardBorder({ children, className, captureId }: ElectricCardBorderProps) {
  const uid = useId().replace(/:/g, "");
  const filterId = `electric-border-${uid}`;
  const mobileFilterId = `electric-border-mobile-${uid}`;

  return (
    <div
      id={captureId}
      className={cn(
        "electric-player-card mx-auto w-full max-w-[min(100%,17.5rem)] sm:max-w-[18.75rem] md:max-w-[20rem]",
        className,
      )}
      style={{ ["--electric-filter" as string]: `url(#${filterId})` }}
    >
      <svg className="electric-player-card__svg" aria-hidden>
        <defs>
          <filter
            id={filterId}
            colorInterpolationFilters="sRGB"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="4" result="noise1" seed="1" />
            <feOffset in="noise1" dx="0" dy="0" result="offsetNoise1">
              <animate attributeName="dy" values="700; 0" dur="6s" repeatCount="indefinite" calcMode="linear" />
            </feOffset>
            <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="4" result="noise2" seed="1" />
            <feOffset in="noise2" dx="0" dy="0" result="offsetNoise2">
              <animate attributeName="dy" values="0; -700" dur="6s" repeatCount="indefinite" calcMode="linear" />
            </feOffset>
            <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="4" result="noise3" seed="2" />
            <feOffset in="noise3" dx="0" dy="0" result="offsetNoise3">
              <animate attributeName="dx" values="490; 0" dur="6s" repeatCount="indefinite" calcMode="linear" />
            </feOffset>
            <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="4" result="noise4" seed="2" />
            <feOffset in="noise4" dx="0" dy="0" result="offsetNoise4">
              <animate attributeName="dx" values="0; -490" dur="6s" repeatCount="indefinite" calcMode="linear" />
            </feOffset>
            <feComposite in="offsetNoise1" in2="offsetNoise2" result="part1" />
            <feComposite in="offsetNoise3" in2="offsetNoise4" result="part2" />
            <feBlend in="part1" in2="part2" mode="color-dodge" result="combinedNoise" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="combinedNoise"
              scale="18"
              xChannelSelector="R"
              yChannelSelector="B"
            />
          </filter>
          {/* Safari/iOS: feDisplacementMap on HTML divs fails; this simpler filter targets an SVG stroke */}
          <filter
            id={mobileFilterId}
            colorInterpolationFilters="sRGB"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feTurbulence type="turbulence" baseFrequency="0.035" numOctaves="3" result="noise1" seed="4">
              <animate attributeName="seed" values="4;9;4" dur="3s" repeatCount="indefinite" />
            </feTurbulence>
            <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="noise2" seed="7">
              <animate attributeName="baseFrequency" values="0.05;0.09;0.05" dur="2.5s" repeatCount="indefinite" />
            </feTurbulence>
            <feBlend in="noise1" in2="noise2" mode="screen" result="combinedNoise" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="combinedNoise"
              scale="30"
              xChannelSelector="R"
              yChannelSelector="B"
            />
          </filter>
        </defs>
      </svg>

      <div className="electric-player-card__frame">
        <div className="electric-player-card__effects" aria-hidden>
          <div className="electric-player-card__inner">
            <div className="electric-player-card__border-outer">
              <div className="electric-player-card__border-main" />
            </div>
            <svg
              className="electric-player-card__lightning-border"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden
            >
              <rect
                x="1.8"
                y="1.8"
                width="96.4"
                height="96.4"
                rx="8.5"
                ry="8.5"
                fill="none"
                stroke="var(--electric-border-color)"
                strokeWidth="1.4"
                vectorEffect="non-scaling-stroke"
                filter={`url(#${mobileFilterId})`}
              />
            </svg>
            <div className="electric-player-card__glow-1" />
            <div className="electric-player-card__glow-2" />
          </div>
          <div className="electric-player-card__overlay-1" />
          <div className="electric-player-card__overlay-2" />
          <div className="electric-player-card__bg-glow" />
          <div className="electric-player-card__ambient" />
        </div>
        <div className="electric-player-card__content">{children}</div>
      </div>
    </div>
  );
}
