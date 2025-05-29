import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { ThreatDetection } from "@/entities/ThreatDetection";
import { TrainingSimulation } from "@/entities/TrainingSimulation";
import { motion } from "framer-motion";
import { 
  Shield, 
  AlertTriangle, 
  Target, 
  TrendingUp,
  Activity,
  Globe,
  Users,
  Clock
} from "lucide-react";

import ThreatStatusCard from "../components/dashboard/ThreatStatusCard";
import RecentThreats from "../components/dashboard/RecentThreats";
import SecurityScore from "../components/dashboard/SecurityScore";

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [recentThreats, setRecentThreats] = useState([]);
  const [recentTraining, setRecentTraining] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load current user data
      const currentUser = await User.me();
      setUserData(currentUser);

      // Load recent threats
      const threats = await ThreatDetection.filter(
        { created_by: currentUser.email },
        '-created_date',
        10
      );
      setRecentThreats(threats);

      // Load recent training
      const training = await TrainingSimulation.filter(
        { created_by: currentUser.email },
        '-created_date',
        5
      );
      setRecentTraining(training);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  const getActiveThreats = () => {
    return recentThreats.filter(threat => 
      threat.threat_type !== 'safe' && 
      threat.user_response !== 'blocked'
    ).length;
  };

  const getTodayDetections = () => {
    const today = new Date().toDateString();
    return recentThreats.filter(threat => 
      new Date(threat.created_date).toDateString() === today
    ).length;
  };

  const getWeeklyTraining = () => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return recentTraining.filter(training => 
      new Date(training.created_date) > weekAgo
    ).length;
  };

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Security Dashboard
          </h1>
          <p className="text-slate-400">
            Monitor your security status and threat protection
          </p>
        </motion.div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ThreatStatusCard
            title="Protection Status"
            value="ACTIVE"
            icon={Shield}
            status="safe"
            description="Real-time protection enabled"
          />
          
          <ThreatStatusCard
            title="Active Threats"
            value={getActiveThreats()}
            icon={AlertTriangle}
            status={getActiveThreats() > 0 ? "warning" : "safe"}
            trend={getActiveThreats() === 0 ? "No new threats" : undefined}
            description="Threats requiring attention"
          />
          
          <ThreatStatusCard
            title="Today's Detections"
            value={getTodayDetections()}
            icon={Activity}
            status="info"
            trend="+12% accuracy"
            description="Threats detected today"
          />
          
          <ThreatStatusCard
            title="Weekly Training"
            value={getWeeklyTraining()}
            icon={Target}
            status="info"
            trend="2 sessions completed"
            description="Training modules this week"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Threats - Takes 2 columns */}
          <div className="lg:col-span-2">
            <RecentThreats 
              threats={recentThreats}
              isLoading={isLoading}
            />
          </div>

          {/* Sidebar Content */}
          <div className="space-y-6">
            <SecurityScore 
              userData={userData}
              recentActivity={recentTraining}
            />
            
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6"
            >
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full p-3 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 transition-all duration-300 text-left">
                  <div className="font-medium">Start Training Session</div>
                  <div className="text-xs text-blue-400">Practice phishing detection</div>
                </button>
                
                <button className="w-full p-3 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 transition-all duration-300 text-left">
                  <div className="font-medium">View Analytics</div>
                  <div className="text-xs text-purple-400">Check your progress</div>
                </button>
                
                <button className="w-full p-3 rounded-lg bg-green-600/20 border border-green-500/30 text-green-300 hover:bg-green-600/30 transition-all duration-300 text-left">
                  <div className="font-medium">Learning Center</div>
                  <div className="text-xs text-green-400">Study security topics</div>
                </button>
              </div>
            </motion.div>

            {/* System Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6"
            >
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                System Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-slate-300 text-sm">URL Scanner</span>
                  </div>
                  <span className="text-green-400 text-sm font-medium">Online</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-slate-300 text-sm">Threat Database</span>
                  </div>
                  <span className="text-green-400 text-sm font-medium">Updated</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-slate-300 text-sm">Training Engine</span>
                  </div>
                  <span className="text-blue-400 text-sm font-medium">Ready</span>
                </div>
                
                <div className="text-center pt-3 border-t border-slate-700/30">
                  <div className="flex items-center justify-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}