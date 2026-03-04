import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Paintbrush, 
  Upload, 
  Download, 
  Undo, 
  Redo, 
  RotateCcw, 
  FlipHorizontal, 
  FlipVertical,
  Sun,
  Contrast,
  Trash2,
  Palette,
  Wand2,
  Eraser,
  Pencil,
  Square,
  Circle,
  Minus,
  Type,
  Crop,
  Check,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// ============================================
// EDITOR DE IMAGENS COMPLETO
// ============================================

type Tool = 'brush' | 'eraser' | 'line' | 'rect' | 'circle' | 'text';

interface HistoryState {
  dataUrl: string;
  width: number;
  height: number;
}

export default function ImageEditor() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>('brush');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  
  // Crop state
  const [isCropping, setIsCropping] = useState(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [cropEnd, setCropEnd] = useState<{ x: number; y: number } | null>(null);
  
  // Filtros
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    sepia: 0,
    grayscale: 0,
    invert: 0,
    hueRotate: 0,
  });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  
  // Inicializar canvas vazio
  useEffect(() => {
    if (canvasRef.current && !imageLoaded) {
      const canvas = canvasRef.current;
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#9ca3af';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Envie uma imagem para começar', canvas.width / 2, canvas.height / 2);
      }
    }
  }, []);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        if (!canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Limitar tamanho máximo
        const maxWidth = 1200;
        const maxHeight = 800;
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        
        setImageLoaded(true);
        
        // Salvar estado inicial
        saveState();
        
        toast.success('Imagem carregada!');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };
  
  const saveState = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      dataUrl: canvas.toDataURL(),
      width: canvas.width,
      height: canvas.height,
    });
    
    // Limitar histórico
    if (newHistory.length > 20) {
      newHistory.shift();
    }
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };
  
  const restoreState = (state: HistoryState) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      canvas.width = state.width;
      canvas.height = state.height;
      ctx.drawImage(img, 0, 0);
    };
    img.src = state.dataUrl;
  };
  
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      restoreState(history[newIndex]);
    }
  };
  
  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      restoreState(history[newIndex]);
    }
  };
  
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };
  
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const pos = getMousePos(e);
    
    if (isCropping) {
      setCropStart(pos);
      setCropEnd(pos);
      return;
    }
    
    if (tool === 'text') {
      setTextPosition(pos);
      setShowTextInput(true);
      return;
    }
    
    setIsDrawing(true);
    startPosRef.current = pos;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isCropping && cropStart) {
      const pos = getMousePos(e);
      setCropEnd(pos);
      return;
    }
    
    if (!isDrawing || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const pos = getMousePos(e);
    
    if (tool === 'brush' || tool === 'eraser') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };
  
  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isCropping) {
      return;
    }
    
    if (!isDrawing || !canvasRef.current || !startPosRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const pos = getMousePos(e);
    const startPos = startPosRef.current;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.fillStyle = color;
    
    switch (tool) {
      case 'line':
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        break;
      case 'rect':
        ctx.strokeRect(
          startPos.x,
          startPos.y,
          pos.x - startPos.x,
          pos.y - startPos.y
        );
        break;
      case 'circle':
        const radius = Math.sqrt(
          Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2)
        );
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        break;
    }
    
    setIsDrawing(false);
    startPosRef.current = null;
    saveState();
  };
  
  const applyCrop = () => {
    if (!canvasRef.current || !cropStart || !cropEnd) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const x = Math.min(cropStart.x, cropEnd.x);
    const y = Math.min(cropStart.y, cropEnd.y);
    const width = Math.abs(cropEnd.x - cropStart.x);
    const height = Math.abs(cropEnd.y - cropStart.y);
    
    if (width < 10 || height < 10) {
      toast.error('Área de corte muito pequena');
      setIsCropping(false);
      setCropStart(null);
      setCropEnd(null);
      return;
    }
    
    const imageData = ctx.getImageData(x, y, width, height);
    
    canvas.width = width;
    canvas.height = height;
    ctx.putImageData(imageData, 0, 0);
    
    setIsCropping(false);
    setCropStart(null);
    setCropEnd(null);
    saveState();
    toast.success('Imagem recortada!');
  };
  
  const cancelCrop = () => {
    setIsCropping(false);
    setCropStart(null);
    setCropEnd(null);
  };
  
  const addText = () => {
    if (!canvasRef.current || !textInput.trim()) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = color;
    ctx.font = `${brushSize * 3 + 10}px sans-serif`;
    ctx.fillText(textInput, textPosition.x, textPosition.y);
    
    setTextInput('');
    setShowTextInput(false);
    saveState();
  };
  
  const applyFilters = useCallback(() => {
    if (!canvasRef.current || historyIndex < 0) return;
    
    restoreState(history[0]);
    
    setTimeout(() => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;
      
      tempCtx.filter = `
        brightness(${filters.brightness}%)
        contrast(${filters.contrast}%)
        saturate(${filters.saturation}%)
        blur(${filters.blur}px)
        sepia(${filters.sepia}%)
        grayscale(${filters.grayscale}%)
        invert(${filters.invert}%)
        hue-rotate(${filters.hueRotate}deg)
      `;
      tempCtx.drawImage(canvas, 0, 0);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(tempCanvas, 0, 0);
      
      saveState();
      toast.success('Filtros aplicados!');
    }, 100);
  }, [filters, history, historyIndex]);
  
  const rotate = (degrees: number) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.height;
    tempCanvas.height = canvas.width;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    
    tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
    tempCtx.rotate((degrees * Math.PI) / 180);
    tempCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
    
    canvas.width = tempCanvas.width;
    canvas.height = tempCanvas.height;
    ctx.drawImage(tempCanvas, 0, 0);
    
    saveState();
  };
  
  const flip = (horizontal: boolean) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    
    tempCtx.scale(horizontal ? -1 : 1, horizontal ? 1 : -1);
    tempCtx.drawImage(canvas, horizontal ? -canvas.width : 0, horizontal ? 0 : -canvas.height);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tempCanvas, 0, 0);
    
    saveState();
  };
  
  const downloadImage = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `edited-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('Imagem baixada!');
  };
  
  const clearImage = () => {
    setImageLoaded(false);
    setHistory([]);
    setHistoryIndex(-1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Reset canvas
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#9ca3af';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Envie uma imagem para começar', canvas.width / 2, canvas.height / 2);
      }
    }
  };
  
  const resetFilters = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      sepia: 0,
      grayscale: 0,
      invert: 0,
      hueRotate: 0,
    });
    if (history[0]) {
      restoreState(history[0]);
    }
  };
  
  const colors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
    '#ffc0cb', '#a52a2a', '#808080', '#008000', '#000080',
  ];
  
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-amber-100 rounded-full mb-2">
          <Paintbrush className="h-6 w-6 text-amber-700" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">Editor de Imagens</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Edite suas imagens com filtros, ajustes e ferramentas de desenho. Tudo roda no seu navegador!
        </p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div 
              className="flex-1 border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-amber-300 hover:bg-amber-50/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex items-center justify-center gap-2">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {imageLoaded ? 'Trocar imagem' : 'Clique para enviar uma imagem'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF até 10MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Toolbar */}
      {imageLoaded && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}>
                <Undo className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
                <Redo className="h-4 w-4" />
              </Button>
              <div className="w-px h-6 bg-border mx-2" />
              <Button variant="outline" size="sm" onClick={() => rotate(90)}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => flip(true)}>
                <FlipHorizontal className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => flip(false)}>
                <FlipVertical className="h-4 w-4" />
              </Button>
              <div className="w-px h-6 bg-border mx-2" />
              <Button 
                variant={isCropping ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setIsCropping(!isCropping)}
                className={isCropping ? 'bg-amber-600' : ''}
              >
                <Crop className="h-4 w-4 mr-1" />
                Recortar
              </Button>
              <div className="w-px h-6 bg-border mx-2" />
              <Button variant="outline" size="sm" onClick={resetFilters}>
                <Wand2 className="h-4 w-4 mr-1" />
                Resetar
              </Button>
              <div className="flex-1" />
              <Button variant="outline" size="sm" onClick={clearImage}>
                <Trash2 className="h-4 w-4 mr-1" />
                Nova
              </Button>
              <Button size="sm" onClick={downloadImage} className="bg-amber-600 hover:bg-amber-700">
                <Download className="h-4 w-4 mr-1" />
                Salvar
              </Button>
            </div>
            
            {/* Crop controls */}
            {isCropping && (
              <div className="mt-3 p-3 bg-amber-50 rounded-lg flex items-center gap-3">
                <span className="text-sm text-amber-800">Arraste para selecionar a área</span>
                <div className="flex-1" />
                <Button size="sm" variant="outline" onClick={cancelCrop}>
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
                <Button size="sm" onClick={applyCrop} className="bg-amber-600 hover:bg-amber-700">
                  <Check className="h-4 w-4 mr-1" />
                  Aplicar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-4 gap-4">
        {/* Canvas */}
        <Card className="lg:col-span-3">
          <CardContent className="p-4 relative">
            <div 
              ref={containerRef}
              className="overflow-auto max-h-[600px] flex justify-center bg-muted rounded-lg"
            >
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className={`max-w-full ${isCropping ? 'cursor-crosshair' : tool === 'text' ? 'cursor-text' : tool === 'brush' || tool === 'eraser' ? 'cursor-crosshair' : 'cursor-default'}`}
                style={{ maxHeight: '600px' }}
              />
              
              {/* Crop overlay */}
              {isCropping && cropStart && cropEnd && containerRef.current && (
                <div
                  className="absolute border-2 border-amber-500 bg-amber-500/20 pointer-events-none"
                  style={{
                    left: `${Math.min(cropStart.x, cropEnd.x) * (containerRef.current.clientWidth / canvasRef.current!.width)}px`,
                    top: `${Math.min(cropStart.y, cropEnd.y) * (containerRef.current.clientHeight / canvasRef.current!.height)}px`,
                    width: `${Math.abs(cropEnd.x - cropStart.x) * (containerRef.current.clientWidth / canvasRef.current!.width)}px`,
                    height: `${Math.abs(cropEnd.y - cropStart.y) * (containerRef.current.clientHeight / canvasRef.current!.height)}px`,
                  }}
                />
              )}
            </div>
            
            {/* Text input overlay */}
            {showTextInput && (
              <div 
                className="absolute bg-white p-3 rounded-lg shadow-lg border"
                style={{
                  left: `${textPosition.x}px`,
                  top: `${textPosition.y}px`,
                }}
              >
                <Input
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Digite o texto..."
                  className="mb-2"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addText();
                    if (e.key === 'Escape') {
                      setShowTextInput(false);
                      setTextInput('');
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={addText} className="bg-amber-600 hover:bg-amber-700">
                    <Check className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    setShowTextInput(false);
                    setTextInput('');
                  }}>
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ferramentas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Ferramentas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="draw">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="draw">Desenho</TabsTrigger>
                <TabsTrigger value="filters">Filtros</TabsTrigger>
              </TabsList>
              
              <TabsContent value="draw" className="space-y-4">
                {/* Ferramentas de desenho */}
                <div className="grid grid-cols-3 gap-1">
                  <Button
                    variant={tool === 'brush' ? 'default' : 'outline'}
                    size="sm"
                    className={tool === 'brush' ? 'bg-amber-600' : ''}
                    onClick={() => setTool('brush')}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={tool === 'eraser' ? 'default' : 'outline'}
                    size="sm"
                    className={tool === 'eraser' ? 'bg-amber-600' : ''}
                    onClick={() => setTool('eraser')}
                  >
                    <Eraser className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={tool === 'line' ? 'default' : 'outline'}
                    size="sm"
                    className={tool === 'line' ? 'bg-amber-600' : ''}
                    onClick={() => setTool('line')}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={tool === 'rect' ? 'default' : 'outline'}
                    size="sm"
                    className={tool === 'rect' ? 'bg-amber-600' : ''}
                    onClick={() => setTool('rect')}
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={tool === 'circle' ? 'default' : 'outline'}
                    size="sm"
                    className={tool === 'circle' ? 'bg-amber-600' : ''}
                    onClick={() => setTool('circle')}
                  >
                    <Circle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={tool === 'text' ? 'default' : 'outline'}
                    size="sm"
                    className={tool === 'text' ? 'bg-amber-600' : ''}
                    onClick={() => setTool('text')}
                  >
                    <Type className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Tamanho do pincel */}
                <div className="space-y-2">
                  <Label className="text-xs">Tamanho: {brushSize}px</Label>
                  <Slider
                    value={[brushSize]}
                    onValueChange={([v]) => setBrushSize(v)}
                    min={1}
                    max={50}
                    step={1}
                  />
                </div>
                
                {/* Cores */}
                <div className="space-y-2">
                  <Label className="text-xs">Cor</Label>
                  <div className="grid grid-cols-5 gap-1">
                    {colors.map((c) => (
                      <button
                        key={c}
                        className={`w-6 h-6 rounded border-2 ${color === c ? 'border-amber-600' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                        onClick={() => setColor(c)}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-8 rounded cursor-pointer"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="filters" className="space-y-4">
                {/* Brilho */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    <Label className="text-xs">Brilho: {filters.brightness}%</Label>
                  </div>
                  <Slider
                    value={[filters.brightness]}
                    onValueChange={([v]) => setFilters(f => ({ ...f, brightness: v }))}
                    min={0}
                    max={200}
                    step={5}
                  />
                </div>
                
                {/* Contraste */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Contrast className="h-4 w-4" />
                    <Label className="text-xs">Contraste: {filters.contrast}%</Label>
                  </div>
                  <Slider
                    value={[filters.contrast]}
                    onValueChange={([v]) => setFilters(f => ({ ...f, contrast: v }))}
                    min={0}
                    max={200}
                    step={5}
                  />
                </div>
                
                {/* Saturação */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    <Label className="text-xs">Saturação: {filters.saturation}%</Label>
                  </div>
                  <Slider
                    value={[filters.saturation]}
                    onValueChange={([v]) => setFilters(f => ({ ...f, saturation: v }))}
                    min={0}
                    max={200}
                    step={5}
                  />
                </div>
                
                {/* Desfoque */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">〰</span>
                    <Label className="text-xs">Desfoque: {filters.blur}px</Label>
                  </div>
                  <Slider
                    value={[filters.blur]}
                    onValueChange={([v]) => setFilters(f => ({ ...f, blur: v }))}
                    min={0}
                    max={20}
                    step={0.5}
                  />
                </div>
                
                {/* Escala de cinza */}
                <div className="space-y-2">
                  <Label className="text-xs">Escala de cinza: {filters.grayscale}%</Label>
                  <Slider
                    value={[filters.grayscale]}
                    onValueChange={([v]) => setFilters(f => ({ ...f, grayscale: v }))}
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>
                
                {/* Sépia */}
                <div className="space-y-2">
                  <Label className="text-xs">Sépia: {filters.sepia}%</Label>
                  <Slider
                    value={[filters.sepia]}
                    onValueChange={([v]) => setFilters(f => ({ ...f, sepia: v }))}
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>
                
                {/* Inverter */}
                <div className="space-y-2">
                  <Label className="text-xs">Inverter: {filters.invert}%</Label>
                  <Slider
                    value={[filters.invert]}
                    onValueChange={([v]) => setFilters(f => ({ ...f, invert: v }))}
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>
                
                {/* Matiz */}
                <div className="space-y-2">
                  <Label className="text-xs">Matiz: {filters.hueRotate}°</Label>
                  <Slider
                    value={[filters.hueRotate]}
                    onValueChange={([v]) => setFilters(f => ({ ...f, hueRotate: v }))}
                    min={0}
                    max={360}
                    step={15}
                  />
                </div>
                
                <Button onClick={applyFilters} className="w-full bg-amber-600 hover:bg-amber-700">
                  <Wand2 className="h-4 w-4 mr-2" />
                  Aplicar Filtros
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
