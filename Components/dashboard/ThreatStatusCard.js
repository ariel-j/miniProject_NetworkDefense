import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function ThreatStatusCard({ title, value, icon: Icon, status, trend, description }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'safe': return 'from-green-500 to-emerald-600';
      case 'warning': return 'from-yellow-500 to-orange-600';
      case 'danger': return 'from-red-500 to-pink-600';
      default: return 'from-blue-500 to-cyan-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'safe': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'danger': return AlertTriangle;
      default: return Shield;
    }
  };

  const StatusIcon = getStatusIcon(status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden bg-slate-900/50 backdrop-blur-xl border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getStatusColor(status)} opacity-5`} />
        
        {/* Animated pulse effect */}
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${getStatusColor(status)} opacity-10 rounded-full blur-3xl animate-pulse`} />
        
        <CardHeader className="relative z-10 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-300">{title}</CardTitle>
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-slate-400" />
              <StatusIcon className={`w-4 h-4 ${
                status === 'safe' ? 'text-green-400' :
                status === 'warning' ? 'text-yellow-400' :
                status === 'danger' ? 'text-red-400' :
                'text-blue-400'
              }`} />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative z-10 pt-0">
          <div className="space-y-3">
            <div className="text-2xl font-bold text-white">
              {value}
            </div>
            
            {trend && (
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-green-400 font-medium">{trend}</span>
                <span className="text-slate-400">vs last week</span>
              </div>
            )}
            
            {description && (
              <p className="text-xs text-slate-400 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}