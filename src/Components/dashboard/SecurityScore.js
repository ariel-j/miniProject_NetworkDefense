import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Shield, TrendingUp, Target } from "lucide-react";
import { motion } from "framer-motion";

export default function SecurityScore({ userData, recentActivity }) {
  const getOverallScore = () => {
    if (!userData || userData.total_simulations === 0) return 0;
    const detectionRate = (userData.successful_detections / userData.total_simulations) * 100;
    return Math.min(Math.round(detectionRate), 100);
  };

  const getScoreStatus = (score) => {
    if (score >= 90) return { status: 'Excellent', color: 'text-green-400', bgColor: 'bg-green-500/20' };
    if (score >= 75) return { status: 'Good', color: 'text-blue-400', bgColor: 'bg-blue-500/20' };
    if (score >= 60) return { status: 'Fair', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' };
    return { status: 'Needs Improvement', color: 'text-red-400', bgColor: 'bg-red-500/20' };
  };

  const score = getOverallScore();
  const scoreStatus = getScoreStatus(score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Security Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Display */}
          <div className="text-center">
            <div className={`text-4xl font-bold ${scoreStatus.color} mb-2`}>
              {isNaN(score) ? 'NaN' : score}%
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${scoreStatus.bgColor} ${scoreStatus.color}`}>
              {scoreStatus.status}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-400">
              <span>Progress</span>
              <span>{isNaN(score) ? 'NaN' : score}/100</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <motion.div
                className={`h-2 rounded-full ${
                  score >= 90 ? 'bg-green-500' :
                  score >= 75 ? 'bg-blue-500' :
                  score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${isNaN(score) ? 0 : score}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-slate-300">Threats Detected</span>
              </div>
              <span className="text-blue-400 font-medium">
                {userData?.successful_detections || 0}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm text-slate-300">Current Streak</span>
              </div>
              <span className="text-green-400 font-medium">
                {userData?.current_streak || 0}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Security Level</span>
              <span className="text-blue-400 font-medium text-sm">Beginner</span>
            </div>
          </div>

          {/* Recent Activity */}
          {recentActivity && recentActivity.length > 0 && (
            <div className="pt-4 border-t border-slate-700/30">
              <h4 className="text-sm font-medium text-slate-300 mb-2">Recent Training</h4>
              <div className="space-y-2">
                {recentActivity.slice(0, 3).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 truncate">
                      {activity.scenario_title || `Training ${activity.id}`}
                    </span>
                    <span className={activity.success ? 'text-green-400' : 'text-red-400'}>
                      {activity.success ? '✓' : '✗'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}