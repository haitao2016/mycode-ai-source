import type { MilestoneStatus, Milestone, Task, Plan, PlanEvent } from './types';
import { generateMilestones, generatePlanName } from './milestones';

export type { MilestoneStatus, Milestone, Task, Plan, PlanEvent };

export class PlanService {
  private plans: Map<string, Plan> = new Map();
  private listeners: Set<(event: PlanEvent) => void> = new Set();

  createPlan(goal: string, description: string = ''): Plan {
    const id = `plan-${Date.now()}`;
    const plan: Plan = {
      id,
      name: generatePlanName(goal),
      description,
      goal,
      milestones: generateMilestones(goal),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.plans.set(id, plan);
    this.emit({ type: 'planCreated', payload: plan });
    return plan;
  }

  getPlan(id: string): Plan | undefined {
    return this.plans.get(id);
  }

  getAllPlans(): Plan[] {
    return Array.from(this.plans.values());
  }

  updatePlan(id: string, updates: Partial<Plan>): boolean {
    const plan = this.plans.get(id);
    if (!plan) return false;
    this.plans.set(id, { ...plan, ...updates, updatedAt: Date.now() });
    this.emit({ type: 'planUpdated', payload: this.plans.get(id) });
    return true;
  }

  deletePlan(id: string): boolean {
    return this.plans.delete(id);
  }

  updateMilestoneStatus(planId: string, milestoneId: string, status: MilestoneStatus): boolean {
    const plan = this.plans.get(planId);
    if (!plan) return false;
    const milestone = plan.milestones.find((m) => m.id === milestoneId);
    if (!milestone) return false;
    milestone.status = status;
    milestone.updatedAt = Date.now();
    plan.updatedAt = Date.now();
    this.emit({ type: 'milestoneChanged', payload: milestone });
    return true;
  }

  updateTaskStatus(
    planId: string,
    milestoneId: string,
    taskId: string,
    status: Task['status']
  ): boolean {
    const plan = this.plans.get(planId);
    if (!plan) return false;
    const milestone = plan.milestones.find((m) => m.id === milestoneId);
    if (!milestone) return false;
    const task = milestone.tasks.find((t) => t.id === taskId);
    if (!task) return false;
    task.status = status;
    plan.updatedAt = Date.now();
    this.emit({ type: 'taskChanged', payload: task });
    return true;
  }

  subscribe(listener: (event: PlanEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: PlanEvent): void {
    this.listeners.forEach((listener) => listener(event));
  }
}

export const planService = new PlanService();
