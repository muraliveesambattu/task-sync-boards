
import React from 'react';
import { Column, Task, useBoard } from '@/contexts/BoardContext';
import TaskCard from './TaskCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BoardColumnProps {
  column: Column;
  boardId: string;
}

export default function BoardColumn({ column, boardId }: BoardColumnProps) {
  const { moveTask } = useBoard();
  const navigate = useNavigate();

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const sourceColumnId = e.dataTransfer.getData('columnId') as Column['id'];
    
    if (taskId && sourceColumnId) {
      moveTask(boardId, taskId, sourceColumnId, column.id);
    }
  };

  const handleAddTask = () => {
    navigate(`/board/${boardId}/new-task?column=${column.id}`);
  };

  return (
    <div
      className="flex flex-col w-72 min-w-72 bg-gray-50 rounded-md"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div 
        className="flex items-center justify-between px-4 py-3 font-medium"
        style={{ borderBottom: `2px solid ${column.color}` }}
      >
        <div className="flex items-center">
          <div 
            className="h-3 w-3 rounded-full mr-2" 
            style={{ backgroundColor: column.color }}
          ></div>
          <span>{column.title}</span>
        </div>
        <span className="text-xs font-normal text-gray-500 bg-white px-2 py-1 rounded-full">
          {column.tasks.length}
        </span>
      </div>

      <div className="p-2 flex-1 overflow-y-auto max-h-[calc(100vh-220px)]">
        {column.tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-24 border border-dashed rounded-md border-gray-200 text-gray-400 text-sm">
            No tasks yet
          </div>
        ) : (
          <div className="space-y-2">
            {column.tasks.map((task) => (
              <TaskCard key={task.id} task={task} columnId={column.id} boardId={boardId} />
            ))}
          </div>
        )}
      </div>

      <div className="p-2 pt-0">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start text-muted-foreground"
          onClick={handleAddTask}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add task
        </Button>
      </div>
    </div>
  );
}
