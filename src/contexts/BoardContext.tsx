
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';

// Types
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  assigneeId: string | null;
  createdBy: string;
  createdAt: string;
  dueDate: string | null;
  labels: string[];
}

export interface Column {
  id: 'todo' | 'in-progress' | 'review' | 'done';
  title: string;
  color: string;
  tasks: Task[];
}

export interface Board {
  id: string;
  title: string;
  description: string;
  columns: Column[];
  members: string[];
  createdBy: string;
  createdAt: string;
}

interface BoardContextType {
  boards: Board[];
  currentBoard: Board | null;
  isLoading: boolean;
  setCurrentBoard: (boardId: string) => void;
  createBoard: (title: string, description: string) => void;
  updateBoard: (boardId: string, data: Partial<Board>) => void;
  deleteBoard: (boardId: string) => void;
  createTask: (boardId: string, columnId: Column['id'], task: Omit<Task, 'id' | 'createdAt' | 'createdBy'>) => void;
  updateTask: (boardId: string, taskId: string, data: Partial<Task>) => void;
  deleteTask: (boardId: string, taskId: string) => void;
  moveTask: (boardId: string, taskId: string, sourceColumnId: Column['id'], destinationColumnId: Column['id']) => void;
}

// Mock initial data
const initialBoards: Board[] = [
  {
    id: '1',
    title: 'Product Development',
    description: 'Track our product development lifecycle',
    columns: [
      {
        id: 'todo',
        title: 'To Do',
        color: '#8B5CF6', // Purple
        tasks: [
          {
            id: '101',
            title: 'Design new landing page',
            description: 'Create wireframes and mockups for the new landing page',
            status: 'todo',
            assigneeId: '2',
            createdBy: '1',
            createdAt: '2025-05-18T10:00:00Z',
            dueDate: '2025-05-25T23:59:59Z',
            labels: ['design', 'high-priority']
          },
          {
            id: '102',
            title: 'Update user profile page',
            description: 'Add new fields and improve the layout',
            status: 'todo',
            assigneeId: null,
            createdBy: '1',
            createdAt: '2025-05-19T14:30:00Z',
            dueDate: '2025-05-28T23:59:59Z',
            labels: ['frontend']
          }
        ]
      },
      {
        id: 'in-progress',
        title: 'In Progress',
        color: '#0EA5E9', // Blue
        tasks: [
          {
            id: '201',
            title: 'Implement authentication',
            description: 'Add login, signup, and password reset functionality',
            status: 'in-progress',
            assigneeId: '1',
            createdBy: '1',
            createdAt: '2025-05-15T09:15:00Z',
            dueDate: '2025-05-22T23:59:59Z',
            labels: ['backend', 'security']
          }
        ]
      },
      {
        id: 'review',
        title: 'Review',
        color: '#F59E0B', // Yellow
        tasks: [
          {
            id: '301',
            title: 'API documentation',
            description: 'Document all API endpoints and parameters',
            status: 'review',
            assigneeId: '2',
            createdBy: '1',
            createdAt: '2025-05-12T16:45:00Z',
            dueDate: '2025-05-20T23:59:59Z',
            labels: ['documentation']
          }
        ]
      },
      {
        id: 'done',
        title: 'Done',
        color: '#10B981', // Green
        tasks: [
          {
            id: '401',
            title: 'Setup CI/CD pipeline',
            description: 'Configure automated testing and deployment',
            status: 'done',
            assigneeId: '1',
            createdBy: '1',
            createdAt: '2025-05-10T11:30:00Z',
            dueDate: '2025-05-17T23:59:59Z',
            labels: ['devops']
          }
        ]
      }
    ],
    members: ['1', '2'],
    createdBy: '1',
    createdAt: '2025-05-10T10:00:00Z'
  },
  {
    id: '2',
    title: 'Marketing Campaign',
    description: 'Q2 marketing initiatives',
    columns: [
      {
        id: 'todo',
        title: 'To Do',
        color: '#8B5CF6', // Purple
        tasks: [
          {
            id: '501',
            title: 'Create social media content calendar',
            description: 'Plan content for the next month',
            status: 'todo',
            assigneeId: '2',
            createdBy: '1',
            createdAt: '2025-05-17T09:00:00Z',
            dueDate: '2025-05-24T23:59:59Z',
            labels: ['marketing', 'content']
          }
        ]
      },
      {
        id: 'in-progress',
        title: 'In Progress',
        color: '#0EA5E9', // Blue
        tasks: []
      },
      {
        id: 'review',
        title: 'Review',
        color: '#F59E0B', // Yellow
        tasks: [
          {
            id: '601',
            title: 'Email newsletter draft',
            description: 'Design and write copy for monthly newsletter',
            status: 'review',
            assigneeId: '2',
            createdBy: '1',
            createdAt: '2025-05-16T13:20:00Z',
            dueDate: '2025-05-21T23:59:59Z',
            labels: ['marketing', 'content']
          }
        ]
      },
      {
        id: 'done',
        title: 'Done',
        color: '#10B981', // Green
        tasks: []
      }
    ],
    members: ['1', '2'],
    createdBy: '1',
    createdAt: '2025-05-15T14:00:00Z'
  }
];

