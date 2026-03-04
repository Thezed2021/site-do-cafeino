import { useState, useRef } from 'react';
import { Smile, Plus, Trash2, Download, Image as ImageIcon, Layers } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// ============================================
// EMOJI PARA IMAGEM
// ============================================
// Combina múltiplos emojis em uma única imagem
// ============================================

interface EmojiLayer {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
}

const COMMON_EMOJIS = [
  '😀', '😂', '🥰', '😎', '🤔', '😴', '😭', '😡', '🥳', '😱',
  '👍', '👎', '👏', '🙏', '💪', '👋', '✌️', '🤞', '🤟', '🤘',
  '❤️', '💔', '💖', '💙', '💚', '💛', '💜', '🖤', '🤍', '🤎',
  '🔥', '✨', '💫', '⭐', '🌟', '💥', '💢', '💦', '💨', '🌈',
  '🎉', '🎊', '🎁', '🎈', '🎀', '🏆', '🥇', '🥈', '🥉', '🏅',
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
  '🌸', '🌺', '🌻', '🌹', '🌷', '🌼', '🌵', '🌲', '🌳', '🍁',
  '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒',
  '🍕', '🍔', '🍟', '🌭', '🍿', '🍩', '🍪', '🎂', '🍰', '🧁',
  '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸',
  '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐',
  '💻', '🖥️', '⌨️', '🖱️', '🖨️', '📱', '📲', '☎️', '📞', '📟',
];

