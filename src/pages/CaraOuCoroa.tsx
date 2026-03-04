import { useState, useRef } from 'react';
import { 
  CircleDot, 
  RotateCcw, 
  History,
  Sparkles,
  Coins,
  TrendingUp,
  BarChart3,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// ============================================
// CARA OU COROA
// ============================================
// O clássico jogo de cara ou coroa para decisões
// ============================================

type Side = 'cara' | 'coroa';

interface GameResult {
  id: string;
  side: Side;
  timestamp: Date;
}

interface Stats {
  cara: number;
  coroa: number;
  total: number;
  streak: number;
  lastSide: Side | null;
}

export default function CaraOuCoroa() {
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<Side | null>(null);
  const [history, setHistory] = useState<GameResult[]>([]);
  const [stats, setStats] = useState<Stats>({
    cara: 0,
    coroa: 0,
    total: 0,
    streak: 0,
    lastSide: null,
  });
  const [rotation, setRotation] = useState(0);
  const [selectedSide, setSelectedSide] = useState<Side | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const coinRef = useRef<HTMLDivElement>(null);
  
  const flipCoin = () => {
    if (isFlipping) return;
    
    setIsFlipping(true);
    setResult(null);
    setShowConfetti(false);
    
    // Determinar resultado antes da animação
    const isCara = Math.random() < 0.5;
    const newResult: Side = isCara ? 'cara' : 'coroa';
    
    // Calcular rotação para o resultado
    const baseRotation = 5; // Mínimo de 5 voltas
    const extraRotation = Math.floor(Math.random() * 3);
    const resultRotation = isCara ? 0 : 180; // 0 = cara, 180 = coroa
    const totalRotation = rotation + ((baseRotation + extraRotation) * 360) + resultRotation;
    
    setRotation(totalRotation);
    
    // Aguardar animação
    setTimeout(() => {
      setResult(newResult);
      setIsFlipping(false);
      
      // Adicionar ao histórico
      const gameResult: GameResult = {
        id: Date.now().toString(),
        side: newResult,
        timestamp: new Date(),
      };
      
      setHistory(prev => [gameResult, ...prev].slice(0, 50));
      
      // Atualizar estatísticas
      setStats(prev => {
        const newStats = { ...prev };
        newStats[newResult]++;
        newStats.total++;
        
        if (prev.lastSide === newResult) {
          newStats.streak = prev.streak + 1;
        } else {
          newStats.streak = 1;
        }
        newStats.lastSide = newResult;
        
        return newStats;
      });
      
      // Verificar se acertou (se selecionou um lado)
      if (selectedSide) {
        if (selectedSide === newResult) {
          setShowConfetti(true);
          toast.success('Você acertou! 🎉');
          playWinSound();
        } else {
          toast.info('Não foi dessa vez...');
        }
      } else {
        toast.info(`Deu ${newResult.toUpperCase()}!`);
      }
    }, 2000);
  };
  
  const playWinSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } catch (e) {
      // Silenciar erro
    }
  };
  
  const clearHistory = () => {
    if (confirm('Limpar todo o histórico?')) {
      setHistory([]);
      setStats({
        cara: 0,
        coroa: 0,
        total: 0,
        streak: 0,
        lastSide: null,
      });
      toast.info('Histórico limpo!');
    }
  };
  
  const getStreakText = () => {
    if (stats.streak < 2) return null;
    return `${stats.streak} vezes seguidas! 🔥`;
  };
  
  const getPercentage = (side: Side) => {
    if (stats.total === 0) return 0;
    return Math.round((stats[side] / stats.total) * 100);
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-amber-100 rounded-full mb-2">
          <CircleDot className="h-6 w-6 text-amber-700" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">Cara ou Coroa</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          O clássico jogo para tomar decisões. Escolha um lado ou deixe ao acaso!
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Área principal do jogo */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-600" />
              Jogar
            </CardTitle>
            <CardDescription>
              Clique no botão para lançar a moeda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Seleção de lado */}
            <div className="flex justify-center gap-4">
              <Button
                variant={selectedSide === 'cara' ? 'default' : 'outline'}
                size="lg"
                onClick={() => setSelectedSide(selectedSide === 'cara' ? null : 'cara')}
                className={selectedSide === 'cara' ? 'bg-amber-600 hover:bg-amber-700' : ''}
                disabled={isFlipping}
              >
                <span className="text-2xl mr-2">👤</span>
                Cara
              </Button>
              <Button
                variant={selectedSide === 'coroa' ? 'default' : 'outline'}
                size="lg"
                onClick={() => setSelectedSide(selectedSide === 'coroa' ? null : 'coroa')}
                className={selectedSide === 'coroa' ? 'bg-amber-600 hover:bg-amber-700' : ''}
                disabled={isFlipping}
              >
                <span className="text-2xl mr-2">👑</span>
                Coroa
              </Button>
            </div>
            
            {selectedSide && (
              <p className="text-center text-sm text-muted-foreground">
                Você escolheu: <span className="font-medium text-amber-600">{selectedSide.toUpperCase()}</span>
              </p>
            )}
            
            {/* Moeda 3D */}
            <div className="flex justify-center py-8" style={{ perspective: '1000px' }}>
              <div
                ref={coinRef}
                className="relative w-48 h-48"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateY(${rotation}deg)`,
                  transition: isFlipping ? 'transform 2s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none',
                }}
              >
                {/* Cara */}
                <div
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 flex items-center justify-center shadow-xl"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="text-center">
                    <span className="text-6xl">👤</span>
                    <p className="text-amber-900 font-bold mt-2">CARA</p>
                  </div>
                </div>
                
                {/* Coroa */}
                <div
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center shadow-xl"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <div className="text-center">
                    <span className="text-6xl">👑</span>
                    <p className="text-amber-900 font-bold mt-2">COROA</p>
                  </div>
                </div>
                
                {/* Borda da moeda */}
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #b45309 0%, #f59e0b 50%, #b45309 100%)',
                    transform: 'translateZ(-4px)',
                  }}
                />
              </div>
            </div>
            
            {/* Resultado */}
            {result && !isFlipping && (
              <div className="text-center animate-in fade-in zoom-in duration-300">
                <div className={`
                  inline-flex items-center gap-2 px-6 py-3 rounded-full text-xl font-bold
                  ${result === 'cara' 
                    ? 'bg-amber-100 text-amber-800 border-2 border-amber-300' 
                    : 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                  }
                `}>
                  <span className="text-3xl">{result === 'cara' ? '👤' : '👑'}</span>
                  {result.toUpperCase()}!
                </div>
                
                {selectedSide && (
                  <p className="mt-3 text-lg">
                    {selectedSide === result ? (
                      <span className="text-green-600 font-medium">✅ Você acertou!</span>
                    ) : (
                      <span className="text-red-500 font-medium">❌ Você errou!</span>
                    )}
                  </p>
                )}
                
                {showConfetti && (
                  <div className="mt-4">
                    <Sparkles className="h-8 w-8 text-amber-500 mx-auto animate-bounce" />
                  </div>
                )}
              </div>
            )}
            
            {/* Botão de jogar */}
            <Button
              onClick={flipCoin}
              disabled={isFlipping}
              className="w-full h-14 text-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              {isFlipping ? (
                <>
                  <RotateCcw className="h-5 w-5 mr-2 animate-spin" />
                  Girando...
                </>
              ) : (
                <>
                  <Coins className="h-5 w-5 mr-2" />
                  {result ? 'Jogar Novamente' : 'Lançar Moeda'}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Estatísticas e Histórico */}
        <div className="space-y-4">
          {/* Estatísticas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4 text-amber-600" />
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Total */}
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <p className="text-3xl font-bold text-amber-600">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Jogadas totais</p>
              </div>
              
              {/* Gráfico de barras */}
              {stats.total > 0 && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <span>👤</span> Cara
                      </span>
                      <span className="font-medium">{stats.cara} ({getPercentage('cara')}%)</span>
                    </div>
                    <div className="h-4 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 transition-all duration-500"
                        style={{ width: `${getPercentage('cara')}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <span>👑</span> Coroa
                      </span>
                      <span className="font-medium">{stats.coroa} ({getPercentage('coroa')}%)</span>
                    </div>
                    <div className="h-4 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-500 transition-all duration-500"
                        style={{ width: `${getPercentage('coroa')}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Streak */}
              {getStreakText() && (
                <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-orange-700">{getStreakText()}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Histórico */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-amber-600" />
                  Histórico
                </div>
                {history.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearHistory}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-center text-muted-foreground py-4 text-sm">
                  Nenhuma jogada ainda
                </p>
              ) : (
                <div className="space-y-1 max-h-[200px] overflow-y-auto">
                  {history.map((game, idx) => (
                    <div
                      key={game.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-6">
                          #{history.length - idx}
                        </span>
                        <span className="text-lg">
                          {game.side === 'cara' ? '👤' : '👑'}
                        </span>
                        <span className="capitalize font-medium">
                          {game.side}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {game.timestamp.toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
