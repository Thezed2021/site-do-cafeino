import { useState, useRef, useCallback } from 'react';
import { Video, Upload, Download, Settings2, Scissors, Film, Trash2, RefreshCw, Type, Smile } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// ============================================
// VÍDEO PARA GIF COM TEXTO E EMOJIS
// ============================================

interface Frame {
  dataUrl: string;
  delay: number;
}

interface TextOverlay {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  isEmoji: boolean;
}

export default function VideoToGif() {
  const [video, setVideo] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [frames, setFrames] = useState<Frame[]>([]);
  
  const [settings, setSettings] = useState({
    startTime: 0,
    duration: 3,
    fps: 10,
    width: 480,
    quality: 10,
  });
  
  // Text overlays
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [newText, setNewText] = useState('');
  const [textX, setTextX] = useState(50);
  const [textY, setTextY] = useState(50);
  const [textSize, setTextSize] = useState(30);
  const [textColor, setTextColor] = useState('#ffffff');
  const [isEmoji, setIsEmoji] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('video/')) {
      toast.error('Por favor, selecione um vídeo válido');
      return;
    }
    
    const url = URL.createObjectURL(file);
    setVideo(url);
    setGifUrl(null);
    setFrames([]);
    setTextOverlays([]);
    toast.success('Vídeo carregado!');
  };
  
  const handleVideoLoaded = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
      setSettings(s => ({ ...s, startTime: 0, duration: Math.min(3, videoRef.current!.duration) }));
    }
  };
  
  const addTextOverlay = () => {
    if (!newText.trim()) {
      toast.error('Digite um texto ou emoji');
      return;
    }
    
    setTextOverlays([...textOverlays, {
      text: newText,
      x: textX,
      y: textY,
      fontSize: textSize,
      color: textColor,
      isEmoji: isEmoji,
    }]);
    
    setNewText('');
    toast.success(isEmoji ? 'Emoji adicionado!' : 'Texto adicionado!');
    
    // Atualizar preview
    updatePreview();
  };
  
  const removeTextOverlay = (index: number) => {
    setTextOverlays(textOverlays.filter((_, i) => i !== index));
    updatePreview();
  };
  
  const updatePreview = () => {
    if (!videoRef.current || !previewCanvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const aspectRatio = video.videoHeight / video.videoWidth;
    canvas.width = settings.width;
    canvas.height = settings.width * aspectRatio;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Draw text overlays
    textOverlays.forEach(overlay => {
      if (overlay.isEmoji) {
        ctx.font = `${overlay.fontSize}px serif`;
        ctx.fillText(overlay.text, (overlay.x / 100) * canvas.width, (overlay.y / 100) * canvas.height);
      } else {
        ctx.fillStyle = overlay.color;
        ctx.font = `bold ${overlay.fontSize}px sans-serif`;
        ctx.strokeStyle = 'black';
        ctx.lineWidth = overlay.fontSize / 10;
        ctx.strokeText(overlay.text, (overlay.x / 100) * canvas.width, (overlay.y / 100) * canvas.height);
        ctx.fillText(overlay.text, (overlay.x / 100) * canvas.width, (overlay.y / 100) * canvas.height);
      }
    });
  };
  
  const captureFrames = useCallback(async (): Promise<Frame[]> => {
    if (!videoRef.current || !canvasRef.current) return [];
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];
    
    const capturedFrames: Frame[] = [];
    const frameCount = Math.floor(settings.duration * settings.fps);
    const frameInterval = 1 / settings.fps;
    
    // Pausar vídeo
    video.pause();
    
    // Configurar canvas
    const aspectRatio = video.videoHeight / video.videoWidth;
    canvas.width = settings.width;
    canvas.height = settings.width * aspectRatio;
    
    for (let i = 0; i < frameCount; i++) {
      const time = settings.startTime + (i * frameInterval);
      video.currentTime = time;
      
      // Aguardar o vídeo seek
      await new Promise<void>(resolve => {
        const onSeeked = () => {
          video.removeEventListener('seeked', onSeeked);
          resolve();
        };
        video.addEventListener('seeked', onSeeked);
      });
      
      // Desenhar frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Aplicar text overlays
      textOverlays.forEach(overlay => {
        if (overlay.isEmoji) {
          ctx.font = `${overlay.fontSize}px serif`;
          ctx.fillText(overlay.text, (overlay.x / 100) * canvas.width, (overlay.y / 100) * canvas.height);
        } else {
          ctx.fillStyle = overlay.color;
          ctx.font = `bold ${overlay.fontSize}px sans-serif`;
          ctx.strokeStyle = 'black';
          ctx.lineWidth = overlay.fontSize / 10;
          ctx.strokeText(overlay.text, (overlay.x / 100) * canvas.width, (overlay.y / 100) * canvas.height);
          ctx.fillText(overlay.text, (overlay.x / 100) * canvas.width, (overlay.y / 100) * canvas.height);
        }
      });
      
      capturedFrames.push({
        dataUrl: canvas.toDataURL('image/jpeg', 0.8),
        delay: Math.round(frameInterval * 1000),
      });
      
      setProgress(Math.round(((i + 1) / frameCount) * 50));
    }
    
    return capturedFrames;
  }, [settings, textOverlays]);
  
  const createGif = useCallback(async (capturedFrames: Frame[]) => {
    if (capturedFrames.length === 0) return;
    
    try {
      const gifshot = await import('gifshot');
      
      const images = capturedFrames.map(f => f.dataUrl);
      
      gifshot.createGIF({
        images,
        gifWidth: settings.width,
        gifHeight: Math.round(settings.width * (frames[0]?.dataUrl ? 0.75 : 0.75)),
        interval: 1 / settings.fps,
        numFrames: images.length,
        frameDuration: 1 / settings.fps,
        sampleInterval: settings.quality,
        progressCallback: (captureProgress: number) => {
          setProgress(50 + Math.round(captureProgress * 50));
        },
      }, (result: { error: boolean; image?: string; errorMsg?: string }) => {
        if (result.error) {
          toast.error('Erro ao criar GIF: ' + result.errorMsg);
        } else if (result.image) {
          setGifUrl(result.image);
          toast.success('GIF criado com sucesso!');
        }
        setIsProcessing(false);
        setProgress(0);
      });
    } catch (error) {
      toast.error('Erro ao criar GIF');
      setIsProcessing(false);
    }
  }, [settings]);
  
  const generateGif = async () => {
    if (!video) {
      toast.error('Carregue um vídeo primeiro');
      return;
    }
    
    setIsProcessing(true);
    setProgress(0);
    
    try {
      const capturedFrames = await captureFrames();
      setFrames(capturedFrames);
      await createGif(capturedFrames);
    } catch (error) {
      toast.error('Erro ao processar vídeo');
      setIsProcessing(false);
    }
  };
  
  const downloadGif = () => {
    if (!gifUrl) return;
    
    const a = document.createElement('a');
    a.href = gifUrl;
    a.download = `animated-${Date.now()}.gif`;
    a.click();
    toast.success('GIF baixado!');
  };
  
  const clearVideo = () => {
    if (video) {
      URL.revokeObjectURL(video);
    }
    setVideo(null);
    setGifUrl(null);
    setFrames([]);
    setTextOverlays([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const commonEmojis = ['😀', '😂', '🥰', '😎', '🤔', '👍', '❤️', '🔥', '✨', '🎉', '😭', '😡', '👏', '🙏', '💯'];
  
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-amber-100 rounded-full mb-2">
          <Video className="h-6 w-6 text-amber-700" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">Vídeo → GIF</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Converta seus vídeos em GIFs animados. Adicione textos e emojis!
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload e Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Film className="h-5 w-5 text-amber-600" />
              Vídeo Original
            </CardTitle>
            <CardDescription>
              Envie um vídeo para converter
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!video ? (
              <div 
                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-amber-300 hover:bg-amber-50/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">Clique para enviar um vídeo</p>
                <p className="text-xs text-muted-foreground">MP4, WEBM, MOV até 50MB</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border border-border bg-black">
                  <video
                    ref={videoRef}
                    src={video}
                    className="w-full h-auto max-h-[300px]"
                    onLoadedMetadata={handleVideoLoaded}
                    controls
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={clearVideo}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Preview Canvas com overlays */}
                {textOverlays.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm">Preview com textos/emojis:</Label>
                    <div className="rounded-lg overflow-hidden border border-border">
                      <canvas
                        ref={previewCanvasRef}
                        className="w-full h-auto max-h-[200px]"
                      />
                    </div>
                  </div>
                )}
                
                {videoDuration > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary">Duração: {formatTime(videoDuration)}</Badge>
                    <Badge variant="secondary">{Math.round(settings.width)}px</Badge>
                  </div>
                )}
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* Configurações e Texto/Emojis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-amber-600" />
              Configurações
            </CardTitle>
            <CardDescription>
              Ajuste os parâmetros do GIF
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="settings">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="settings">GIF</TabsTrigger>
                <TabsTrigger value="text">Texto/Emojis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="settings" className="space-y-4">
                {/* Tempo de início */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Tempo de início</Label>
                    <span className="text-sm text-muted-foreground">{settings.startTime.toFixed(1)}s</span>
                  </div>
                  <Slider
                    value={[settings.startTime]}
                    onValueChange={([v]) => setSettings(s => ({ ...s, startTime: v }))}
                    min={0}
                    max={Math.max(0, videoDuration - settings.duration)}
                    step={0.1}
                    disabled={!video}
                  />
                </div>
                
                {/* Duração */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Duração do GIF</Label>
                    <span className="text-sm text-muted-foreground">{settings.duration.toFixed(1)}s</span>
                  </div>
                  <Slider
                    value={[settings.duration]}
                    onValueChange={([v]) => setSettings(s => ({ ...s, duration: Math.min(v, 10) }))}
                    min={0.5}
                    max={Math.min(10, videoDuration - settings.startTime)}
                    step={0.5}
                    disabled={!video}
                  />
                  <p className="text-xs text-muted-foreground">Máximo recomendado: 10 segundos</p>
                </div>
                
                {/* FPS */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>FPS (Frames por segundo)</Label>
                    <span className="text-sm text-muted-foreground">{settings.fps}</span>
                  </div>
                  <Slider
                    value={[settings.fps]}
                    onValueChange={([v]) => setSettings(s => ({ ...s, fps: v }))}
                    min={5}
                    max={30}
                    step={1}
                    disabled={!video}
                  />
                </div>
                
                {/* Largura */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Largura do GIF</Label>
                    <span className="text-sm text-muted-foreground">{settings.width}px</span>
                  </div>
                  <Slider
                    value={[settings.width]}
                    onValueChange={([v]) => setSettings(s => ({ ...s, width: v }))}
                    min={240}
                    max={720}
                    step={60}
                    disabled={!video}
                  />
                </div>
                
                {/* Qualidade */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Qualidade</Label>
                    <span className="text-sm text-muted-foreground">
                      {settings.quality <= 5 ? 'Alta' : settings.quality <= 15 ? 'Média' : 'Baixa'}
                    </span>
                  </div>
                  <Slider
                    value={[settings.quality]}
                    onValueChange={([v]) => setSettings(s => ({ ...s, quality: v }))}
                    min={1}
                    max={30}
                    step={1}
                    disabled={!video}
                  />
                </div>
                
                {/* Presets */}
                <div className="space-y-2">
                  <Label>Presets rápidos</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!video}
                      onClick={() => setSettings({
                        startTime: 0,
                        duration: 2,
                        fps: 15,
                        width: 480,
                        quality: 10,
                      })}
                    >
                      Redes Sociais
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!video}
                      onClick={() => setSettings({
                        startTime: 0,
                        duration: 5,
                        fps: 10,
                        width: 320,
                        quality: 15,
                      })}
                    >
                      Compacto
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!video}
                      onClick={() => setSettings({
                        startTime: 0,
                        duration: 3,
                        fps: 20,
                        width: 640,
                        quality: 5,
                      })}
                    >
                      Alta Qualidade
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="text" className="space-y-4">
                {/* Adicionar texto/emoji */}
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button
                      variant={!isEmoji ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setIsEmoji(false)}
                      className={!isEmoji ? 'bg-amber-600' : ''}
                    >
                      <Type className="h-4 w-4 mr-1" />
                      Texto
                    </Button>
                    <Button
                      variant={isEmoji ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setIsEmoji(true)}
                      className={isEmoji ? 'bg-amber-600' : ''}
                    >
                      <Smile className="h-4 w-4 mr-1" />
                      Emoji
                    </Button>
                  </div>
                  
                  <Input
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder={isEmoji ? "Cole um emoji aqui..." : "Digite o texto..."}
                  />
                  
                  {/* Emojis rápidos */}
                  {isEmoji && (
                    <div className="flex flex-wrap gap-1">
                      {commonEmojis.map((emoji) => (
                        <Button
                          key={emoji}
                          variant="outline"
                          size="sm"
                          className="text-lg p-1 h-auto"
                          onClick={() => setNewText(emoji)}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  {/* Posição X */}
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <Label className="text-xs">Posição X: {textX}%</Label>
                    </div>
                    <Slider
                      value={[textX]}
                      onValueChange={([v]) => setTextX(v)}
                      min={0}
                      max={100}
                      step={5}
                    />
                  </div>
                  
                  {/* Posição Y */}
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <Label className="text-xs">Posição Y: {textY}%</Label>
                    </div>
                    <Slider
                      value={[textY]}
                      onValueChange={([v]) => setTextY(v)}
                      min={0}
                      max={100}
                      step={5}
                    />
                  </div>
                  
                  {/* Tamanho */}
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <Label className="text-xs">Tamanho: {textSize}px</Label>
                    </div>
                    <Slider
                      value={[textSize]}
                      onValueChange={([v]) => setTextSize(v)}
                      min={10}
                      max={100}
                      step={5}
                    />
                  </div>
                  
                  {/* Cor (apenas para texto) */}
                  {!isEmoji && (
                    <div className="space-y-1">
                      <Label className="text-xs">Cor</Label>
                      <div className="flex gap-2">
                        {['#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'].map((c) => (
                          <button
                            key={c}
                            className={`w-6 h-6 rounded border-2 ${textColor === c ? 'border-amber-600' : 'border-gray-300'}`}
                            style={{ backgroundColor: c }}
                            onClick={() => setTextColor(c)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    onClick={addTextOverlay} 
                    className="w-full bg-amber-600 hover:bg-amber-700"
                    disabled={!video}
                  >
                    {isEmoji ? 'Adicionar Emoji' : 'Adicionar Texto'}
                  </Button>
                </div>
                
                {/* Lista de overlays */}
                {textOverlays.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm">Adicionados:</Label>
                    <div className="space-y-1 max-h-[150px] overflow-y-auto">
                      {textOverlays.map((overlay, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-lg">{overlay.text}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTextOverlay(idx)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <Button 
              onClick={generateGif} 
              className="w-full bg-amber-600 hover:bg-amber-700"
              disabled={!video || isProcessing}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processando... {progress}%
                </>
              ) : (
                <>
                  <Scissors className="h-4 w-4 mr-2" />
                  Gerar GIF
                </>
              )}
            </Button>
            
            {isProcessing && (
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-amber-600 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resultado */}
      {gifUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="text-amber-600 text-xl">🎬</span>
                GIF Gerado
              </span>
              <Button variant="outline" size="sm" onClick={downloadGif}>
                <Download className="h-4 w-4 mr-2" />
                Baixar GIF
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <img 
                src={gifUrl} 
                alt="GIF gerado" 
                className="max-w-full rounded-lg border border-border"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Canvas oculto */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
