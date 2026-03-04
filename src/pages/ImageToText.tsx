import { useState, useRef, useCallback } from 'react';
import { Image as ImageIcon, Upload, Download, Copy, RefreshCw, Settings2, Trash2, Crop, Instagram, MessageCircle, Twitter, Facebook, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// ============================================
// IMAGEM PARA ARTE DE TEXTO
// ============================================
// Converte imagens em arte ASCII/texto
// ============================================

const ASCII_CHARS = {
  'Simples': ' .:-=+*#%@',
  'Detalhado': ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
  'Blocos': ' ░▒▓█',
  'Números': ' 123456789',
  'Letras': ' .oO@',
  'Personalizado': '',
};

// Presets de redes sociais (largura em caracteres)
const SOCIAL_PRESETS = {
  'Instagram': { width: 55, label: 'Instagram (Posts/Stories)', icon: Instagram },
  'WhatsApp': { width: 40, label: 'WhatsApp', icon: MessageCircle },
  'Twitter': { width: 50, label: 'Twitter/X', icon: Twitter },
  'Facebook': { width: 60, label: 'Facebook', icon: Facebook },
  'Personalizado': { width: 80, label: 'Personalizado', icon: Settings2 },
};

export default function ImageToText() {
  const [image, setImage] = useState<string | null>(null);
  const [asciiArt, setAsciiArt] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState({
    width: 80,
    brightness: 1,
    contrast: 1,
    invert: false,
    charSet: 'Detalhado' as keyof typeof ASCII_CHARS,
    customChars: ' .:-=+*#%@',
    color: false,
  });
  
  // Crop state
  const [isCropping, setIsCropping] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [selectedPreset, setSelectedPreset] = useState<string>('Personalizado');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
      // Reset crop area
      setCropArea({ x: 0, y: 0, width: 100, height: 100 });
      toast.success('Imagem carregada!');
    };
    reader.readAsDataURL(file);
  };
  
  const applyCrop = () => {
    if (!image || !cropCanvasRef.current) return;
    
    const img = new Image();
    img.onload = () => {
      const canvas = cropCanvasRef.current!;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const cropX = (cropArea.x / 100) * img.width;
      const cropY = (cropArea.y / 100) * img.height;
      const cropWidth = (cropArea.width / 100) * img.width;
      const cropHeight = (cropArea.height / 100) * img.height;
      
      canvas.width = cropWidth;
      canvas.height = cropHeight;
      
      ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
      
      // Update image with cropped version
      setImage(canvas.toDataURL());
      setIsCropping(false);
      setCropArea({ x: 0, y: 0, width: 100, height: 100 });
      toast.success('Imagem recortada!');
    };
    img.src = image;
  };
  
  const applySocialPreset = (presetName: string) => {
    setSelectedPreset(presetName);
    const preset = SOCIAL_PRESETS[presetName as keyof typeof SOCIAL_PRESETS];
    if (preset) {
      setSettings(s => ({ ...s, width: preset.width }));
      toast.success(`Preset ${presetName} aplicado! Largura: ${preset.width} caracteres`);
    }
  };
  
  const processImage = useCallback(() => {
    if (!image || !canvasRef.current) return;
    
    setIsProcessing(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      // Calcular dimensões mantendo proporção
      const aspectRatio = img.height / img.width;
      const width = settings.width;
      const height = Math.floor(width * aspectRatio * 0.5); // 0.5 porque caracteres são mais altos que largos
      
      canvas.width = width;
      canvas.height = height;
      
      // Aplicar filtros
      ctx.filter = `brightness(${settings.brightness}) contrast(${settings.contrast})`;
      if (settings.invert) {
        ctx.filter += ' invert(1)';
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Obter dados da imagem
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      
      // Gerar ASCII
      const chars = settings.charSet === 'Personalizado' 
        ? settings.customChars 
        : ASCII_CHARS[settings.charSet];
      
      let ascii = '';
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const offset = (y * width + x) * 4;
          const r = data[offset];
          const g = data[offset + 1];
          const b = data[offset + 2];
          
          // Converter para escala de cinza
          const brightness = (r + g + b) / 3;
          const charIndex = Math.floor((brightness / 255) * (chars.length - 1));
          ascii += chars[charIndex];
        }
        ascii += '\n';
      }
      
      setAsciiArt(ascii);
      setIsProcessing(false);
      toast.success('Arte ASCII gerada!');
    };
    img.src = image;
  }, [image, settings, cropArea]);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(asciiArt);
    toast.success('Arte ASCII copiada!');
  };
  
  const downloadTxt = () => {
    const blob = new Blob([asciiArt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ascii-art.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Arquivo baixado!');
  };
  
  const clearImage = () => {
    setImage(null);
    setAsciiArt('');
    setIsCropping(false);
    setCropArea({ x: 0, y: 0, width: 100, height: 100 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-amber-100 rounded-full mb-2">
          <ImageIcon className="h-6 w-6 text-amber-700" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">Imagem → Arte de Texto</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Converta suas imagens em arte ASCII. Escolha presets para redes sociais!
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload e Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-amber-600" />
              Imagem Original
            </CardTitle>
            <CardDescription>
              Envie uma imagem para converter
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!image ? (
              <div 
                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-amber-300 hover:bg-amber-50/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">Clique para enviar uma imagem</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, GIF até 10MB</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border border-border">
                  <img 
                    src={image} 
                    alt="Preview" 
                    className="w-full h-auto max-h-[400px] object-contain"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={clearImage}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Crop controls */}
                {isCropping && (
                  <div className="p-4 bg-amber-50 rounded-lg space-y-3">
                    <p className="text-sm font-medium text-amber-800">Ajuste a área de recorte (%)</p>
                    
                    <div className="space-y-2">
                      <Label className="text-xs">Posição X: {cropArea.x}%</Label>
                      <Slider
                        value={[cropArea.x]}
                        onValueChange={([v]) => setCropArea(c => ({ ...c, x: v }))}
                        min={0}
                        max={100 - cropArea.width}
                        step={1}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs">Posição Y: {cropArea.y}%</Label>
                      <Slider
                        value={[cropArea.y]}
                        onValueChange={([v]) => setCropArea(c => ({ ...c, y: v }))}
                        min={0}
                        max={100 - cropArea.height}
                        step={1}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs">Largura: {cropArea.width}%</Label>
                      <Slider
                        value={[cropArea.width]}
                        onValueChange={([v]) => setCropArea(c => ({ ...c, width: Math.min(v, 100 - cropArea.x) }))}
                        min={10}
                        max={100}
                        step={1}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs">Altura: {cropArea.height}%</Label>
                      <Slider
                        value={[cropArea.height]}
                        onValueChange={([v]) => setCropArea(c => ({ ...c, height: Math.min(v, 100 - cropArea.y) }))}
                        min={10}
                        max={100}
                        step={1}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setIsCropping(false)} className="flex-1">
                        <X className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                      <Button size="sm" onClick={applyCrop} className="flex-1 bg-amber-600 hover:bg-amber-700">
                        <Check className="h-4 w-4 mr-1" />
                        Aplicar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* Configurações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-amber-600" />
              Configurações
            </CardTitle>
            <CardDescription>
              Ajuste os parâmetros da conversão
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Presets de redes sociais */}
            <div className="space-y-2">
              <Label>Rede Social (Preset)</Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(SOCIAL_PRESETS).map(([key, preset]) => {
                  const Icon = preset.icon;
                  return (
                    <Button
                      key={key}
                      variant={selectedPreset === key ? 'default' : 'outline'}
                      size="sm"
                      className={selectedPreset === key ? 'bg-amber-600 hover:bg-amber-700' : ''}
                      onClick={() => applySocialPreset(key)}
                    >
                      <Icon className="h-4 w-4 mr-1" />
                      {key}
                    </Button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Cada rede social tem uma largura ideal para o texto caber perfeitamente!
              </p>
            </div>
            
            {/* Recortar */}
            {image && (
              <div className="space-y-2">
                <Label>Recorte</Label>
                <Button
                  variant={isCropping ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIsCropping(!isCropping)}
                  className={isCropping ? 'bg-amber-600 hover:bg-amber-700' : ''}
                >
                  <Crop className="h-4 w-4 mr-1" />
                  {isCropping ? 'Cancelar Recorte' : 'Recortar Imagem'}
                </Button>
              </div>
            )}
            
            {/* Largura */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Largura (caracteres)</Label>
                <span className="text-sm text-muted-foreground">{settings.width}</span>
              </div>
              <Slider
                value={[settings.width]}
                onValueChange={([v]) => setSettings(s => ({ ...s, width: v }))}
                min={20}
                max={200}
                step={10}
              />
            </div>
            
            {/* Brilho */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Brilho</Label>
                <span className="text-sm text-muted-foreground">{settings.brightness.toFixed(1)}x</span>
              </div>
              <Slider
                value={[settings.brightness * 100]}
                onValueChange={([v]) => setSettings(s => ({ ...s, brightness: v / 100 }))}
                min={50}
                max={200}
                step={10}
              />
            </div>
            
            {/* Contraste */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Contraste</Label>
                <span className="text-sm text-muted-foreground">{settings.contrast.toFixed(1)}x</span>
              </div>
              <Slider
                value={[settings.contrast * 100]}
                onValueChange={([v]) => setSettings(s => ({ ...s, contrast: v / 100 }))}
                min={50}
                max={200}
                step={10}
              />
            </div>
            
            {/* Conjunto de caracteres */}
            <div className="space-y-2">
              <Label>Conjunto de caracteres</Label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(ASCII_CHARS).map((set) => (
                  <Button
                    key={set}
                    variant={settings.charSet === set ? 'default' : 'outline'}
                    size="sm"
                    className={settings.charSet === set ? 'bg-amber-600 hover:bg-amber-700' : ''}
                    onClick={() => setSettings(s => ({ ...s, charSet: set as keyof typeof ASCII_CHARS }))}
                  >
                    {set}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Caracteres personalizados */}
            {settings.charSet === 'Personalizado' && (
              <div className="space-y-2">
                <Label>Caracteres personalizados</Label>
                <input
                  type="text"
                  value={settings.customChars}
                  onChange={(e) => setSettings(s => ({ ...s, customChars: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  placeholder="Digite os caracteres do mais claro ao mais escuro"
                />
              </div>
            )}
            
            {/* Inverter */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="invert"
                checked={settings.invert}
                onChange={(e) => setSettings(s => ({ ...s, invert: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="invert" className="cursor-pointer">Inverter cores</Label>
            </div>
            
            <Button 
              onClick={processImage} 
              className="w-full bg-amber-600 hover:bg-amber-700"
              disabled={!image || isProcessing}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Gerar Arte ASCII
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Resultado */}
      {asciiArt && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="text-amber-600 text-xl">🎨</span>
                Resultado
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
                <Button variant="outline" size="sm" onClick={downloadTxt}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-4 overflow-auto max-h-[500px]">
              <pre className="font-mono text-xs leading-none whitespace-pre">
                {asciiArt}
              </pre>
            </div>
            
            {/* Info sobre a rede social */}
            <div className="mt-4 p-3 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Dica:</strong> Este texto foi otimizado para <Badge variant="secondary">{selectedPreset}</Badge> com largura de <Badge variant="secondary">{settings.width}</Badge> caracteres.
                Copie e cole diretamente na {selectedPreset === 'Personalizado' ? 'sua aplicação' : selectedPreset}!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Canvas oculto para processamento */}
      <canvas ref={canvasRef} className="hidden" />
      {/* Canvas oculto para recorte */}
      <canvas ref={cropCanvasRef} className="hidden" />
    </div>
  );
}
