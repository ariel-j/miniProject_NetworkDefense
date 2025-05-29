// components/ui/index.js
export { Card, CardHeader, CardContent, CardTitle, CardFooter } from './card';
export { Button } from './button';
export { Badge } from './badge';
export { Progress } from './progress';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';

// entities/index.js
export { User } from './user';
export { ThreatDetection } from './ThreatDetection';
export { TrainingSimulation } from './TrainingSimulation';
export { LearningModule } from './LearningModule';

// components/dashboard/index.js
export { default as RecentThreats } from './RecentThreats';
export { default as ThreatStatusCard } from './ThreatStatusCard';
export { default as SecurityScore } from './SecurityScore';

// components/index.js
export { default as Navigation } from './Navigation';
export * from './ui';
export * from './dashboard';