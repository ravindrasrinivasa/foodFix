import { categories, foodItems } from '../data';
import { SearchBar } from './SearchBar';
import { FoodGrid } from './FoodGrid';
import { SupportChat } from './SupportChat';
import { LogOut, User } from 'lucide-react';

interface FoodFixMainProps {
  userEmail?: string;
  onLogout: () => void;
}

export const FoodFixMain = ({ userEmail, onLogout }: FoodFixMainProps) => (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <nav className="bg-white border-b border-slate-100 py-4 px-8 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-orange-500 tracking-tight">Food<span className="text-slate-800">Fix</span></h1>
        
        {/* User profile & Sign out */}
        <div className="flex items-center gap-4">
          {userEmail && (
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <User className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-semibold text-slate-600 max-w-40 truncate">{userEmail}</span>
            </div>
          )}
          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-2xl shadow-sm transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      <header className="py-12 bg-orange-50 text-center px-4">
        <h2 className="text-4xl font-bold text-slate-900 mb-6">Hungry? We've got you covered.</h2>
        <SearchBar />
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8">
        <section className="mb-12">
          <div className="flex gap-6 overflow-x-auto pb-4 justify-between">
            {categories.map(c => (
              <button key={c.id} className="flex flex-col items-center gap-2 min-w-20 bg-white p-4 rounded-2xl border border-slate-100 hover:border-orange-200 transition">
                <span className="text-3xl">{c.icon}</span>
                <span className="font-semibold text-xs text-slate-600">{c.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-slate-900 mb-6">Popular near you</h3>
          <FoodGrid items={foodItems} />
        </section>
      </main>
      
      <SupportChat />
    </div>
);
