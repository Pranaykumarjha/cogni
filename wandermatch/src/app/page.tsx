import Hero from "@/components/landing/Hero";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Globe, Users, Vote } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <Hero />
      
      {/* Features Section */}
      <section className="w-full py-24 bg-slate-950 relative z-10 border-t border-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-outfit mb-4">Plan Better, Together</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              WanderMatch makes travel planning social. Stop using spreadsheets and start collaborating in real-time.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:bg-slate-900 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Live Itinerary</h3>
              <p className="text-slate-400">
                Edit your trip plan collaboratively. See where your friends are and what they're adding in real-time.
              </p>
            </div>
            
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:bg-slate-900 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-6 text-cyan-400">
                <Vote className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Propose & Vote</h3>
              <p className="text-slate-400">
                Can't decide on dinner? Propose ideas and let the group vote. The best ideas automatically get added to the plan.
              </p>
            </div>
            
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:bg-slate-900 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-6 text-amber-400">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Find Travel Mates</h3>
              <p className="text-slate-400">
                Travelling solo? Match with compatible groups based on your travel style, budget, and interests.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-24 bg-gradient-to-b from-slate-950 to-purple-950/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold font-outfit mb-6">Ready for your next adventure?</h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Create a trip for free and invite your friends in seconds.
          </p>
          <Link href="/trip/create">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg rounded-full">
              Start Planning Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
