"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils"; 

export interface InteractiveNotificationCardProps {
  title: string;
  subtitle: string;
  imageUrl?: string;
  actionText: string;
  href?: string;
  onActionClick?: () => void;
  className?: string;
}

export const InteractiveNotificationCard = React.forwardRef<
  HTMLDivElement,
  InteractiveNotificationCardProps
>(
  (
    { title, subtitle, imageUrl, actionText, href, onActionClick, className },
    ref
  ) => {
    // --- 3D Tilt Animation Logic ---
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 15, stiffness: 150 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    const rotateX = useTransform(springY, [-0.5, 0.5], ["5deg", "-5deg"]);
    const rotateY = useTransform(springX, [-0.5, 0.5], ["-5deg", "5deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const { width, height, left, top } = rect;
      const mouseXVal = e.clientX - left;
      const mouseYVal = e.clientY - top;
      const xPct = mouseXVal / width - 0.5;
      const yPct = mouseYVal / height - 0.5;
      mouseX.set(xPct);
      mouseY.set(yPct);
    };

    const handleMouseLeave = () => {
      mouseX.set(0);
      mouseY.set(0);
    };

    return (
      <div style={{ perspective: "1000px" }} className={cn("w-full max-w-sm mx-auto md:max-w-none md:mx-0", className)}>
        <motion.div
          ref={ref}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          className={cn(
            "relative h-56 sm:h-64 w-full rounded-2xl bg-transparent shadow-2xl border border-border/30"
          )}
        >
          <div
            style={{
              transform: "translateZ(30px)",
              transformStyle: "preserve-3d",
            }}
            className="absolute inset-2 sm:inset-4 grid h-[calc(100%-1rem)] sm:h-[calc(100%-2rem)] w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] grid-rows-[1fr_auto] rounded-xl shadow-lg bg-card/80 overflow-hidden"
          >
            {/* Background Image (if any) or fallback gradient */}
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={`${title}, ${subtitle}`}
                className="absolute inset-0 h-full w-full rounded-xl object-cover opacity-80"
              />
            ) : (
              <div className="absolute inset-0 h-full w-full rounded-xl bg-gradient-to-br from-primary/20 to-cyan-500/10" />
            )}
            
            {/* Darkening overlay for better text contrast over the image */}
            <div className="absolute inset-0 h-full w-full rounded-xl bg-gradient-to-b from-black/40 via-black/20 to-black/80" />

            {/* Card Content (Header & Footer) */}
            <div className="relative flex flex-col justify-between rounded-xl p-4 sm:p-5 text-white h-full">
              
              {/* Header section with text and link */}
              <div className="flex items-start justify-between">
                <div className="max-w-[80%]">
                  <motion.h2 
                    style={{ transform: "translateZ(40px)" }}
                    className="text-lg sm:text-xl font-bold leading-tight"
                  >
                    {title}
                  </motion.h2>
                  <motion.p 
                    style={{ transform: "translateZ(20px)" }}
                    className="text-xs sm:text-sm font-light text-white/90 mt-1 line-clamp-3"
                  >
                    {subtitle}
                  </motion.p>
                </div>
                {href && (
                  <motion.a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, rotate: "2.5deg" }}
                    whileTap={{ scale: 0.9 }}
                    style={{ transform: "translateZ(40px)" }}
                    className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm ring-1 ring-inset ring-white/30 transition-colors hover:bg-white/30 shrink-0"
                  >
                    <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </motion.a>
                )}
              </div>

              {/* Footer Button */}
              {onActionClick && (
                <motion.button
                  onClick={onActionClick}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ transform: "translateZ(30px)" }}
                  className={cn(
                    "w-full mt-auto rounded-lg py-2.5 sm:py-3 text-sm sm:text-base text-center font-semibold text-white transition-colors",
                    "bg-primary/80 backdrop-blur-md ring-1 ring-inset ring-white/20 hover:bg-primary"
                  )}
                >
                  {actionText}
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }
);
InteractiveNotificationCard.displayName = "InteractiveNotificationCard";
