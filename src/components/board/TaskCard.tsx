
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Task, Column, useBoard } from '@/contexts/BoardContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  columnId: Column['id'];
  boardId: string;
}

export default function TaskCard({ task, columnId, boardId }: TaskCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();
  
  // Handle drag start
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.setData('columnId', columnId);
    setIsDragging(true);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Format due date if it exists
  const formattedDueDate = task.dueDate ? format(new Date(task.dueDate), 'MMM d') : null;
  
  // Determine if task is overdue
  const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() : false;

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        'cursor-pointer animate-fade-in hover:shadow transition-shadow border-l-4',
        isDragging ? 'opacity-50' : 'opacity-100',
      )}
      style={{ 
        borderLeftColor: getLabelColor(task.labels[0]) || '#8B5CF6'
      }}
      onClick={() => navigate(`/board/${boardId}/task/${task.id}`)}
    >
      <CardContent className="p-3">
        <h3 className="font-medium text-sm mb-2">{task.title}</h3>
        
        <div className="flex items-center justify-between">
          <div className="flex gap-1 flex-wrap">
            {task.labels.slice(0, 2).map((label, index) => (
              <Badge key={index} variant="outline" className="text-xs px-1.5 py-0">
                {label}
              </Badge>
            ))}
            {task.labels.length > 2 && (
              <Badge variant="outline" className="text-xs px-1.5 py-0">
                +{task.labels.length - 2}
              </Badge>
            )}
          </div>
          
          {formattedDueDate && (
            <Badge variant={isOverdue ? "destructive" : "outline"} className="text-xs">
              {formattedDueDate}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to get consistent colors for labels
function getLabelColor(label: string | undefined): string {
  if (!label) return '#8B5CF6'; // Default purple
  
  const labelColors: Record<string, string> = {
    design: '#8B5CF6', // Purple
    frontend: '#0EA5E9', // Blue
    backend: '#10B981', // Green
    documentation: '#F59E0B', // Yellow
    'high-priority': '#EF4444', // Red
    security: '#EC4899', // Pink
    devops: '#6366F1', // Indigo
    marketing: '#F97316', // Orange
    content: '#A855F7', // Purple
    bug: '#DC2626', // Red
    feature: '#2563EB', // Blue
    improvement: '#10B981' // Green
  };
  
  return labelColors[label] || '#8B5CF6'; // Default to purple if not found
}
