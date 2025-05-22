
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter } from '@/components/ui/sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, LayoutDashboard } from 'lucide-react';
import { useBoard } from '@/contexts/BoardContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { isAuthenticated, user, logout } = useAuth();
  const { boards, isLoading } = useBoard();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-2xl text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="h-16 border-b flex items-center px-6 justify-between bg-white">
            <div className="flex items-center">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold ml-4">TaskFlow</h1>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{user.name}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{user.email}</p>
                      <p className="text-xs text-gray-500">{user.role}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <Button variant="outline" size="sm" onClick={() => logout()}>
                Logout
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AppSidebar() {
  const { boards, setCurrentBoard, createBoard } = useBoard();
  const navigate = useNavigate();
  const [showNewBoardDialog, setShowNewBoardDialog] = React.useState(false);

  const handleBoardClick = (boardId: string) => {
    setCurrentBoard(boardId);
    navigate(`/board/${boardId}`);
  };

  return (
    <Sidebar className="w-64 border-r">
      <SidebarHeader className="h-16 flex items-center px-4 border-b">
        <Link to="/dashboard" className="text-xl font-bold flex items-center">
          <div className="mr-2 h-6 w-6 rounded bg-gradient-to-br from-purple-500 to-blue-500" />
          TaskFlow
        </Link>
      </SidebarHeader>
      <SidebarContent className="py-4">
        <div className="px-4 mb-4">
          <Link to="/dashboard">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </div>

        <div className="px-4 mb-2 flex items-center justify-between">
          <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">
            Your Boards
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => navigate('/create-board')}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-1 px-3">
          {boards.map((board) => (
            <Button
              key={board.id}
              variant="ghost"
              className="w-full justify-start font-normal h-9 px-2"
              onClick={() => handleBoardClick(board.id)}
            >
              <span className="truncate">{board.title}</span>
            </Button>
          ))}
        </div>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <div className="text-xs text-gray-500">
          TaskFlow © {new Date().getFullYear()}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
