import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Shield, 
  Target, 
  BookOpen, 
  BarChart3,
  User,
  Settings
} from 'lucide-react';

export default function Navigation({ user }) {
  const navItems = [
    {
      path: '/dashboard',
      label: 'Security Dashboard',
      icon: Shield,
      description: 'Monitor your security status'
    },
    {
      path: '/training',
      label: 'Training Simulations',
      icon: Target,
      description: 'Practice phishing detection'
    },
    {
      path: '/learning',
      label: 'Learning Center',
      icon: BookOpen,
      description: 'Study security topics'
    },
    {
      path: '/analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'View your progress'
    }
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 z-50">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">SecureLearn</h1>
            <p className="text-slate-400 text-xs">Security Training Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4">
        <div className="mb-6">
          <h2 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">
            Navigation
          </h2>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                      isActive 
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className="text-xs opacity-75 truncate">{item.description}</div>
                  </div>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Security Status */}
        <div className="mb-6">
          <h2 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">
            Security Status
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Threat Level</span>
              <span className="text-green-400 font-medium">LOW</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Protection</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-medium">ACTIVE</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Training Score</span>
              <span className="text-blue-400 font-medium">85%</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-medium">Advanced Level</div>
            <div className="text-slate-400 text-xs truncate">
              {user?.email || 'user@example.com'}
            </div>
          </div>
          <Settings className="w-4 h-4 text-slate-400 hover:text-white transition-colors cursor-pointer" />
        </div>
      </div>
    </div>
  );
}