import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, ExternalLink, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function RecentThreats({ threats, isLoading }) {
  const getThreatColor = (type) => {
    switch (type) {
      case 'phishing': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'malware': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'suspicious': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-green-500/20 text-green-300 border-green-500/30';
    }
  };

  const getThreatIcon = (type) => {
    switch (type) {
      case 'phishing':
      case 'malware':
      case 'suspicious':
        return AlertTriangle;
      default:
        return Shield;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Recent Threat Detections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-slate-800/50 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          Recent Threat Detections
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence>
          {threats.map((threat, index) => {
            const ThreatIcon = getThreatIcon(threat.threat_type);
            
            return (
              <motion.div
                key={threat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-800/50">
                      <ThreatIcon className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getThreatColor(threat.threat_type)}>
                          {threat.threat_type}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {threat.confidence_score}% confidence
                        </span>
                      </div>
                      <p className="text-sm text-white truncate">
                        {threat.url}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-400">
                          {format(new Date(threat.created_date), "MMM d, HH:mm")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                      {threat.user_response || 'Pending'}
                    </Badge>
                    <button className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors">
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                </div>
                
                {threat.threat_indicators && threat.threat_indicators.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-700/30">
                    <div className="flex flex-wrap gap-1">
                      {threat.threat_indicators.slice(0, 3).map((indicator, i) => (
                        <Badge key={i} variant="outline" className="text-xs border-slate-600 text-slate-400">
                          {indicator}
                        </Badge>
                      ))}
                      {threat.threat_indicators.length > 3 && (
                        <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                          +{threat.threat_indicators.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {threats.length === 0 && (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-slate-300 font-medium">All Clear!</p>
            <p className="text-slate-400 text-sm">No threats detected recently</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}