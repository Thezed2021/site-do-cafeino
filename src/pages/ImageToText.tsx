import { useState, useRef, useCallback } from 'react';
import { Image as ImageIcon, Upload, Download, Copy, RefreshCw, Settings2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

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
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
      toast.success('Imagem carregada!');
    };
    reader.readAsDataURL(file);
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
  }, [image, settings]);
  
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
          Converta suas imagens em arte ASCII. Envie uma imagem e ajuste as configurações para obter o melhor resultado.
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
          </CardContent>
        </Card>
      )}

      {/* Canvas oculto para processamento */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
