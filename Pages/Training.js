import React, { useState, useEffect } from "react";
import { TrainingSimulation } from "@/entities/TrainingSimulation";
import { User } from "@/entities/User";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Target, 
  Play, 
  Trophy,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Training() {
  const [currentSimulation, setCurrentSimulation] = useState(null);
  const [simulationHistory, setSimulationHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [userData, setUserData] = useState(null);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await User.me();
      setUserData(user);
      
      const history = await TrainingSimulation.filter(
        { created_by: user.email },
        '-created_date',
        10
      );
      setSimulationHistory(history);
    } catch (error) {
      console.error("Error loading training data:", error);
    }
  };

  const generateNewSimulation = async (difficulty = 'medium') => {
    setIsLoading(true);
    try {
      // Simulate generating a new phishing scenario
      const scenarios = {
        easy: [
          {
            type: 'email_phishing',
            title: 'Suspicious Bank Email',
            description: 'You received an email claiming to be from your bank asking you to verify your account by clicking a link.',
            content: 'Dear Customer, We have detected unusual activity on your account. Please click here to verify your identity immediately: http://secure-bank-verify.com/login',
            correct_action: 'Do not click the link. Contact the bank directly.',
            indicators: ['Suspicious URL', 'Urgent language', 'Generic greeting']
          }
        ],
        medium: [
          {
            type: 'fake_website',
            title: 'Fake Microsoft Login',
            description: 'You were redirected to what appears to be a Microsoft login page, but something seems off.',
            content: 'This is a fake Microsoft Office 365 login page designed to steal credentials. URL: microsoff-office365.net/login',
            correct_action: 'Do not enter credentials. Check the URL carefully.',
            indicators: ['Misspelled domain', 'No HTTPS', 'Poor page quality']
          }
        ],
        hard: [
          {
            type: 'social_engineering',
            title: 'CEO Impersonation',
            description: 'You received an urgent email from someone claiming to be your CEO requesting immediate wire transfer.',
            content: 'From: CEO@company.com\nSubject: URGENT - Confidential Wire Transfer\n\nI need you to process an immediate wire transfer for $50,000 to this account for a confidential acquisition. Please handle this discretely.',
            correct_action: 'Verify through official channels before taking action.',
            indicators: ['Urgency tactics', 'Request for money', 'Bypassing procedures']
          }
        ]
      };

      const selectedScenarios = scenarios[difficulty] || scenarios.medium;
      const scenario = selectedScenarios[Math.floor(Math.random() * selectedScenarios.length)];
      
      setCurrentSimulation({
        simulation_type: scenario.type,
        difficulty_level: difficulty,
        scenario_title: scenario.title,
        scenario_description: scenario.description,
        content: scenario.content,
        correct_action: scenario.correct_action,
        threat_indicators: scenario.indicators
      });
      
      setStartTime(Date.now());
      setShowResults(false);
    } catch (error) {
      console.error("Error generating simulation:", error);
    }
    setIsLoading(false);
  };

  const handleUserResponse = async (action) => {
    if (!currentSimulation || !startTime) return;
    
    const responseTime = (Date.now() - startTime) / 1000;
    const isCorrect = action.toLowerCase().includes('block') || 
                     action.toLowerCase().includes('report') || 
                     action.toLowerCase().includes('verify');
    
    const simulation = {
      ...currentSimulation,
      user_action: action,
      success: isCorrect,
      response_time: responseTime,
      feedback_given: isCorrect 
        ? "Excellent! You correctly identified this as a threat."
        : "This was a phishing attempt. Always verify suspicious requests through official channels.",
      learning_points: currentSimulation.threat_indicators || []
    };

    try {
      await TrainingSimulation.create(simulation);
      
      // Update user stats
      if (userData) {
        const updates = {
          total_simulations: (userData.total_simulations || 0) + 1,
          successful_detections: isCorrect ? 
            (userData.successful_detections || 0) + 1 : 
            (userData.successful_detections || 0),
          failed_detections: !isCorrect ? 
            (userData.failed_detections || 0) + 1 : 
            (userData.failed_detections || 0),
          current_streak: isCorrect ? 
            (userData.current_streak || 0) + 1 : 0,
          best_streak: isCorrect && (userData.current_streak || 0) + 1 > (userData.best_streak || 0) ?
            (userData.current_streak || 0) + 1 : (userData.best_streak || 0),
          last_training_date: new Date().toISOString()
        };
        
        await User.updateMyUserData(updates);
        setUserData({...userData, ...updates});
      }
      
      setShowResults(true);
      loadData();
    } catch (error) {
      console.error("Error saving simulation:", error);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'hard': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <Target className="w-8 h-8 text-blue-400" />
            Phishing Training
          </h1>
          <p className="text-slate-400">
            Practice identifying and responding to phishing attacks in a safe environment
          </p>
        </motion.div>

        {/* Training Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {userData?.current_streak || 0}
              </div>
              <div className="text-sm text-slate-400">Current Streak</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {userData?.successful_detections || 0}
              </div>
              <div className="text-sm text-slate-400">Threats Detected</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {userData?.total_simulations || 0}
              </div>
              <div className="text-sm text-slate-400">Total Training</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
            <CardContent className="p-6 text-center">
              <Shield className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {userData?.total_simulations > 0 ? 
                  Math.round(((userData?.successful_detections || 0) / userData.total_simulations) * 100) : 0}%
              </div>
              <div className="text-sm text-slate-400">Success Rate</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Training Simulation */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {!currentSimulation ? (
                <motion.div
                  key="start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Play className="w-5 h-5 text-green-400" />
                        Start New Training Session
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-slate-300">
                        Choose your training difficulty and start practicing phishing detection skills.
                      </p>
                      
                      <div className="grid gap-4">
                        <Button
                          onClick={() => generateNewSimulation('easy')}
                          disabled={isLoading}
                          className="p-6 h-auto bg-green-600/20 border border-green-500/30 hover:bg-green-600/30 text-green-300"
                        >
                          <div className="text-left w-full">
                            <div className="font-semibold">Easy Training</div>
                            <div className="text-sm opacity-75">Basic phishing attempts with obvious red flags</div>
                          </div>
                        </Button>
                        
                        <Button
                          onClick={() => generateNewSimulation('medium')}
                          disabled={isLoading}
                          className="p-6 h-auto bg-yellow-600/20 border border-yellow-500/30 hover:bg-yellow-600/30 text-yellow-300"
                        >
                          <div className="text-left w-full">
                            <div className="font-semibold">Medium Training</div>
                            <div className="text-sm opacity-75">Moderate difficulty with subtle indicators</div>
                          </div>
                        </Button>
                        
                        <Button
                          onClick={() => generateNewSimulation('hard')}
                          disabled={isLoading}
                          className="p-6 h-auto bg-red-600/20 border border-red-500/30 hover:bg-red-600/30 text-red-300"
                        >
                          <div className="text-left w-full">
                            <div className="font-semibold">Advanced Training</div>
                            <div className="text-sm opacity-75">Sophisticated attacks requiring careful analysis</div>
                          </div>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="simulation"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-orange-400" />
                          {currentSimulation.scenario_title}
                        </CardTitle>
                        <Badge className={getDifficultyColor(currentSimulation.difficulty_level)}>
                          {currentSimulation.difficulty_level}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                        <p className="text-slate-300">{currentSimulation.scenario_description}</p>
                      </div>
                      
                      <div className="p-4 bg-slate-800/30 rounded-lg border border-red-500/30">
                        <h4 className="font-semibold text-red-300 mb-2">Scenario Content:</h4>
                        <p className="text-slate-300 whitespace-pre-wrap font-mono text-sm">
                          {currentSimulation.content}
                        </p>
                      </div>
                      
                      {!showResults && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-white">How would you respond?</h4>
                          <div className="grid gap-3">
                            <Button
                              onClick={() => handleUserResponse('Block and Report')}
                              className="p-4 h-auto bg-green-600/20 border border-green-500/30 hover:bg-green-600/30 text-green-300 text-left"
                            >
                              🚫 Block and report as phishing
                            </Button>
                            
                            <Button
                              onClick={() => handleUserResponse('Verify Through Official Channels')}
                              className="p-4 h-auto bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 text-blue-300 text-left"
                            >
                              📞 Verify through official channels
                            </Button>
                            
                            <Button
                              onClick={() => handleUserResponse('Click Link')}
                              className="p-4 h-auto bg-red-600/20 border border-red-500/30 hover:bg-red-600/30 text-red-300 text-left"
                            >
                              🔗 Click the link/follow instructions
                            </Button>
                            
                            <Button
                              onClick={() => handleUserResponse('Ignore')}
                              className="p-4 h-auto bg-gray-600/20 border border-gray-500/30 hover:bg-gray-600/30 text-gray-300 text-left"
                            >
                              👀 Ignore the message
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {showResults && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4"
                        >
                          <div className={`p-4 rounded-lg border ${
                            simulationHistory[0]?.success 
                              ? 'bg-green-600/20 border-green-500/30' 
                              : 'bg-red-600/20 border-red-500/30'
                          }`}>
                            <div className="flex items-center gap-2 mb-2">
                              {simulationHistory[0]?.success ? (
                                <CheckCircle className="w-5 h-5 text-green-400" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-400" />
                              )}
                              <h4 className={`font-semibold ${
                                simulationHistory[0]?.success ? 'text-green-300' : 'text-red-300'
                              }`}>
                                {simulationHistory[0]?.success ? 'Correct!' : 'Incorrect'}
                              </h4>
                            </div>
                            <p className="text-slate-300">{simulationHistory[0]?.feedback_given}</p>
                          </div>
                          
                          <div className="p-4 bg-slate-800/30 rounded-lg">
                            <h4 className="font-semibold text-blue-300 mb-2">Key Indicators:</h4>
                            <div className="flex flex-wrap gap-2">
                              {currentSimulation.threat_indicators?.map((indicator, i) => (
                                <Badge key={i} variant="outline" className="border-blue-500/30 text-blue-400">
                                  {indicator}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex gap-3">
                            <Button
                              onClick={() => {
                                setCurrentSimulation(null);
                                setShowResults(false);
                              }}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              New Training
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Training History */}
          <div className="space-y-6">
            <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  Recent Training
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {simulationHistory.slice(0, 5).map((training, index) => (
                  <div
                    key={training.id}
                    className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getDifficultyColor(training.difficulty_level)}>
                        {training.difficulty_level}
                      </Badge>
                      {training.success ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-white truncate">
                      {training.scenario_title}
                    </p>
                    <p className="text-xs text-slate-400">
                      {training.response_time}s response time
                    </p>
                  </div>
                ))}
                
                {simulationHistory.length === 0 && (
                  <div className="text-center py-4">
                    <Target className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No training history yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}