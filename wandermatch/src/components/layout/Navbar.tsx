import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold font-outfit bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent">
              WanderMatch
            </span>
          </Link>
          <div className="hidden md:flex gap-4">
            <Link href="/explore" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Explore
            </Link>
            {session && (
              <Link href="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Dashboard
              </Link>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-300">
                {session.user?.name}
              </span>
              <form action="/api/auth/signout" method="POST">
                <Button variant="outline" size="sm" type="submit" className="border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800">
                  Log out
                </Button>
              </form>
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
