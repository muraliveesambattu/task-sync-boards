
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { useBoard, Task } from '@/contexts/BoardContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Trash, Edit, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function TaskDetailPage() {
  const { boardId, taskId } = useParams<{ boardId: string; taskId: string }>();
  const { currentBoard, setCurrentBoard, deleteTask, updateTask } = useBoard();
  const [task, setTask] = useState<Task | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();

  // Set current board and find task
  useEffect(() => {
    if (boardId) {
      setCurrentBoard(boardId);
    }
  }, [boardId, setCurrentBoard]);

  // Find the task whenever currentBoard or taskId changes
  useEffect(() => {
    if (currentBoard && taskId) {
      for (const column of currentBoard.columns) {
        const foundTask = column.tasks.find(t => t.id === taskId);
        if (foundTask) {
          setTask(foundTask);
          break;
        }
      }
    }
  }, [currentBoard, taskId]);

  const handleDeleteTask = () => {
    if (boardId && taskId) {
      deleteTask(boardId, taskId);
      navigate(`/board/${boardId}`);
    }
  };

  if (!task) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-2xl text-gray-400 mb-4">Task not found</div>
          <Button onClick={() => navigate(`/board/${boardId}`)}>Back to Board</Button>
        </div>
      </MainLayout>
    );
  }

  // Format dates
  const formattedCreatedAt = format(new Date(task.createdAt), 'MMM d, yyyy');
  const formattedDueDate = task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No due date';
  const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() : false;

  return (
    <MainLayout>
      <div className="container py-8 max-w-3xl">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-6"
          onClick={() => navigate(`/board/${boardId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Board
        </Button>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{task.title}</CardTitle>
              <div className="text-sm text-muted-foreground">
                Created on {formattedCreatedAt}
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => navigate(`/board/${boardId}/edit-task/${taskId}`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                  </DialogHeader>
                  <p>This action cannot be undone. This will permanently delete this task.</p>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteTask}>
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {task.description || "No description provided."}
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
                <Badge>
                  {task.status === 'todo' && 'To Do'}
                  {task.status === 'in-progress' && 'In Progress'}
                  {task.status === 'review' && 'Review'}
                  {task.status === 'done' && 'Done'}
                </Badge>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Due Date</h3>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                  <Badge variant={isOverdue && task.status !== 'done' ? "destructive" : "outline"}>
                    {formattedDueDate}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Labels</h3>
              {task.labels.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {task.labels.map((label, index) => (
                    <Badge key={index} variant="outline">
                      {label}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No labels</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
