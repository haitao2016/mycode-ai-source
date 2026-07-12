import type { Milestone } from './types';

export const getDefaultMilestones = (goal: string): Milestone[] => {
  return [
    {
      id: 'milestone-1',
      name: '核心玩法原型',
      description: '实现游戏核心循环和基础玩法',
      status: 'pending',
      priority: 'high',
      estimatedHours: 8,
      dependencies: [],
      tasks: [
        {
          id: 'task-1-1',
          name: '设计核心玩法文档',
          description: '定义玩家目标、核心机制和胜利条件',
          status: 'pending',
          estimatedHours: 2,
          completedHours: 0,
        },
        {
          id: 'task-1-2',
          name: '实现基础玩法',
          description: '实现核心游戏机制和玩家控制',
          status: 'pending',
          estimatedHours: 4,
          completedHours: 0,
        },
        {
          id: 'task-1-3',
          name: '测试核心循环',
          description: '验证核心玩法是否流畅有趣',
          status: 'pending',
          estimatedHours: 2,
          completedHours: 0,
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'milestone-2',
      name: '视觉与音效',
      description: '添加游戏视觉风格和音效',
      status: 'pending',
      priority: 'medium',
      estimatedHours: 6,
      dependencies: ['milestone-1'],
      tasks: [
        {
          id: 'task-2-1',
          name: '设计视觉风格',
          description: '确定游戏美术风格和配色方案',
          status: 'pending',
          estimatedHours: 2,
          completedHours: 0,
        },
        {
          id: 'task-2-2',
          name: '实现视觉资源',
          description: '创建或导入游戏资产',
          status: 'pending',
          estimatedHours: 3,
          completedHours: 0,
        },
        {
          id: 'task-2-3',
          name: '添加音效',
          description: '添加背景音乐和音效',
          status: 'pending',
          estimatedHours: 1,
          completedHours: 0,
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'milestone-3',
      name: '关卡与内容',
      description: '创建游戏关卡和内容',
      status: 'pending',
      priority: 'medium',
      estimatedHours: 8,
      dependencies: ['milestone-2'],
      tasks: [
        {
          id: 'task-3-1',
          name: '设计关卡结构',
          description: '规划关卡流程和难度曲线',
          status: 'pending',
          estimatedHours: 2,
          completedHours: 0,
        },
        {
          id: 'task-3-2',
          name: '实现关卡',
          description: '创建游戏关卡和场景',
          status: 'pending',
          estimatedHours: 4,
          completedHours: 0,
        },
        {
          id: 'task-3-3',
          name: '平衡难度',
          description: '调整关卡难度和平衡性',
          status: 'pending',
          estimatedHours: 2,
          completedHours: 0,
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'milestone-4',
      name: '完善与发布',
      description: '打磨游戏并准备发布',
      status: 'pending',
      priority: 'low',
      estimatedHours: 6,
      dependencies: ['milestone-3'],
      tasks: [
        {
          id: 'task-4-1',
          name: 'Bug修复',
          description: '修复游戏中的Bug和问题',
          status: 'pending',
          estimatedHours: 2,
          completedHours: 0,
        },
        {
          id: 'task-4-2',
          name: '性能优化',
          description: '优化游戏性能',
          status: 'pending',
          estimatedHours: 2,
          completedHours: 0,
        },
        {
          id: 'task-4-3',
          name: '准备发布',
          description: '打包游戏并准备发布',
          status: 'pending',
          estimatedHours: 2,
          completedHours: 0,
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];
};

export const getSurvivalGameMilestones = (): Milestone[] => {
  return [
    {
      id: 'ms-survival-1',
      name: '生存核心机制',
      description: '实现玩家生存所需的核心机制',
      status: 'pending',
      priority: 'high',
      estimatedHours: 10,
      dependencies: [],
      tasks: [
        { id: 't-surv-1-1', name: '玩家移动与控制', description: '实现玩家基本移动和交互', status: 'pending', estimatedHours: 3, completedHours: 0 },
        { id: 't-surv-1-2', name: '资源收集系统', description: '实现资源采集和管理', status: 'pending', estimatedHours: 3, completedHours: 0 },
        { id: 't-surv-1-3', name: '生存指标系统', description: '实现生命值、饥饿值、口渴值', status: 'pending', estimatedHours: 4, completedHours: 0 },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'ms-survival-2',
      name: '敌人与危险',
      description: '添加敌人AI和危险环境',
      status: 'pending',
      priority: 'high',
      estimatedHours: 8,
      dependencies: ['ms-survival-1'],
      tasks: [
        { id: 't-surv-2-1', name: '敌人AI', description: '实现敌人巡逻和攻击行为', status: 'pending', estimatedHours: 4, completedHours: 0 },
        { id: 't-surv-2-2', name: '战斗系统', description: '实现攻击和伤害系统', status: 'pending', estimatedHours: 2, completedHours: 0 },
        { id: 't-surv-2-3', name: '昼夜循环', description: '实现昼夜交替和夜间危险', status: 'pending', estimatedHours: 2, completedHours: 0 },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'ms-survival-3',
      name: '建造与制作',
      description: '实现建造和物品制作系统',
      status: 'pending',
      priority: 'medium',
      estimatedHours: 8,
      dependencies: ['ms-survival-1'],
      tasks: [
        { id: 't-surv-3-1', name: '制作系统', description: '实现物品合成和制作', status: 'pending', estimatedHours: 4, completedHours: 0 },
        { id: 't-surv-3-2', name: '建造系统', description: '实现基地建造功能', status: 'pending', estimatedHours: 4, completedHours: 0 },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'ms-survival-4',
      name: '世界与关卡',
      description: '创建游戏世界和关卡',
      status: 'pending',
      priority: 'medium',
      estimatedHours: 10,
      dependencies: ['ms-survival-2', 'ms-survival-3'],
      tasks: [
        { id: 't-surv-4-1', name: '地图设计', description: '设计游戏地图和区域', status: 'pending', estimatedHours: 4, completedHours: 0 },
        { id: 't-surv-4-2', name: '环境交互', description: '添加可交互的环境元素', status: 'pending', estimatedHours: 3, completedHours: 0 },
        { id: 't-surv-4-3', name: '事件系统', description: '实现随机事件和天气', status: 'pending', estimatedHours: 3, completedHours: 0 },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];
};

export const getCafeGameMilestones = (): Milestone[] => {
  return [
    {
      id: 'ms-cafe-1',
      name: '咖啡馆核心',
      description: '实现咖啡馆经营的核心机制',
      status: 'pending',
      priority: 'high',
      estimatedHours: 10,
      dependencies: [],
      tasks: [
        { id: 't-cafe-1-1', name: '顾客系统', description: '实现顾客生成和订单系统', status: 'pending', estimatedHours: 4, completedHours: 0 },
        { id: 't-cafe-1-2', name: '菜单系统', description: '实现食谱和菜品制作', status: 'pending', estimatedHours: 3, completedHours: 0 },
        { id: 't-cafe-1-3', name: '资源管理', description: '实现原料采购和库存管理', status: 'pending', estimatedHours: 3, completedHours: 0 },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'ms-cafe-2',
      name: '员工与升级',
      description: '添加员工管理和店铺升级',
      status: 'pending',
      priority: 'medium',
      estimatedHours: 8,
      dependencies: ['ms-cafe-1'],
      tasks: [
        { id: 't-cafe-2-1', name: '员工系统', description: '实现员工雇佣和排班', status: 'pending', estimatedHours: 4, completedHours: 0 },
        { id: 't-cafe-2-2', name: '升级系统', description: '实现店铺升级和解锁新功能', status: 'pending', estimatedHours: 4, completedHours: 0 },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'ms-cafe-3',
      name: '店铺装饰',
      description: '实现店铺装饰和视觉定制',
      status: 'pending',
      priority: 'low',
      estimatedHours: 6,
      dependencies: ['ms-cafe-1'],
      tasks: [
        { id: 't-cafe-3-1', name: '装饰系统', description: '实现家具和装饰物品', status: 'pending', estimatedHours: 3, completedHours: 0 },
        { id: 't-cafe-3-2', name: '3D房间', description: '实现3D店铺视图', status: 'pending', estimatedHours: 3, completedHours: 0 },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];
};

export const getRPGGameMilestones = (): Milestone[] => {
  return [
    {
      id: 'ms-rpg-1',
      name: '角色系统',
      description: '实现玩家角色和属性系统',
      status: 'pending',
      priority: 'high',
      estimatedHours: 10,
      dependencies: [],
      tasks: [
        { id: 't-rpg-1-1', name: '角色属性', description: '实现等级、经验、生命值等属性', status: 'pending', estimatedHours: 4, completedHours: 0 },
        { id: 't-rpg-1-2', name: '技能系统', description: '实现技能学习和使用', status: 'pending', estimatedHours: 3, completedHours: 0 },
        { id: 't-rpg-1-3', name: '装备系统', description: '实现装备穿戴和强化', status: 'pending', estimatedHours: 3, completedHours: 0 },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'ms-rpg-2',
      name: '战斗系统',
      description: '实现回合制或即时战斗系统',
      status: 'pending',
      priority: 'high',
      estimatedHours: 12,
      dependencies: ['ms-rpg-1'],
      tasks: [
        { id: 't-rpg-2-1', name: '战斗逻辑', description: '实现战斗流程和伤害计算', status: 'pending', estimatedHours: 4, completedHours: 0 },
        { id: 't-rpg-2-2', name: '敌人设计', description: '实现怪物和Boss', status: 'pending', estimatedHours: 4, completedHours: 0 },
        { id: 't-rpg-2-3', name: '战斗UI', description: '实现战斗界面和操作', status: 'pending', estimatedHours: 4, completedHours: 0 },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'ms-rpg-3',
      name: '剧情与世界',
      description: '创建游戏剧情和开放世界',
      status: 'pending',
      priority: 'medium',
      estimatedHours: 12,
      dependencies: ['ms-rpg-1'],
      tasks: [
        { id: 't-rpg-3-1', name: '剧情系统', description: '实现对话和剧情事件', status: 'pending', estimatedHours: 4, completedHours: 0 },
        { id: 't-rpg-3-2', name: '地图系统', description: '实现游戏地图和导航', status: 'pending', estimatedHours: 4, completedHours: 0 },
        { id: 't-rpg-3-3', name: '任务系统', description: '实现主线和支线任务', status: 'pending', estimatedHours: 4, completedHours: 0 },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];
};

export const getPlatformerMilestones = (): Milestone[] => {
  return [
    {
      id: 'ms-platform-1',
      name: '角色控制',
      description: '实现玩家角色跳跃和移动',
      status: 'pending',
      priority: 'high',
      estimatedHours: 8,
      dependencies: [],
      tasks: [
        { id: 't-platform-1-1', name: '移动系统', description: '实现左右移动和加速', status: 'pending', estimatedHours: 2, completedHours: 0 },
        { id: 't-platform-1-2', name: '跳跃系统', description: '实现跳跃和二段跳', status: 'pending', estimatedHours: 3, completedHours: 0 },
        { id: 't-platform-1-3', name: '物理碰撞', description: '实现碰撞检测和平台交互', status: 'pending', estimatedHours: 3, completedHours: 0 },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'ms-platform-2',
      name: '关卡设计',
      description: '创建平台关卡和障碍物',
      status: 'pending',
      priority: 'high',
      estimatedHours: 10,
      dependencies: ['ms-platform-1'],
      tasks: [
        { id: 't-platform-2-1', name: '关卡编辑器', description: '实现关卡设计工具', status: 'pending', estimatedHours: 4, completedHours: 0 },
        { id: 't-platform-2-2', name: '关卡内容', description: '创建多个关卡', status: 'pending', estimatedHours: 4, completedHours: 0 },
        { id: 't-platform-2-3', name: '难度曲线', description: '调整关卡难度', status: 'pending', estimatedHours: 2, completedHours: 0 },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'ms-platform-3',
      name: '游戏系统',
      description: '添加收集、敌人和Boss',
      status: 'pending',
      priority: 'medium',
      estimatedHours: 8,
      dependencies: ['ms-platform-1', 'ms-platform-2'],
      tasks: [
        { id: 't-platform-3-1', name: '收集系统', description: '实现金币和道具收集', status: 'pending', estimatedHours: 2, completedHours: 0 },
        { id: 't-platform-3-2', name: '敌人系统', description: '实现敌人AI和攻击', status: 'pending', estimatedHours: 3, completedHours: 0 },
        { id: 't-platform-3-3', name: 'Boss战', description: '设计和实现Boss战斗', status: 'pending', estimatedHours: 3, completedHours: 0 },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];
};

export const getPuzzleGameMilestones = (): Milestone[] => {
  return [
    {
      id: 'ms-puzzle-1',
      name: '核心谜题',
      description: '实现游戏核心解谜机制',
      status: 'pending',
      priority: 'high',
      estimatedHours: 8,
      dependencies: [],
      tasks: [
        { id: 't-puzzle-1-1', name: '谜题机制', description: '设计和实现核心玩法', status: 'pending', estimatedHours: 4, completedHours: 0 },
        { id: 't-puzzle-1-2', name: '关卡系统', description: '实现关卡加载和进度', status: 'pending', estimatedHours: 2, completedHours: 0 },
        { id: 't-puzzle-1-3', name: '提示系统', description: '实现提示和帮助功能', status: 'pending', estimatedHours: 2, completedHours: 0 },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'ms-puzzle-2',
      name: '关卡内容',
      description: '创建多个谜题关卡',
      status: 'pending',
      priority: 'high',
      estimatedHours: 12,
      dependencies: ['ms-puzzle-1'],
      tasks: [
        { id: 't-puzzle-2-1', name: '初始关卡', description: '创建教学和简单关卡', status: 'pending', estimatedHours: 4, completedHours: 0 },
        { id: 't-puzzle-2-2', name: '进阶关卡', description: '创建中等难度关卡', status: 'pending', estimatedHours: 4, completedHours: 0 },
        { id: 't-puzzle-2-3', name: '挑战关卡', description: '创建高难度挑战关卡', status: 'pending', estimatedHours: 4, completedHours: 0 },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'ms-puzzle-3',
      name: '奖励系统',
      description: '添加成就和奖励',
      status: 'pending',
      priority: 'low',
      estimatedHours: 4,
      dependencies: ['ms-puzzle-2'],
      tasks: [
        { id: 't-puzzle-3-1', name: '成就系统', description: '实现成就解锁', status: 'pending', estimatedHours: 2, completedHours: 0 },
        { id: 't-puzzle-3-2', name: '评分系统', description: '实现关卡评分', status: 'pending', estimatedHours: 2, completedHours: 0 },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];
};

export const get2DGameMilestones = (): Milestone[] => {
  return [
    {
      id: 'ms-2d-1',
      name: '2D渲染引擎',
      description: '实现基础2D渲染和精灵系统',
      status: 'pending',
      priority: 'high',
      estimatedHours: 8,
      dependencies: [],
      tasks: [
        { id: 't-2d-1-1', name: '渲染系统', description: '实现2D精灵渲染', status: 'pending', estimatedHours: 3, completedHours: 0 },
        { id: 't-2d-1-2', name: '精灵系统', description: '实现精灵动画和状态', status: 'pending', estimatedHours: 3, completedHours: 0 },
        { id: 't-2d-1-3', name: '相机系统', description: '实现2D相机跟随', status: 'pending', estimatedHours: 2, completedHours: 0 },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'ms-2d-2',
      name: '2D物理',
      description: '实现2D碰撞和物理',
      status: 'pending',
      priority: 'high',
      estimatedHours: 6,
      dependencies: ['ms-2d-1'],
      tasks: [
        { id: 't-2d-2-1', name: '碰撞检测', description: '实现AABB和圆形碰撞', status: 'pending', estimatedHours: 3, completedHours: 0 },
        { id: 't-2d-2-2', name: '物理系统', description: '实现重力和速度', status: 'pending', estimatedHours: 3, completedHours: 0 },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'ms-2d-3',
      name: '地图与场景',
      description: '实现2D地图和场景管理',
      status: 'pending',
      priority: 'medium',
      estimatedHours: 8,
      dependencies: ['ms-2d-1', 'ms-2d-2'],
      tasks: [
        { id: 't-2d-3-1', name: '瓦片地图', description: '实现瓦片地图系统', status: 'pending', estimatedHours: 4, completedHours: 0 },
        { id: 't-2d-3-2', name: '场景管理', description: '实现场景加载和切换', status: 'pending', estimatedHours: 4, completedHours: 0 },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];
};

export const get3DGameMilestones = (): Milestone[] => {
  return [
    {
      id: 'ms-3d-1',
      name: '3D渲染基础',
      description: '实现3D场景渲染和相机',
      status: 'pending',
      priority: 'high',
      estimatedHours: 10,
      dependencies: [],
      tasks: [
        { id: 't-3d-1-1', name: '3D渲染', description: '实现3D模型渲染', status: 'pending', estimatedHours: 4, completedHours: 0 },
        { id: 't-3d-1-2', name: '相机系统', description: '实现3D相机控制', status: 'pending', estimatedHours: 3, completedHours: 0 },
        { id: 't-3d-1-3', name: '光照系统', description: '实现基础光照', status: 'pending', estimatedHours: 3, completedHours: 0 },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'ms-3d-2',
      name: '3D物理',
      description: '实现3D碰撞和物理模拟',
      status: 'pending',
      priority: 'high',
      estimatedHours: 8,
      dependencies: ['ms-3d-1'],
      tasks: [
        { id: 't-3d-2-1', name: '碰撞检测', description: '实现3D碰撞检测', status: 'pending', estimatedHours: 4, completedHours: 0 },
        { id: 't-3d-2-2', name: '物理引擎', description: '实现物理模拟', status: 'pending', estimatedHours: 4, completedHours: 0 },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'ms-3d-3',
      name: '3D角色',
      description: '实现3D角色动画和控制',
      status: 'pending',
      priority: 'medium',
      estimatedHours: 10,
      dependencies: ['ms-3d-1', 'ms-3d-2'],
      tasks: [
        { id: 't-3d-3-1', name: '角色控制', description: '实现3D角色移动', status: 'pending', estimatedHours: 4, completedHours: 0 },
        { id: 't-3d-3-2', name: '动画系统', description: '实现角色动画', status: 'pending', estimatedHours: 3, completedHours: 0 },
        { id: 't-3d-3-3', name: '骨骼系统', description: '实现骨骼动画', status: 'pending', estimatedHours: 3, completedHours: 0 },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];
};

export const GAME_PATTERNS = [
  { keyword: 'survival', milestones: getSurvivalGameMilestones },
  { keyword: 'cafe', milestones: getCafeGameMilestones },
  { keyword: 'rpg', milestones: getRPGGameMilestones },
  { keyword: 'platform', milestones: getPlatformerMilestones },
  { keyword: 'puzzle', milestones: getPuzzleGameMilestones },
  { keyword: '2d', milestones: get2DGameMilestones },
  { keyword: '3d', milestones: get3DGameMilestones },
];

export const generateMilestones = (goal: string): Milestone[] => {
  const lowerGoal = goal.toLowerCase();
  for (const { keyword, milestones } of GAME_PATTERNS) {
    if (lowerGoal.includes(keyword)) {
      return milestones();
    }
  }
  return getDefaultMilestones(goal);
};

export const generatePlanName = (goal: string): string => {
  const maxLength = 30;
  return goal.length > maxLength ? goal.substring(0, maxLength) + '...' : goal;
};