export default function EmojiToImage() {
  const [layers, setLayers] = useState<EmojiLayer[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [newEmoji, setNewEmoji] = useState('');
  const [canvasSize, setCanvasSize] = useState({ width: 512, height: 512 });
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [isTransparent, setIsTransparent] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const addLayer = () => {
    if (!newEmoji.trim()) {
      toast.error('Digite ou selecione um emoji');
      return;
    }
    
    const newLayer: EmojiLayer = {
      id: Date.now().toString(),
      emoji: newEmoji,
      x: 50,
      y: 50,
      size: 100,
      rotation: 0,
    };
    
    setLayers([...layers, newLayer]);
    setSelectedLayer(newLayer.id);
    setNewEmoji('');
    toast.success('Emoji adicionado!');
    
    // Renderizar após adicionar
    setTimeout(renderCanvas, 50);
  };
  
  const removeLayer = (id: string) => {
    setLayers(layers.filter(l => l.id !== id));
    if (selectedLayer === id) {
      setSelectedLayer(null);
    }
    setTimeout(renderCanvas, 50);
  };
  
  const updateLayer = (id: string, updates: Partial<EmojiLayer>) => {
    setLayers(layers.map(l => l.id === id ? { ...l, ...updates } : l));
    setTimeout(renderCanvas, 50);
  };
  
  const renderCanvas = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Configurar canvas
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    
    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Desenhar fundo (se não for transparente)
    if (!isTransparent) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Desenhar cada layer
    layers.forEach(layer => {
      ctx.save();
      
      const x = (layer.x / 100) * canvas.width;
      const y = (layer.y / 100) * canvas.height;
      
      ctx.translate(x, y);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      
      ctx.font = `${layer.size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(layer.emoji, 0, 0);
      
      ctx.restore();
    });
  };
  
  const downloadImage = (format: 'png' | 'jpg') => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    
    // Re-renderizar para garantir qualidade
    renderCanvas();
    
    setTimeout(() => {
      const link = document.createElement('a');
      link.download = `emoji-art-${Date.now()}.${format}`;
      link.href = canvas.toDataURL(format === 'png' ? 'image/png' : 'image/jpeg', 0.9);
      link.click();
      toast.success(`Imagem ${format.toUpperCase()} baixada!`);
    }, 100);
  };
  
  const clearAll = () => {
    if (confirm('Tem certeza que deseja limpar todos os emojis?')) {
      setLayers([]);
      setSelectedLayer(null);
      setTimeout(renderCanvas, 50);
      toast.info('Canvas limpo!');
    }
  };
  
  const selectedLayerData = layers.find(l => l.id === selectedLayer);
  
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-amber-100 rounded-full mb-2">
          <Smile className="h-6 w-6 text-amber-700" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">Emoji para Imagem</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Combine múltiplos emojis em uma única imagem. Crie stickers, memes ou arte!
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Canvas Preview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-amber-600" />
              Preview
            </CardTitle>
            <CardDescription>
              Visualize e arraste para posicionar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <div 
                className="relative border-2 border-dashed border-border rounded-lg overflow-hidden"
                style={{ 
                  width: Math.min(canvasSize.width, 500), 
                  height: Math.min(canvasSize.height, 400),
                  maxWidth: '100%',
                }}
              >
                <canvas
                  ref={canvasRef}
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: isTransparent ? 'transparent' : backgroundColor,
                    backgroundImage: isTransparent ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 'none',
                    backgroundSize: isTransparent ? '20px 20px' : 'auto',
                    backgroundPosition: isTransparent ? '0 0, 0 10px, 10px -10px, -10px 0px' : 'auto',
                  }}
                />
              </div>
            </div>
            
            {/* Canvas Settings */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Largura: {canvasSize.width}px</Label>
                <Slider
                  value={[canvasSize.width]}
                  onValueChange={([v]) => {
                    setCanvasSize(c => ({ ...c, width: v }));
                    setTimeout(renderCanvas, 50);
                  }}
                  min={128}
                  max={1024}
                  step={64}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Altura: {canvasSize.height}px</Label>
                <Slider
                  value={[canvasSize.height]}
                  onValueChange={([v]) => {
                    setCanvasSize(c => ({ ...c, height: v }));
                    setTimeout(renderCanvas, 50);
                  }}
                  min={128}
                  max={1024}
                  step={64}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Fundo</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => {
                      setBackgroundColor(e.target.value);
                      setIsTransparent(false);
                      setTimeout(renderCanvas, 50);
                    }}
                    className="w-8 h-8 rounded cursor-pointer"
                    disabled={isTransparent}
                  />
                  <label className="flex items-center gap-1 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isTransparent}
                      onChange={(e) => {
                        setIsTransparent(e.target.checked);
                        setTimeout(renderCanvas, 50);
                      }}
                      className="rounded"
                    />
                    Transparente
                  </label>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Ações</Label>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={clearAll}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => downloadImage('png')}>
                    PNG
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => downloadImage('jpg')}>
                    JPG
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-amber-600" />
              Camadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Emoji */}
            <div className="space-y-2">
              <Label>Adicionar Emoji</Label>
              <div className="flex gap-2">
                <Input
                  value={newEmoji}
                  onChange={(e) => setNewEmoji(e.target.value)}
                  placeholder="Cole um emoji..."
                  className="text-2xl text-center"
                  maxLength={2}
                />
                <Button onClick={addLayer} className="bg-amber-600 hover:bg-amber-700">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Quick Emojis */}
              <div className="flex flex-wrap gap-1 max-h-[120px] overflow-y-auto p-2 bg-muted rounded-lg">
                {COMMON_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    className="text-2xl p-1 hover:bg-amber-100 rounded transition-colors"
                    onClick={() => {
                      setNewEmoji(emoji);
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Selected Layer Controls */}
            {selectedLayerData && (
              <div className="space-y-3 p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-amber-900">Editando: {selectedLayerData.emoji}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeLayer(selectedLayer!)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs">Posição X: {selectedLayerData.x}%</Label>
                  <Slider
                    value={[selectedLayerData.x]}
                    onValueChange={([v]) => updateLayer(selectedLayer!, { x: v })}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs">Posição Y: {selectedLayerData.y}%</Label>
                  <Slider
                    value={[selectedLayerData.y]}
                    onValueChange={([v]) => updateLayer(selectedLayer!, { y: v })}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs">Tamanho: {selectedLayerData.size}px</Label>
                  <Slider
                    value={[selectedLayerData.size]}
                    onValueChange={([v]) => updateLayer(selectedLayer!, { size: v })}
                    min={20}
                    max={300}
                    step={5}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs">Rotação: {selectedLayerData.rotation}°</Label>
                  <Slider
                    value={[selectedLayerData.rotation]}
                    onValueChange={([v]) => updateLayer(selectedLayer!, { rotation: v })}
                    min={0}
                    max={360}
                    step={15}
                  />
                </div>
              </div>
            )}
            
            {/* Layers List */}
            {layers.length > 0 && (
              <div className="space-y-2">
                <Label>Camadas ({layers.length})</Label>
                <div className="space-y-1 max-h-[150px] overflow-y-auto">
                  {layers.map((layer, idx) => (
                    <div
                      key={layer.id}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                        selectedLayer === layer.id 
                          ? 'bg-amber-100 border-2 border-amber-300' 
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                      onClick={() => setSelectedLayer(layer.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">#{idx + 1}</span>
                        <span className="text-2xl">{layer.emoji}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLayer(layer.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Download Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => downloadImage('png')} 
                className="bg-amber-600 hover:bg-amber-700"
                disabled={layers.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                PNG
              </Button>
              <Button 
                onClick={() => downloadImage('jpg')} 
                variant="outline"
                disabled={layers.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                JPG
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
