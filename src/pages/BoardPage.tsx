
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { useBoard } from '@/contexts/BoardContext';
import BoardColumn from '@/components/board/BoardColumn';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const { currentBoard, setCurrentBoard, isLoading } = useBoard();
  const navigate = useNavigate();

  // Set current board when component mounts or boardId changes
  useEffect(() => {
    if (boardId) {
      setCurrentBoard(boardId);
    }
  }, [boardId, setCurrentBoard]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse text-2xl text-gray-400">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  if (!currentBoard) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-2xl text-gray-400 mb-4">Board not found</div>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col h-full">
        <div className="p-6 border-b bg-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mr-2"
                  onClick={() => navigate('/dashboard')}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold">{currentBoard.title}</h1>
              </div>
              <p className="text-gray-500">{currentBoard.description}</p>
            </div>
            <div>
              <Button onClick={() => navigate(`/board/${boardId}/new-task`)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 flex gap-4 overflow-x-auto h-full">
          {currentBoard.columns.map((column) => (
            <BoardColumn
              key={column.id}
              column={column}
              boardId={currentBoard.id}
            />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
