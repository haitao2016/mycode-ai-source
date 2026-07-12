export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

export interface Milestone {
  id: string;
  name: string;
  description: string;
  status: MilestoneStatus;
  priority: 'high' | 'medium' | 'low';
  estimatedHours: number;
  dependencies: string[];
  tasks: Task[];
  createdAt: number;
  updatedAt: number;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  estimatedHours: number;
  completedHours: number;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  goal: string;
  milestones: Milestone[];
  createdAt: number;
  updatedAt: number;
}

export interface PlanEvent {
  type: 'planCreated' | 'planUpdated' | 'milestoneChanged' | 'taskChanged';
  payload?: Plan | Milestone | Task;
}
