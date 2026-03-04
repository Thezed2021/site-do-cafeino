import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Coffee, 
  Type, 
  Image, 
  Video, 
  Paintbrush, 
  Ticket, 
  CircleDot, 
  Home,
  Menu
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

// Pages
import HomePage from '@/pages/HomePage';
import NickCreator from '@/pages/NickCreator';
import ImageToText from '@/pages/ImageToText';
import VideoToGif from '@/pages/VideoToGif';
import ImageEditor from '@/pages/ImageEditor';
import Sorteio from '@/pages/Sorteio';
import CaraOuCoroa from '@/pages/CaraOuCoroa';

const menuItems = [
  { path: '/', label: 'Início', icon: Home },
  { path: '/nick-creator', label: 'Criador de Nick', icon: Type },
  { path: '/image-to-text', label: 'Imagem → Texto', icon: Image },
  { path: '/video-to-gif', label: 'Vídeo → GIF', icon: Video },
  { path: '/image-editor', label: 'Editor de Imagens', icon: Paintbrush },
  { path: '/sorteio', label: 'Sorteio', icon: Ticket },
  { path: '/cara-ou-coroa', label: 'Cara ou Coroa', icon: CircleDot },
];

function SidebarContent() {
  const location = useLocation();
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border/50">
        <Link to="/" className="flex items-center gap-2">
          <Coffee className="h-6 w-6 text-amber-600" />
          <span className="font-bold text-lg">Site do Cafeíno</span>
        </Link>
      </div>
      
      <ScrollArea className="flex-1 py-4">
        <nav className="px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${isActive 
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100' 
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      
      <div className="p-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground text-center">
          Todas as ferramentas rodam no seu navegador
        </p>
      </div>
    </div>
  );
}

function MobileSidebar() {
  const [open, setOpen] = useState(false);
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0">
        <SidebarContent />
      </SheetContent>
    </Sheet>
  );
}

function DesktopSidebar() {
  return (
    <div className="hidden md:block w-[280px] border-r border-border/50 bg-background/50 backdrop-blur-sm fixed left-0 top-0 bottom-0 z-40">
      <SidebarContent />
    </div>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />
      
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-30 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 h-14">
          <MobileSidebar />
          <Link to="/" className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-amber-600" />
            <span className="font-bold">Site do Cafeíno</span>
          </Link>
          <div className="w-9" />
        </div>
      </header>
      
      {/* Main Content */}
      <main className="md:ml-[280px] min-h-screen">
        <div className="container mx-auto px-4 py-6 md:py-10 max-w-5xl">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/nick-creator" element={<NickCreator />} />
            <Route path="/image-to-text" element={<ImageToText />} />
            <Route path="/video-to-gif" element={<VideoToGif />} />
            <Route path="/image-editor" element={<ImageEditor />} />
            <Route path="/sorteio" element={<Sorteio />} />
            <Route path="/cara-ou-coroa" element={<CaraOuCoroa />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
