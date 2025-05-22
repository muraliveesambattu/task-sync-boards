
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { useBoard } from '@/contexts/BoardContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function DashboardPage() {
  const { boards, setCurrentBoard } = useBoard();
  const navigate = useNavigate();

  const handleBoardClick = (boardId: string) => {
    setCurrentBoard(boardId);
    navigate(`/board/${boardId}`);
  };

  const handleCreateBoard = () => {
    navigate('/create-board');
  };

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
            <p className="text-gray-500">Manage your tasks and projects</p>
          </div>
          <Button onClick={handleCreateBoard}>
            <Plus className="h-4 w-4 mr-2" />
            New Board
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => {
            const totalTasks = board.columns.reduce(
              (sum, column) => sum + column.tasks.length,
              0
            );
            const completedTasks = board.columns.find(c => c.id === 'done')?.tasks.length || 0;
            
            return (
              <Card key={board.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>{board.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 text-sm mb-4">{board.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>
                        {totalTasks === 0 
                          ? '0%' 
                          : `${Math.round((completedTasks / totalTasks) * 100)}%`}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div 
                        className="h-2 bg-primary rounded-full" 
                        style={{ 
                          width: totalTasks === 0 
                            ? '0%' 
                            : `${Math.round((completedTasks / totalTasks) * 100)}%`
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{totalTasks} tasks</span>
                      <span>{completedTasks} completed</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => handleBoardClick(board.id)}
                  >
                    View Board
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
          
          {boards.length === 0 && (
            <Card className="col-span-full border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">No boards found</h3>
                <p className="text-gray-500 text-center mb-4">
                  Create your first board to start organizing your tasks.
                </p>
                <Button onClick={handleCreateBoard}>Create Board</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
