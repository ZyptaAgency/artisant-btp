"use client";

import { useEffect, useRef } from "react";

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    const STAR_COUNT = 200;
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.3,
      opacity: Math.random(),
      speed: Math.random() * 0.3 + 0.05,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
    }));

    const SHOOTING_STAR_INTERVAL = 4000;
    let lastShootingStar = 0;
    let shootingStars: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
    }[] = [];

    function spawnShootingStar(now: number) {
      if (now - lastShootingStar > SHOOTING_STAR_INTERVAL && Math.random() > 0.5) {
        lastShootingStar = now;
        shootingStars.push({
          x: Math.random() * width * 0.8,
          y: Math.random() * height * 0.3,
          vx: 4 + Math.random() * 4,
          vy: 2 + Math.random() * 2,
          life: 0,
          maxLife: 40 + Math.random() * 30,
        });
      }
    }

    function draw(now: number) {
      ctx!.clearRect(0, 0, width, height);

      for (const star of stars) {
        star.opacity += star.twinkleSpeed;
        if (star.opacity > 1 || star.opacity < 0.1) star.twinkleSpeed *= -1;
        star.opacity = Math.max(0.1, Math.min(1, star.opacity));

        ctx!.beginPath();
        ctx!.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255, 255, 255, ${star.opacity * 0.8})`;
        ctx!.fill();
      }

      spawnShootingStar(now);

      shootingStars = shootingStars.filter((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.life++;

        const progress = s.life / s.maxLife;
        const alpha = progress < 0.5 ? progress * 2 : (1 - progress) * 2;

        const tailLength = 30;
        const gradient = ctx!.createLinearGradient(
          s.x,
          s.y,
          s.x - s.vx * tailLength * 0.3,
          s.y - s.vy * tailLength * 0.3
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.9})`);
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx!.beginPath();
        ctx!.moveTo(s.x, s.y);
        ctx!.lineTo(s.x - s.vx * tailLength * 0.3, s.y - s.vy * tailLength * 0.3);
        ctx!.strokeStyle = gradient;
        ctx!.lineWidth = 1.5;
        ctx!.stroke();

        return s.life < s.maxLife;
      });

      animationId = requestAnimationFrame(draw);
    }

    animationId = requestAnimationFrame(draw);

    function handleResize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width;
      canvas!.height = height;
    }
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ background: "transparent" }}
    />
  );
}
