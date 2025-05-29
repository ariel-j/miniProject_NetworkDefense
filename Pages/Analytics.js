import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { ThreatDetection } from "@/entities/ThreatDetection";
import { TrainingSimulation } from "@/entities/TrainingSimulation";
import { motion } from "framer-motion";
import { TrendingUp, BarChart3, ShieldCheck, Target, PieChart, CalendarDays, AlertOctagon, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Pie, Cell } from 'recharts';
import { format, subDays, parseISO } from 'date-fns';

const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"]; // blue, green, amber, pink, violet

export default function Analytics() {
  const [userData, setUserData] = useState(null);
  const [threatHistory, setThreatHistory] = useState([]);
  const [trainingHistory, setTrainingHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setUserData(user);

      const threats = await ThreatDetection.filter({ created_by: user.email }, "-created_date");
      setThreatHistory(threats);
      
      const trainings = await TrainingSimulation.filter({ created_by: user.email }, "-created_date");
      setTrainingHistory(trainings);

    } catch (error) {
      console.error("Error loading analytics data:", error);
    }
    setIsLoading(false);
  };

  // --- Data Processing Functions ---
  const getOverallScore = () => {
    if (!userData || userData.total_simulations === 0) return 0;
    const detectionRate = (userData.successful_detections / userData.total_simulations) * 100;
    return Math.min(Math.round(detectionRate), 100);
  };

  const getThreatDetectionAccuracy = () => {
    if (threatHistory.length === 0) return { rate: 0, correct: 0, total: 0 };
    // Assuming 'user_response' of 'blocked' or 'reported' is correct for non-safe threats
    const correctDetections = threatHistory.filter(t => 
      (t.threat_type !== 'safe' && (t.user_response === 'blocked' || t.user_response === 'reported')) ||
      (t.threat_type === 'safe' && t.user_response === 'proceeded')
    ).length;
    return {
      rate: (correctDetections / threatHistory.length) * 100,
      correct: correctDetections,
      total: threatHistory.length
    };
  };

  const getTrainingSuccessRate = () => {
    if (trainingHistory.length === 0) return { rate: 0, successful: 0, total: 0 };
    const successfulTrainings = trainingHistory.filter(t => t.success).length;
    return {
      rate: (successfulTrainings / trainingHistory.length) * 100,
      successful: successfulTrainings,
      total: trainingHistory.length
    };
  };
  
  const getProgressOverTime = (days = 30) => {
    const data = [];
    for (let i = days -1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const formattedDate = format(date, "MMM d");
      
      const dailySimulations = trainingHistory.filter(
        t => format(parseISO(t.created_date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
      );
      
      const dailySuccessRate = dailySimulations.length > 0
        ? (dailySimulations.filter(s => s.success).length / dailySimulations.length) * 100
        : 0; // or null to show gaps

      data.push({ date: formattedDate, successRate: parseFloat(dailySuccessRate.toFixed(1)) });
    }
    return data;
  };

  const getThreatTypesDistribution = () => {
    const distribution = threatHistory.reduce((acc, threat) => {
      acc[threat.threat_type] = (acc[threat.threat_type] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  };

  const getVulnerabilityAreas = () => {
    // Based on failed training simulations
    const failedSimulations = trainingHistory.filter(t => !t.success);
    const areas = failedSimulations.reduce((acc, sim) => {
      acc[sim.simulation_type] = (acc[sim.simulation_type] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(areas)
      .sort(([,a], [,b]) => b-a)
      .map(([name, value]) => ({ name: name.replace(/_/g, " ").toUpperCase(), value }));
  };

  const StatCard = ({ title, value, icon: Icon, trend, unit = "", colorClass = "text-blue-400" }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">{title}</CardTitle>
          <Icon className={`h-5 w-5 ${colorClass}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${colorClass}`}>{value}{unit}</div>
          {trend && <p className="text-xs text-slate-400">{trend}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <BarChart3 className="w-16 h-16 text-blue-400 animate-pulse" />
      </div>
    );
  }

  const overallScore = getOverallScore();
  const threatAccuracy = getThreatDetectionAccuracy();
  const trainingSuccess = getTrainingSuccessRate();
  const progressData = getProgressOverTime();
  const threatDistribution = getThreatTypesDistribution();
  const vulnerabilities = getVulnerabilityAreas();

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-400" />
            Security Analytics
          </h1>
          <p className="text-slate-400">
            Track your security performance and identify areas for improvement.
          </p>
        </motion.div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Overall Security Score" value={overallScore} unit="%" icon={ShieldCheck} colorClass="text-green-400" trend={`${userData?.current_streak || 0} day streak`} />
          <StatCard title="Threat Detection Accuracy" value={threatAccuracy.rate.toFixed(1)} unit="%" icon={Activity} colorClass="text-red-400" trend={`${threatAccuracy.correct}/${threatAccuracy.total} correct`} />
          <StatCard title="Training Success Rate" value={trainingSuccess.rate.toFixed(1)} unit="%" icon={Target} colorClass="text-yellow-400" trend={`${trainingSuccess.successful}/${trainingSuccess.total} successful`} />
          <StatCard title="Total Trainings Completed" value={userData?.total_simulations || 0} icon={CalendarDays} colorClass="text-purple-400" />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Progress Over Time */}
          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <LineChart className="h-5 w-5 text-blue-400" /> Training Progress (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} stroke="#64748b" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis unit="%" tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(30,41,59,0.8)', border: '1px solid #475569', color: '#e2e8f0' }} />
                  <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                  <Line type="monotone" dataKey="successRate" name="Success Rate" stroke={CHART_COLORS[0]} strokeWidth={2} dot={{ r: 4, fill: CHART_COLORS[0] }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Threat Types Distribution */}
          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <PieChart className="h-5 w-5 text-green-400" /> Detected Threat Types
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={threatDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {threatDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(30,41,59,0.8)', border: '1px solid #475569', color: '#e2e8f0' }} />
                  <Legend wrapperStyle={{ color: '#cbd5e1', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Vulnerability Areas */}
        {vulnerabilities.length > 0 && (
           <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertOctagon className="h-5 w-5 text-orange-400" /> Top Vulnerability Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {vulnerabilities.slice(0,5).map((area, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-slate-300">{area.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-orange-300 font-semibold">{area.value} failed</span>
                      <div className="w-32 h-2 bg-slate-800 rounded-full">
                        <div 
                          className="h-2 bg-orange-500 rounded-full"
                          style={{ width: `${(area.value / Math.max(...vulnerabilities.map(v=>v.value),1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}