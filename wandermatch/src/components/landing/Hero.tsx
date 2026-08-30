"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

// Dynamically import p5.js wrapper to avoid SSR issues
import { NextReactP5Wrapper } from "@p5-wrapper/next";

function sketch(p5: any) {
  let particles: any[] = [];
  
  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: p5.random(p5.width),
        y: p5.random(p5.height),
        vx: p5.random(-0.5, 0.5),
        vy: p5.random(-0.5, 0.5),
      });
    }
  };

  p5.draw = () => {
    p5.clear();
    p5.stroke(147, 51, 234, 40); // Purple line
    
    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const d = p5.dist(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
        if (d < 150) {
          p5.line(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
        }
      }
    }

    // Move and draw particles
    p5.noStroke();
    p5.fill(147, 51, 234, 150);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      
      // Bounce off edges
      if (p.x < 0 || p.x > p5.width) p.vx *= -1;
      if (p.y < 0 || p.y > p5.height) p.vy *= -1;
      
      p5.circle(p.x, p.y, 4);
    });
  };

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };
}

export default function Hero() {
  return (
    <section className="relative w-full h-[90vh] flex items-center justify-center overflow-hidden">
      {/* p5.js Background */}
      <div className="absolute inset-0 z-0 opacity-50">
        <NextReactP5Wrapper sketch={sketch} />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold font-outfit mb-6 tracking-tight">
            Stop Herding Cats. <br />
            <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
              Start Travelling.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-2xl mx-auto">
            The social way to plan group trips. Build a shared itinerary, vote on activities, and stop arguing in group chats.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8 py-6 text-lg w-full sm:w-auto">
                Create a Trip
              </Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-lg w-full sm:w-auto border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                Find a Group
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
      
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-950 to-transparent z-10" />
    </section>
  );
}
