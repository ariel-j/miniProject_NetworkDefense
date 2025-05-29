
import React, { useState, useEffect } from "react";
import { LearningModule } from "@/entities/LearningModule";
import { User } from "@/entities/User";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, CheckCircle, XCircle, Lightbulb, Brain, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from 'react-markdown';

export default function Learning() {
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [completedModules, setCompletedModules] = useState([]); // Track completed modules by ID

  useEffect(() => {
    loadLearningData();
  }, []);

  const loadLearningData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setUserData(user);
      // In a real app, completedModules would be fetched from user data or a separate entity
      // For now, we'll simulate it or leave it empty
      setCompletedModules(user.completed_learning_modules || []);

      const fetchedModules = await LearningModule.filter({ is_published: true }, "-difficulty");
      setModules(fetchedModules);
    } catch (error) {
      console.error("Error loading learning data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleModuleSelect = (module) => {
    setSelectedModule(module);
    setCurrentQuizQuestion(0);
    setQuizAnswers(Array(module.quiz_questions?.length || 0).fill(null));
    setShowQuizResults(false);
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = answerIndex;
    setQuizAnswers(newAnswers);
  };

  const handleSubmitQuiz = async () => {
    setShowQuizResults(true);
    // Mark module as complete if quiz is passed (e.g., >70% correct)
    const correctAnswers = selectedModule.quiz_questions.filter(
      (q, i) => quizAnswers[i] === q.correct_answer
    ).length;
    const totalQuestions = selectedModule.quiz_questions.length;
    if (totalQuestions > 0 && (correctAnswers / totalQuestions) >= 0.7) {
      if (!completedModules.includes(selectedModule.id)) {
        const updatedCompletedModules = [...completedModules, selectedModule.id];
        setCompletedModules(updatedCompletedModules);
        // Persist this change to User entity
        try {
          await User.updateMyUserData({ completed_learning_modules: updatedCompletedModules });
        } catch (error) {
          console.error("Error updating user completed modules:", error);
        }
      }
    }
  };
  
  const calculateQuizScore = () => {
    if (!selectedModule || !selectedModule.quiz_questions) return 0;
    const correctAnswers = selectedModule.quiz_questions.filter(
      (q, i) => quizAnswers[i] === q.correct_answer
    ).length;
    return (correctAnswers / selectedModule.quiz_questions.length) * 100;
  };

  const categorizedModules = modules.reduce((acc, module) => {
    (acc[module.category] = acc[module.category] || []).push(module);
    return acc;
  }, {});

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500/20 text-green-300 border-green-500/30";
      case "intermediate": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "advanced": return "bg-red-500/20 text-red-300 border-red-500/30";
      default: return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <Brain className="w-16 h-16 text-blue-400 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-400" />
            Learning Center
          </h1>
          <p className="text-slate-400">
            Expand your knowledge on cybersecurity and phishing prevention.
          </p>
        </motion.div>

        {!selectedModule ? (
          <div className="space-y-8">
            {Object.entries(categorizedModules).map(([category, categoryModules]) => (
              <div key={category}>
                <h2 className="text-2xl font-semibold text-white mb-4 capitalize">
                  {category.replace(/_/g, " ")}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryModules.map((module) => (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                    >
                      <Card 
                        className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50 hover:border-blue-500/50 cursor-pointer h-full flex flex-col"
                        onClick={() => handleModuleSelect(module)}
                      >
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg text-white">{module.title}</CardTitle>
                            <Badge className={getDifficultyBadge(module.difficulty)}>
                              {module.difficulty}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <p className="text-sm text-slate-400 line-clamp-3">
                            {module.content.substring(0,150)}{module.content.length > 150 ? '...' : ''}
                          </p>
                        </CardContent>
                        <CardFooter className="pt-4 border-t border-slate-800/50 flex justify-between items-center">
                           <span className="text-xs text-slate-500">{module.completion_time} min read</span>
                           {completedModules.includes(module.id) && (
                            <div className="flex items-center gap-1 text-green-400">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-xs">Completed</span>
                            </div>
                          )}
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
              <CardHeader className="border-b border-slate-800/50">
                <div className="flex justify-between items-center">
                  <div>
                    <Button variant="ghost" onClick={() => setSelectedModule(null)} className="mb-2 text-blue-400 hover:text-blue-300 hover:bg-slate-800/50 px-0">
                      &larr; Back to Modules
                    </Button>
                    <CardTitle className="text-2xl text-white">{selectedModule.title}</CardTitle>
                  </div>
                  <Badge className={getDifficultyBadge(selectedModule.difficulty)}>
                    {selectedModule.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs defaultValue="content" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 mb-6 bg-slate-800/50">
                    <TabsTrigger value="content" className="data-[state=active]:bg-blue-600/30 data-[state=active]:text-blue-300 text-slate-300">Module Content</TabsTrigger>
                    <TabsTrigger value="keypoints" className="data-[state=active]:bg-blue-600/30 data-[state=active]:text-blue-300 text-slate-300">Key Points</TabsTrigger>
                    {selectedModule.quiz_questions && selectedModule.quiz_questions.length > 0 && (
                      <TabsTrigger value="quiz" className="data-[state=active]:bg-blue-600/30 data-[state=active]:text-blue-300 text-slate-300">Quiz</TabsTrigger>
                    )}
                  </TabsList>
                  
                  <TabsContent value="content">
                    <div className="prose prose-invert prose-sm md:prose-base max-w-none text-slate-300">
                      <ReactMarkdown>{selectedModule.content}</ReactMarkdown>
                    </div>
                  </TabsContent>

                  <TabsContent value="keypoints">
                    <ul className="space-y-3">
                      {selectedModule.key_points?.map((point, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Lightbulb className="w-5 h-5 text-yellow-400 mt-1 shrink-0" />
                          <span className="text-slate-300">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>

                  {selectedModule.quiz_questions && selectedModule.quiz_questions.length > 0 && (
                    <TabsContent value="quiz">
                      {!showQuizResults ? (
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={currentQuizQuestion}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                          >
                            <p className="text-slate-400">Question {currentQuizQuestion + 1} of {selectedModule.quiz_questions.length}</p>
                            <Progress value={((currentQuizQuestion +1) / selectedModule.quiz_questions.length) * 100} className="h-2 bg-slate-800 [&>*]:bg-blue-500" />
                            
                            <h3 className="text-lg font-semibold text-white">
                              {selectedModule.quiz_questions[currentQuizQuestion].question}
                            </h3>
                            <div className="space-y-3">
                              {selectedModule.quiz_questions[currentQuizQuestion].options.map((option, i) => (
                                <Button
                                  key={i}
                                  variant={quizAnswers[currentQuizQuestion] === i ? "default" : "outline"}
                                  onClick={() => handleAnswerSelect(currentQuizQuestion, i)}
                                  className={`w-full justify-start text-left p-4 h-auto ${quizAnswers[currentQuizQuestion] === i ? 'bg-blue-600/50 border-blue-500 text-white' : 'border-slate-700/50 text-slate-300 hover:bg-slate-800/30 hover:text-white'}`}
                                >
                                  {option}
                                </Button>
                              ))}
                            </div>
                            <div className="flex justify-between">
                              {currentQuizQuestion > 0 && (
                                <Button variant="outline" className="text-slate-300 border-slate-700/50 hover:bg-slate-800/30" onClick={() => setCurrentQuizQuestion(q => q - 1)}>Previous</Button>
                              )}
                              {currentQuizQuestion < selectedModule.quiz_questions.length - 1 ? (
                                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setCurrentQuizQuestion(q => q + 1)}>Next</Button>
                              ) : (
                                <Button className="bg-green-600 hover:bg-green-700" onClick={handleSubmitQuiz}>Submit Quiz</Button>
                              )}
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-6"
                        >
                          <h3 className="text-xl font-semibold text-white">Quiz Results</h3>
                          <div className="p-4 rounded-lg bg-slate-800/50 text-center">
                            <p className="text-3xl font-bold text-blue-400">{calculateQuizScore().toFixed(0)}%</p>
                            <p className="text-slate-300">
                              You answered {selectedModule.quiz_questions.filter((q, i) => quizAnswers[i] === q.correct_answer).length} out of {selectedModule.quiz_questions.length} questions correctly.
                            </p>
                          </div>
                          {selectedModule.quiz_questions.map((q, index) => (
                            <div key={index} className={`p-4 rounded-lg border ${quizAnswers[index] === q.correct_answer ? 'border-green-500/30 bg-green-600/10' : 'border-red-500/30 bg-red-600/10'}`}>
                              <p className="font-semibold text-white mb-1">{q.question}</p>
                              <p className={`text-sm ${quizAnswers[index] === q.correct_answer ? 'text-green-300' : 'text-red-300'}`}>
                                Your answer: {q.options[quizAnswers[index]]}
                                {quizAnswers[index] !== q.correct_answer && ` (Correct: ${q.options[q.correct_answer]})`}
                              </p>
                              {quizAnswers[index] !== q.correct_answer && q.explanation && (
                                <p className="text-xs text-slate-400 mt-1">Explanation: {q.explanation}</p>
                              )}
                            </div>
                          ))}
                           <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setSelectedModule(null)}>Back to Modules</Button>
                        </motion.div>
                      )}
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
