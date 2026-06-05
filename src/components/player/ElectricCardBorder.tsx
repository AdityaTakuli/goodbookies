import { useEffect, useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ElectricCardBorderProps = {
  children: ReactNode;
  className?: string;
  captureId?: string;
};

const LITE_MQ = "(max-width: 767px), (prefers-reduced-motion: reduce)";

function useLiteElectricBorder() {
  const [lite, setLite] = useState(
    () => typeof window !== "undefined" && window.matchMedia(LITE_MQ).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(LITE_MQ);
    const update = () => setLite(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return lite;
}

export function ElectricCardBorder({ children, className, captureId }: ElectricCardBorderProps) {
  const filterId = `electric-border-${useId().replace(/:/g, "")}`;
  const lite = useLiteElectricBorder();

  return (
    <div
      id={captureId}
      className={cn(
        "electric-player-card mx-auto w-full max-w-[min(100%,17.5rem)] sm:max-w-[18.75rem] md:max-w-[20rem]",
        lite && "electric-player-card--lite",
        className,
      )}
      style={lite ? undefined : { ["--electric-filter" as string]: `url(#${filterId})` }}
    >
      {!lite && (
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
          </defs>
        </svg>
      )}

      <div className="electric-player-card__frame">
        <div className="electric-player-card__effects" aria-hidden>
          <div className="electric-player-card__inner">
            <div className="electric-player-card__border-outer">
              <div className="electric-player-card__border-main" />
            </div>
            <div className="electric-player-card__glow-1" />
            {!lite && <div className="electric-player-card__glow-2" />}
          </div>
          {!lite && (
            <>
              <div className="electric-player-card__overlay-1" />
              <div className="electric-player-card__overlay-2" />
            </>
          )}
          <div className="electric-player-card__bg-glow" />
        </div>
        <div className="electric-player-card__content">{children}</div>
      </div>
    </div>
  );
}