// Create board context
const BoardContext = createContext<BoardContextType | undefined>(undefined);

// Provider component
export function BoardProvider({ children }: { children: ReactNode }) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [currentBoard, setCurrentBoardState] = useState<Board | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load boards on component mount
  useEffect(() => {
    const loadBoards = async () => {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In a real app, you'd fetch from an API
      const savedBoards = localStorage.getItem('taskflow_boards');
      if (savedBoards) {
        setBoards(JSON.parse(savedBoards));
      } else {
        setBoards(initialBoards);
        localStorage.setItem('taskflow_boards', JSON.stringify(initialBoards));
      }
      
      setIsLoading(false);
    };

    loadBoards();
  }, []);

  // Save boards to localStorage whenever they change
  useEffect(() => {
    if (boards.length > 0 && !isLoading) {
      localStorage.setItem('taskflow_boards', JSON.stringify(boards));
    }
  }, [boards, isLoading]);

  // Set current board by ID
  const setCurrentBoard = useCallback((boardId: string) => {
    const board = boards.find(b => b.id === boardId) || null;
    setCurrentBoardState(board);
  }, [boards]);

  // Create a new board
  const createBoard = (title: string, description: string) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'You need to be logged in to create a board',
        variant: 'destructive',
      });
      return;
    }

    const newBoard: Board = {
      id: Date.now().toString(),
      title,
      description,
      columns: [
        {
          id: 'todo',
          title: 'To Do',
          color: '#8B5CF6', // Purple
          tasks: []
        },
        {
          id: 'in-progress',
          title: 'In Progress',
          color: '#0EA5E9', // Blue
          tasks: []
        },
        {
          id: 'review',
          title: 'Review',
          color: '#F59E0B', // Yellow
          tasks: []
        },
        {
          id: 'done',
          title: 'Done',
          color: '#10B981', // Green
          tasks: []
        }
      ],
      members: [user.id],
      createdBy: user.id,
      createdAt: new Date().toISOString()
    };

    setBoards(prev => [...prev, newBoard]);
    setCurrentBoardState(newBoard);
    
    toast({
      title: 'Board created',
      description: `"${title}" has been created successfully`
    });
  };

  // Update a board
  const updateBoard = (boardId: string, data: Partial<Board>) => {
    setBoards(prev => 
      prev.map(board => 
        board.id === boardId 
          ? { ...board, ...data } 
          : board
      )
    );

    // Update current board if it's the one being updated
    if (currentBoard?.id === boardId) {
      setCurrentBoardState(prev => prev ? { ...prev, ...data } : null);
    }

    toast({
      title: 'Board updated',
      description: `Board has been updated successfully`
    });
  };

  // Delete a board
  const deleteBoard = (boardId: string) => {
    setBoards(prev => prev.filter(board => board.id !== boardId));
    
    // Clear current board if it's the one being deleted
    if (currentBoard?.id === boardId) {
      setCurrentBoardState(null);
    }

    toast({
      title: 'Board deleted',
      description: `Board has been deleted successfully`
    });
  };

  // Create a new task
  const createTask = (
    boardId: string, 
    columnId: Column['id'], 
    task: Omit<Task, 'id' | 'createdAt' | 'createdBy'>
  ) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'You need to be logged in to create a task',
        variant: 'destructive',
      });
      return;
    }

    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdBy: user.id,
      createdAt: new Date().toISOString(),
    };

    setBoards(prev => 
      prev.map(board => {
        if (board.id === boardId) {
          return {
            ...board,
            columns: board.columns.map(column => {
              if (column.id === columnId) {
                return {
                  ...column,
                  tasks: [...column.tasks, newTask]
                };
              }
              return column;
            })
          };
        }
        return board;
      })
    );

    // Update current board if it's the one being updated
    if (currentBoard?.id === boardId) {
      setCurrentBoardState(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          columns: prev.columns.map(column => {
            if (column.id === columnId) {
              return {
                ...column,
                tasks: [...column.tasks, newTask]
              };
            }
            return column;
          })
        };
      });
    }

    toast({
      title: 'Task created',
      description: `"${newTask.title}" has been added to ${columnId}`
    });
  };

  // Update a task
  const updateTask = (boardId: string, taskId: string, data: Partial<Task>) => {
    setBoards(prev => 
      prev.map(board => {
        if (board.id === boardId) {
          return {
            ...board,
            columns: board.columns.map(column => {
              const taskIndex = column.tasks.findIndex(task => task.id === taskId);
              
              if (taskIndex !== -1) {
                const updatedTasks = [...column.tasks];
                updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], ...data };
                
                return {
                  ...column,
                  tasks: updatedTasks
                };
              }
              
              return column;
            })
          };
        }
        return board;
      })
    );

    // Update current board if it's the one being updated
    if (currentBoard?.id === boardId) {
      setCurrentBoardState(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          columns: prev.columns.map(column => {
            const taskIndex = column.tasks.findIndex(task => task.id === taskId);
            
            if (taskIndex !== -1) {
              const updatedTasks = [...column.tasks];
              updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], ...data };
              
              return {
                ...column,
                tasks: updatedTasks
              };
            }
            
            return column;
          })
        };
      });
    }

    toast({
      title: 'Task updated',
      description: `Task has been updated successfully`
    });
  };

  // Delete a task
  const deleteTask = (boardId: string, taskId: string) => {
    let taskTitle = "";
    
    setBoards(prev => 
      prev.map(board => {
        if (board.id === boardId) {
          return {
            ...board,
            columns: board.columns.map(column => {
              const taskIndex = column.tasks.findIndex(task => task.id === taskId);
              
              if (taskIndex !== -1) {
                taskTitle = column.tasks[taskIndex].title;
                const updatedTasks = [...column.tasks];
                updatedTasks.splice(taskIndex, 1);
                
                return {
                  ...column,
                  tasks: updatedTasks
                };
              }
              
              return column;
            })
          };
        }
        return board;
      })
    );

    // Update current board if it's the one being updated
    if (currentBoard?.id === boardId) {
      setCurrentBoardState(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          columns: prev.columns.map(column => {
            const taskIndex = column.tasks.findIndex(task => task.id === taskId);
            
            if (taskIndex !== -1) {
              const updatedTasks = [...column.tasks];
              updatedTasks.splice(taskIndex, 1);
              
              return {
                ...column,
                tasks: updatedTasks
              };
            }
            
            return column;
          })
        };
      });
    }

    toast({
      title: 'Task deleted',
      description: taskTitle ? `"${taskTitle}" has been deleted` : 'Task has been deleted'
    });
  };

  // Move a task from one column to another
  const moveTask = (
    boardId: string,
    taskId: string,
    sourceColumnId: Column['id'],
    destinationColumnId: Column['id']
  ) => {
    if (sourceColumnId === destinationColumnId) return;

    let taskToMove: Task | null = null;

    // Find and remove the task from the source column
    setBoards(prev => 
      prev.map(board => {
        if (board.id === boardId) {
          const updatedColumns = board.columns.map(column => {
            if (column.id === sourceColumnId) {
              const taskIndex = column.tasks.findIndex(task => task.id === taskId);
              
              if (taskIndex !== -1) {
                taskToMove = { ...column.tasks[taskIndex], status: destinationColumnId };
                const updatedTasks = [...column.tasks];
                updatedTasks.splice(taskIndex, 1);
                
                return {
                  ...column,
                  tasks: updatedTasks
                };
              }
            }
            
            // If this is the destination column and we found the task
            if (column.id === destinationColumnId && taskToMove) {
              return {
                ...column,
                tasks: [...column.tasks, taskToMove]
              };
            }
            
            return column;
          });

          return {
            ...board,
            columns: updatedColumns
          };
        }
        return board;
      })
    );

    // Update current board if it's the one being updated
    if (currentBoard?.id === boardId) {
      setCurrentBoardState(prev => {
        if (!prev) return null;
        
        // Find and remove the task from the source column
        let taskToMove: Task | null = null;
        const updatedColumns = prev.columns.map(column => {
          if (column.id === sourceColumnId) {
            const taskIndex = column.tasks.findIndex(task => task.id === taskId);
            
            if (taskIndex !== -1) {
              taskToMove = { ...column.tasks[taskIndex], status: destinationColumnId };
              const updatedTasks = [...column.tasks];
              updatedTasks.splice(taskIndex, 1);
              
              return {
                ...column,
                tasks: updatedTasks
              };
            }
          }
          
          // If this is the destination column and we found the task
          if (column.id === destinationColumnId && taskToMove) {
            return {
              ...column,
              tasks: [...column.tasks, taskToMove]
            };
          }
          
          return column;
        });

        return {
          ...prev,
          columns: updatedColumns
        };
      });
    }

    if (taskToMove) {
      toast({
        title: 'Task moved',
        description: `"${taskToMove.title}" moved to ${destinationColumnId.replace('-', ' ')}`
      });
    }
  };

  const value = {
    boards,
    currentBoard,
    isLoading,
    setCurrentBoard,
    createBoard,
    updateBoard,
    deleteBoard,
    createTask,
    updateTask,
    deleteTask,
    moveTask
  };

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
}

// Custom hook to use board context
export const useBoard = () => {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
};
