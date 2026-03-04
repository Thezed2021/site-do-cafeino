import { useState, useRef } from 'react';
import { 
  Ticket, 
  Plus, 
  Trash2, 
  Shuffle, 
  Trophy, 
  Users,
  RotateCcw,
  Sparkles,
  Crown,
  Medal,
  Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// ============================================
// SORTEIO
// ============================================
// Ferramenta de sorteio para rifas, brindes, etc.
// ============================================

interface Participant {
  id: string;
  name: string;
}

interface Winner {
  participant: Participant;
  position: number;
}

export default function Sorteio() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newParticipant, setNewParticipant] = useState('');
  const [prize, setPrize] = useState('');
  const [winners, setWinners] = useState<Winner[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentHighlight, setCurrentHighlight] = useState<string | null>(null);
  const [drawCount, setDrawCount] = useState(1);
  const [allowRepeat, setAllowRepeat] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  
  const addParticipant = () => {
    if (!newParticipant.trim()) {
      toast.error('Digite um nome válido');
      return;
    }
    
    const participant: Participant = {
      id: Date.now().toString(),
      name: newParticipant.trim(),
    };
    
    setParticipants([...participants, participant]);
    setNewParticipant('');
    inputRef.current?.focus();
    toast.success(`${participant.name} adicionado!`);
  };
  
  const removeParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };
  
  const clearAll = () => {
    if (confirm('Tem certeza que deseja limpar todos os participantes?')) {
      setParticipants([]);
      setWinners([]);
      toast.info('Lista limpa!');
    }
  };
  
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  const drawWinners = async () => {
    if (participants.length < drawCount) {
      toast.error(`Precisa de pelo menos ${drawCount} participante(s)`);
      return;
    }
    
    if (!allowRepeat && participants.length < drawCount) {
      toast.error('Não há participantes suficientes sem repetição');
      return;
    }
    
    setIsDrawing(true);
    setWinners([]);
    
    // Animação de sorteio
    const animationDuration = 3000;
    const intervalDuration = 100;
    const steps = animationDuration / intervalDuration;
    
    for (let i = 0; i < steps; i++) {
      const randomIndex = Math.floor(Math.random() * participants.length);
      setCurrentHighlight(participants[randomIndex].id);
      await new Promise(resolve => setTimeout(resolve, intervalDuration));
    }
    
    // Selecionar vencedores
    const selectedWinners: Winner[] = [];
    const availableParticipants = allowRepeat ? [...participants] : shuffleArray(participants);
    
    for (let i = 0; i < drawCount; i++) {
      if (!allowRepeat && i >= availableParticipants.length) break;
      
      const participant = allowRepeat 
        ? availableParticipants[Math.floor(Math.random() * availableParticipants.length)]
        : availableParticipants[i];
      
      selectedWinners.push({
        participant,
        position: i + 1,
      });
    }
    
    setCurrentHighlight(null);
    setWinners(selectedWinners);
    setIsDrawing(false);
    
    // Tocar som de vitória (opcional - usando Web Audio API)
    playWinSound();
    
    toast.success('Sorteio realizado!');
  };
  
  const playWinSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Criar oscilador para som de vitória
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
      oscillator.frequency.setValueAtTime(1046.50, audioContext.currentTime + 0.3); // C6
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      // Silenciar erro de áudio
    }
  };
  
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-amber-600" />;
      default: return <Award className="h-5 w-5 text-blue-500" />;
    }
  };
  
  const getPositionColor = (position: number) => {
    switch (position) {
      case 1: return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 2: return 'bg-gray-100 border-gray-300 text-gray-800';
      case 3: return 'bg-amber-100 border-amber-300 text-amber-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };
  
  const importFromText = (text: string) => {
    const names = text.split(/[\n,;]/).map(n => n.trim()).filter(n => n.length > 0);
    const newParticipants = names.map((name, idx) => ({
      id: `${Date.now()}-${idx}`,
      name,
    }));
    setParticipants([...participants, ...newParticipants]);
    toast.success(`${newParticipants.length} participantes importados!`);
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-amber-100 rounded-full mb-2">
          <Ticket className="h-6 w-6 text-amber-700" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">Sorteio</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Realize sorteios de forma justa e aleatória. Adicione os participantes e defina o prêmio!
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Configurações e Participantes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-600" />
              Participantes
              <Badge variant="secondary" className="ml-auto">
                {participants.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              Adicione os nomes dos participantes do sorteio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Prêmio */}
            <div className="space-y-2">
              <Label>O que será sorteado? (opcional)</Label>
              <Input
                value={prize}
                onChange={(e) => setPrize(e.target.value)}
                placeholder="Ex: Um iPhone 15, R$ 100,00..."
              />
            </div>
            
            {/* Configurações do sorteio */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantidade de ganhadores</Label>
                <Input
                  type="number"
                  min={1}
                  max={participants.length || 1}
                  value={drawCount}
                  onChange={(e) => setDrawCount(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowRepeat}
                    onChange={(e) => setAllowRepeat(e.target.checked)}
                    className="rounded"
                  />
                  Permitir repetição
                </Label>
                <p className="text-xs text-muted-foreground">
                  Mesma pessoa pode ganhar mais de uma vez
                </p>
              </div>
            </div>
            
            {/* Adicionar participante */}
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={newParticipant}
                onChange={(e) => setNewParticipant(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addParticipant()}
                placeholder="Nome do participante..."
              />
              <Button onClick={addParticipant}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Lista de participantes */}
            <div className="border rounded-lg p-3 max-h-[300px] overflow-y-auto">
              {participants.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum participante adicionado ainda
                </p>
              ) : (
                <div className="space-y-2">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className={`
                        flex items-center justify-between p-2 rounded-lg transition-all
                        ${currentHighlight === participant.id 
                          ? 'bg-amber-200 scale-105' 
                          : 'bg-muted hover:bg-muted/80'
                        }
                      `}
                    >
                      <span className="font-medium">{participant.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeParticipant(participant.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Ações */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearAll} className="flex-1">
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  const names = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Julia', 'Lucas', 'Mariana'];
                  const randomNames = names.sort(() => Math.random() - 0.5).slice(0, 5);
                  randomNames.forEach(name => {
                    setParticipants(prev => [...prev, { id: Date.now().toString() + Math.random(), name }]);
                  });
                  toast.success('Participantes de exemplo adicionados!');
                }}
                className="flex-1"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Exemplo
              </Button>
            </div>
            
            {/* Importar em lote */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Importar lista (nomes separados por vírgula ou linha)</Label>
              <textarea
                className="w-full px-3 py-2 border rounded-md text-sm min-h-[80px] resize-none"
                placeholder="João, Maria, Pedro..."
                onChange={(e) => {
                  if (e.target.value) {
                    importFromText(e.target.value);
                    e.target.value = '';
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sorteio e Resultados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-600" />
              Resultado
            </CardTitle>
            <CardDescription>
              Clique em "Realizar Sorteio" para escolher os ganhadores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Prêmio display */}
            {prize && (
              <div className="bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 rounded-lg p-4 text-center">
                <p className="text-sm text-amber-700 mb-1">Prêmio do sorteio:</p>
                <p className="text-lg font-bold text-amber-900">{prize}</p>
              </div>
            )}
            
            {/* Botão de sorteio */}
            <Button
              onClick={drawWinners}
              disabled={isDrawing || participants.length < drawCount}
              className="w-full h-16 text-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              {isDrawing ? (
                <>
                  <Shuffle className="h-5 w-5 mr-2 animate-spin" />
                  Sorteando...
                </>
              ) : (
                <>
                  <Ticket className="h-5 w-5 mr-2" />
                  Realizar Sorteio
                </>
              )}
            </Button>
            
            {/* Vencedores */}
            {winners.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Ganhadores
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                
                <div className="space-y-2">
                  {winners.map((winner) => (
                    <div
                      key={`${winner.position}-${winner.participant.id}`}
                      className={`
                        flex items-center gap-3 p-4 rounded-lg border-2
                        ${getPositionColor(winner.position)}
                      `}
                    >
                      <div className="flex items-center justify-center w-10 h-10 bg-white/50 rounded-full">
                        {getPositionIcon(winner.position)}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs opacity-70">
                          {winner.position}º Lugar
                        </p>
                        <p className="text-lg font-bold">
                          {winner.participant.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setWinners([])}
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Novo Sorteio
                </Button>
              </div>
            )}
            
            {/* Estatísticas */}
            {participants.length > 0 && (
              <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-amber-600">
                    {participants.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Participantes</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-amber-600">
                    {drawCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Ganhadores</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
