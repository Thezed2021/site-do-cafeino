import { useState, useEffect } from 'react';
import { Copy, RefreshCw, Sparkles, Type, Eye, EyeOff, Wand2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// ============================================
// CRIADOR DE NICK E CARACTERES
// ============================================
// Esta página contém várias ferramentas para criar
// nicknames estilosos e caracteres especiais
// ============================================

// Conjuntos de caracteres
const fancyFonts: Record<string, string[] | ((text: string) => string)> = {
  'Serif': ['𝐀', '𝐁', '𝐂', '𝐃', '𝐄', '𝐅', '𝐆', '𝐇', '𝐈', '𝐉', '𝐊', '𝐋', '𝐌', '𝐍', '𝐎', '𝐏', '𝐐', '𝐑', '𝐒', '𝐓', '𝐔', '𝐕', '𝐖', '𝐗', '𝐘', '𝐙', '𝐚', '𝐛', '𝐜', '𝐝', '𝐞', '𝐟', '𝐠', '𝐡', '𝐢', '𝐣', '𝐤', '𝐥', '𝐦', '𝐧', '𝐨', '𝐩', '𝐪', '𝐫', '𝐬', '𝐭', '𝐮', '𝐯', '𝐰', '𝐱', '𝐲', '𝐳'],
  'Sans Bold': ['𝗔', '𝗕', '𝗖', '𝗗', '𝗘', '𝗙', '𝗚', '𝗛', '𝗜', '𝗝', '𝗞', '𝗟', '𝗠', '𝗡', '𝗢', '𝗣', '𝗤', '𝗥', '𝗦', '𝗧', '𝗨', '𝗩', '𝗪', '𝗫', '𝗬', '𝗭', '𝗮', '𝗯', '𝗰', '𝗱', '𝗲', '𝗳', '𝗴', '𝗵', '𝗶', '𝗷', '𝗸', '𝗹', '𝗺', '𝗻', '𝗼', '𝗽', '𝗾', '𝗿', '𝘀', '𝘁', '𝘂', '𝘃', '𝘄', '𝘅', '𝘆', '𝘇'],
  'Italic': ['𝐴', '𝐵', '𝐶', '𝐷', '𝐸', '𝐹', '𝐺', '𝐻', '𝐼', '𝐽', '𝐾', '𝐿', '𝑀', '𝑁', '𝑂', '𝑃', '𝑄', '𝑅', '𝑆', '𝑇', '𝑈', '𝑉', '𝑊', '𝑋', '𝑌', '𝑍', '𝑎', '𝑏', '𝑐', '𝑑', '𝑒', '𝑓', '𝑔', 'ℎ', '𝑖', '𝑗', '𝑘', '𝑙', '𝑚', '𝑛', '𝑜', '𝑝', '𝑞', '𝑟', '𝑠', '𝑡', '𝑢', '𝑣', '𝑤', '𝑥', '𝑦', '𝑧'],
  'Bold Italic': ['𝑨', '𝑩', '𝑪', '𝑫', '𝑬', '𝑭', '𝑮', '𝑯', '𝑰', '𝑱', '𝑲', '𝑳', '𝑴', '𝑵', '𝑶', '𝑷', '𝑸', '𝑹', '𝑺', '𝑻', '𝑼', '𝑽', '𝑾', '𝑿', '𝒀', '𝒁', '𝒂', '𝒃', '𝒄', '𝒅', '𝒆', '𝒇', '𝒈', '𝒉', '𝒊', '𝒋', '𝒌', '𝒍', '𝒎', '𝒏', '𝒐', '𝒑', '𝒒', '𝒓', '𝒔', '𝒕', '𝒖', '𝒗', '𝒘', '𝒙', '𝒚', '𝒛'],
  'Script': ['𝒜', 'ℬ', '𝒞', '𝒟', 'ℰ', 'ℱ', '𝒢', 'ℋ', 'ℐ', '𝒥', '𝒦', 'ℒ', 'ℳ', '𝒩', '𝒪', '𝒫', '𝒬', 'ℛ', '𝒮', '𝒯', '𝒰', '𝒱', '𝒲', '𝒳', '𝒴', '𝒵', '𝒶', '𝒷', '𝒸', '𝒹', 'ℯ', '𝒻', 'ℊ', '𝒽', '𝒾', '𝒿', '𝓀', '𝓁', '𝓂', '𝓃', 'ℴ', '𝓅', '𝓆', '𝓇', '𝓈', '𝓉', '𝓊', '𝓋', '𝓌', '𝓍', '𝓎', '𝓏'],
  'Bold Script': ['𝓐', '𝓑', '𝓒', '𝓓', '𝓔', '𝓕', '𝓖', '𝓗', '𝓘', '𝓙', '𝓚', '𝓛', '𝓜', '𝓝', '𝓞', '𝓟', '𝓠', '𝓡', '𝓢', '𝓣', '𝓤', '𝓥', '𝓦', '𝓧', '𝓨', '𝓩', '𝓪', '𝓫', '𝓬', '𝓭', '𝓮', '𝓯', '𝓰', '𝓱', '𝓲', '𝓳', '𝓴', '𝓵', '𝓶', '𝓷', '𝓸', '𝓹', '𝓺', '𝓻', '𝓼', '𝓽', '𝓾', '𝓿', '𝔀', '𝔁', '𝔂', '𝔃'],
  'Fraktur': ['𝔄', '𝔅', 'ℭ', '𝔇', '𝔈', '𝔉', '𝔊', 'ℌ', 'ℑ', '𝔍', '𝔎', '𝔏', '𝔐', '𝔑', '𝔒', '𝔓', '𝔔', 'ℜ', '𝔖', '𝔗', '𝔘', '𝔙', '𝔚', '𝔛', '𝔜', 'ℨ', '𝔞', '𝔟', '𝔠', '𝔡', '𝔢', '𝔣', '𝔤', '𝔥', '𝔦', '𝔧', '𝔨', '𝔩', '𝔪', '𝔫', '𝔬', '𝔭', '𝔮', '𝔯', '𝔰', '𝔱', '𝔲', '𝔳', '𝔴', '𝔵', '𝔶', '𝔷'],
  'Double Struck': ['𝔸', '𝔹', 'ℂ', '𝔻', '𝔼', '𝔽', '𝔾', 'ℍ', '𝕀', '𝕁', '𝕂', '𝕃', '𝕄', 'ℕ', '𝕆', 'ℙ', 'ℚ', 'ℝ', '𝕊', '𝕋', '𝕌', '𝕍', '𝕎', '𝕏', '𝕐', 'ℤ', '𝕒', '𝕓', '𝕔', '𝕕', '𝕖', '𝕗', '𝕘', '𝕙', '𝕚', '𝕛', '𝕜', '𝕝', '𝕞', '𝕟', '𝕠', '𝕡', '𝕢', '𝕣', '𝕤', '𝕥', '𝕦', '𝕧', '𝕨', '𝕩', '𝕪', '𝕫'],
  'Circle': ['Ⓐ', 'Ⓑ', 'Ⓒ', 'Ⓓ', 'Ⓔ', 'Ⓕ', 'Ⓖ', 'Ⓗ', 'Ⓘ', 'Ⓙ', 'Ⓚ', 'Ⓛ', 'Ⓜ', 'Ⓝ', 'Ⓞ', 'Ⓟ', 'Ⓠ', 'Ⓡ', 'Ⓢ', 'Ⓣ', 'Ⓤ', 'Ⓥ', 'Ⓦ', 'Ⓧ', 'Ⓨ', 'Ⓩ', 'ⓐ', 'ⓑ', 'ⓒ', 'ⓓ', 'ⓔ', 'ⓕ', 'ⓖ', 'ⓗ', 'ⓘ', 'ⓙ', 'ⓚ', 'ⓛ', 'ⓜ', 'ⓝ', 'ⓞ', 'ⓟ', 'ⓠ', 'ⓡ', 'ⓢ', 'ⓣ', 'ⓤ', 'ⓥ', 'ⓦ', 'ⓧ', 'ⓨ', 'ⓩ'],
  'Square': ['🄰', '🄱', '🄲', '🄳', '🄴', '🄵', '🄶', '🄷', '🄸', '🄹', '🄺', '🄻', '🄼', '🄽', '🄾', '🄿', '🅀', '🅁', '🅂', '🅃', '🅄', '🅅', '🅆', '🅇', '🅈', '🅉', '🅰', '🅱', '🅲', '🅳', '🅴', '🅵', '🅶', '🅷', '🅸', '🅹', '🅺', '🅻', '🅼', '🅽', '🅾', '🅿', '🆀', '🆁', '🆂', '🆃', '🆄', '🆅', '🆆', '🆇', '🆈', '🆉'],
  'Small Caps': ['ᴀ', 'ʙ', 'ᴄ', 'ᴅ', 'ᴇ', 'ғ', 'ɢ', 'ʜ', 'ɪ', 'ᴊ', 'ᴋ', 'ʟ', 'ᴍ', 'ɴ', 'ᴏ', 'ᴘ', 'ǫ', 'ʀ', 's', 'ᴛ', 'ᴜ', 'ᴠ', 'ᴡ', 'x', 'ʏ', 'ᴢ', 'ᴀ', 'ʙ', 'ᴄ', 'ᴅ', 'ᴇ', 'ғ', 'ɢ', 'ʜ', 'ɪ', 'ᴊ', 'ᴋ', 'ʟ', 'ᴍ', 'ɴ', 'ᴏ', 'ᴘ', 'ǫ', 'ʀ', 's', 'ᴛ', 'ᴜ', 'ᴠ', 'ᴡ', 'x', 'ʏ', 'ᴢ'],
  'Strikethrough': (text: string) => text.split('').map(c => c + '\u0336').join(''),
  'Underline': (text: string) => text.split('').map(c => c + '\u0332').join(''),
  'Double Underline': (text: string) => text.split('').map(c => c + '\u0333').join(''),
  'Overline': (text: string) => text.split('').map(c => c + '\u0305').join(''),
  'Slash': (text: string) => text.split('').map(c => c + '\u0338').join(''),
};

const specialSymbols = {
  'Estrelas': ['★', '☆', '✡', '✦', '✧', '✩', '✪', '✫', '✬', '✭', '✮', '✯', '✰', '⁂', '✢', '✣', '✤', '✥'],
  'Corações': ['❤', '♥', '♡', '❥', '❣', '❦', '❧', '💕', '💖', '💗', '💘', '💙', '💚', '💛', '💜', '🖤'],
  'Setas': ['→', '←', '↑', '↓', '↔', '↕', '➔', '➜', '➞', '➟', '➠', '➡', '➢', '➣', '➤', '➥', '➦', '➧', '➨', '➩', '➪', '➫', '➬', '➭', '➮', '➯', '➱', '➲', '➳', '➴', '➵', '➶', '➷', '➸', '➹', '➺', '➻', '➼', '➽', '➾'],
  'Matemáticos': ['∞', '∑', '∏', '√', '∛', '∜', '∫', '∬', '∭', '∮', '∯', '∰', '∱', '∲', '∳', '∀', '∁', '∂', '∃', '∄', '∅', '∆', '∇', '∈', '∉', '∊', '∋', '∌', '∍', '∎'],
  'Moedas': ['¢', '$', '€', '£', '¥', '₠', '₡', '₢', '₣', '₤', '₥', '₦', '₧', '₨', '₩', '₪', '₫', '₭', '₮', '₯', '₰', '₱', '₲', '₳', '₴', '₵', '₶', '₷', '₸', '₹', '₺', '₻', '₼', '₽', '₾', '₿'],
  'Clima': ['☀', '☁', '☂', '☃', '☄', '☉', '☼', '☽', '☾', '♁', '♨', '❄', '❅', '❆', '🌙', '⭐', '🌟', '🌠', '🌡', '⛅', '⛈', '🌤', '🌥', '🌦', '🌧', '🌨', '🌩', '🌪', '🌫', '🌬'],
  'Música': ['♩', '♪', '♫', '♬', '♭', '♮', '♯', '°', 'ø', '؂', '≭', '𝄞', '𝄢', '𝄪', '𝄫', '🎵', '🎶', '🎼', '🎤', '🎧', '🎷', '🎸', '🎹', '🎺', '🎻', '🥁'],
  'Zodíaco': ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '⛎'],
  'Cartas': ['♠', '♥', '♦', '♣', '♤', '♡', '♢', '♧', '🂠', '🂡', '🂢', '🂣', '🂤', '🂥', '🂦', '🂧', '🂨', '🂩', '🂪', '🂫', '🂬', '🂭', '🂮', '🂱', '🂲', '🂳', '🂴', '🂵', '🂶', '🂷', '🂸', '🂹', '🂺', '🂻', '🂼', '🂽', '🂾', '🂿'],
  'Dados': ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'],
  'Xadrez': ['♔', '♕', '♖', '♗', '♘', '♙', '♚', '♛', '♜', '♝', '♞', '♟'],
  'Flores': ['❀', '✿', '❁', '✾', '✽', '❃', '❋', '✤', '✱', '✲', '✳', '✴', '✵', '✶', '✷', '✸', '✹', '✺', '✻', '✼', '❊', '❋', '🌸', '🌺', '🌻', '🌼', '🌷', '💐', '🌹', '🥀', '🌱', '🌿', '☘', '🍀'],
  'Carinhas': ['☺', '☻', '☹', '♠', '♣', '♥', '♦', '•', '◘', '○', '◙', '♂', '♀', '♪', '♫', '☼', '►', '◄', '↕', '‼', '¶', '§', '▬', '↨', '↑', '↓', '→', '←', '∟', '↔', '▲', '▼'],
};

const invisibleChars = [
  { char: '\u200B', name: 'Zero Width Space', desc: 'Espaço invisível' },
  { char: '\u200C', name: 'Zero Width Non-Joiner', desc: 'Não conector' },
  { char: '\u200D', name: 'Zero Width Joiner', desc: 'Conector invisível' },
  { char: '\u2060', name: 'Word Joiner', desc: 'Junta palavras' },
  { char: '\uFEFF', name: 'Zero Width No-Break Space', desc: 'Espaço sem quebra' },
  { char: '\u180E', name: 'Mongolian Vowel Separator', desc: 'Separador mongol' },
  { char: '\u200E', name: 'Left-to-Right Mark', desc: 'Marca LTR' },
  { char: '\u200F', name: 'Right-to-Left Mark', desc: 'Marca RTL' },
  { char: '\u202A', name: 'Left-to-Right Embedding', desc: 'Incorporação LTR' },
  { char: '\u202B', name: 'Right-to-Left Embedding', desc: 'Incorporação RTL' },
  { char: '\u202C', name: 'Pop Directional Formatting', desc: 'Pop direcional' },
  { char: '\u202D', name: 'Left-to-Right Override', desc: 'Sobreposição LTR' },
  { char: '\u202E', name: 'Right-to-Left Override', desc: 'Sobreposição RTL' },
  { char: '\u2061', name: 'Function Application', desc: 'Aplicação função' },
  { char: '\u2062', name: 'Invisible Times', desc: 'Multiplicação invisível' },
  { char: '\u2063', name: 'Invisible Separator', desc: 'Separador invisível' },
  { char: '\u2064', name: 'Invisible Plus', desc: 'Adição invisível' },
  { char: '\u206A', name: 'Inhibit Symmetric Swapping', desc: 'Inibir troca' },
  { char: '\u206B', name: 'Activate Symmetric Swapping', desc: 'Ativar troca' },
  { char: '\u206C', name: 'Inhibit Arabic Form Shaping', desc: 'Inibir forma árabe' },
  { char: '\u206D', name: 'Activate Arabic Form Shaping', desc: 'Ativar forma árabe' },
  { char: '\u206E', name: 'National Digit Shapes', desc: 'Formas dígitos' },
  { char: '\u206F', name: 'Nominal Digit Shapes', desc: 'Dígitos nominais' },
];

const asciiArts = [
  {
    name: 'Café',
    art: `  ☕
  ))
  ((
  ))
 /__\\`,
  },
  {
    name: 'Coração',
    art: `  ❤️❤️❤️   ❤️❤️❤️
❤️❤️❤️❤️❤️❤️❤️❤️❤️
❤️❤️❤️❤️❤️❤️❤️❤️❤️
 ❤️❤️❤️❤️❤️❤️❤️
  ❤️❤️❤️❤️❤️
    ❤️❤️❤️
      ❤️`,
  },
  {
    name: 'Gato',
    art: ` /\\_/\\
( o.o )
 > ^ <`,
  },
  {
    name: 'Cachorro',
    art: `  / \\__
 (    @\\___
 /         O
/   (_____/
/_____/   U`,
  },
  {
    name: 'Nota Musical',
    art: `   ♪
  ♫
  ♩
 ╱│╲
╱ │ ╲
  │
 ╱ ╲`,
  },
  {
    name: 'Fogo',
    art: `    )
   (    )
  (  (   )
 (    )  )
(  (   )  )
  |   |
  |   |`,
  },
  {
    name: 'Rosa',
    art: `   @}-;-'---
   |    |
   |    |
   \\   /
    \\ /
     |`,
  },
  {
    name: 'Estrela',
    art: `    /\\
   /  \\
  / *  \\
 /  *   \\
/   *    \\
\\\\   *   /
 \\\\  *  /
  \\\\  /
   \\\\/`,
  },
  {
    name: 'Lua',
    art: `    .-.
   ( (
    \\\
     \\\
      \\\
       \\\
        \\\
         \\\
          \\\
           \\\
            '-.`,
  },
  {
    name: 'Sol',
    art: `      \\   /
       \\ /
    .--( )--.
   /   / \\   \\
  /   /   \\   \\
 '   /     \\   '
    /       \\
   /         \\
  '           '`,
  },
  {
    name: 'Flecha',
    art: `      |
      |
      |
      |
------|------>
      |
      |
      |
      |`,
  },
  {
    name: 'Espada',
    art: `      /|
     / |
    /  |
   /   |
  /    |
 /_____|
   |||
   |||
   |||`,
  },
];

function convertText(text: string, fontName: string): string {
  if (!text) return '';
  
  const font = fancyFonts[fontName];
  if (!font) return text;
  
  // Se for função (strikethrough, underline, etc)
  if (typeof font === 'function') {
    return font(text);
  }
  
  const normal = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  
  for (const char of text) {
    const index = normal.indexOf(char);
    if (index !== -1) {
      result += font[index];
    } else {
      result += char;
    }
  }
  
  return result;
}

function NickGenerator() {
  const [input, setInput] = useState('Cafeíno');
  const [selectedFont, setSelectedFont] = useState('Serif');
  const [output, setOutput] = useState('');
  
  useEffect(() => {
    setOutput(convertText(input, selectedFont));
  }, [input, selectedFont]);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência!');
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Seu texto:</label>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite seu nick..."
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Estilo:</label>
        <div className="flex flex-wrap gap-2">
          {Object.keys(fancyFonts).map((font) => (
            <Badge
              key={font}
              variant={selectedFont === font ? 'default' : 'secondary'}
              className={`cursor-pointer ${selectedFont === font ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
              onClick={() => setSelectedFont(font)}
            >
              {font}
            </Badge>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Resultado:</label>
        <div className="p-4 bg-muted rounded-lg font-mono text-lg break-all min-h-[60px] flex items-center">
          {output || <span className="text-muted-foreground italic">Digite algo...</span>}
        </div>
      </div>
      
      <Button 
        onClick={() => copyToClipboard(output)} 
        className="w-full bg-amber-600 hover:bg-amber-700"
        disabled={!output}
      >
        <Copy className="h-4 w-4 mr-2" />
        Copiar Resultado
      </Button>
    </div>
  );
}

function SymbolLibrary() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Símbolo copiado!');
  };
  
  const filteredCategories = Object.entries(specialSymbols).filter(([category, symbols]) => {
    if (selectedCategory && selectedCategory !== category) return false;
    if (search) {
      return category.toLowerCase().includes(search.toLowerCase()) ||
        symbols.some(s => s.includes(search));
    }
    return true;
  });
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar símbolos..."
          className="flex-1"
        />
        {selectedCategory && (
          <Button variant="outline" onClick={() => setSelectedCategory(null)}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Badge 
          variant={selectedCategory === null ? 'default' : 'secondary'}
          className={`cursor-pointer ${selectedCategory === null ? 'bg-amber-600' : ''}`}
          onClick={() => setSelectedCategory(null)}
        >
          Todos
        </Badge>
        {Object.keys(specialSymbols).map((cat) => (
          <Badge
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'secondary'}
            className={`cursor-pointer ${selectedCategory === cat ? 'bg-amber-600' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Badge>
        ))}
      </div>
      
      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {filteredCategories.map(([category, symbols]) => (
          <div key={category}>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">{category}</h4>
            <div className="flex flex-wrap gap-2">
              {symbols.map((symbol, idx) => (
                <Button
                  key={`${category}-${idx}`}
                  variant="outline"
                  size="sm"
                  className="min-w-[40px] h-10 text-lg hover:bg-amber-50 hover:border-amber-300"
                  onClick={() => copyToClipboard(symbol)}
                  title="Clique para copiar"
                >
                  {symbol}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InvisibleChars() {
  const [showInvisible, setShowInvisible] = useState(false);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Caractere invisível copiado!');
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Caracteres invisíveis úteis para criar espaços vazios ou formatar texto.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowInvisible(!showInvisible)}
        >
          {showInvisible ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {showInvisible ? 'Ocultar' : 'Mostrar'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {invisibleChars.map((item, idx) => (
          <Button
            key={idx}
            variant="outline"
            className="justify-start h-auto py-3 px-4 hover:bg-amber-50 hover:border-amber-300"
            onClick={() => copyToClipboard(item.char)}
          >
            <span className="w-8 text-center font-mono text-lg mr-3">
              {showInvisible ? '␣' : ''}
            </span>
            <div className="text-left">
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </Button>
        ))}
      </div>
      
      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
        <p className="text-sm text-amber-800">
          <strong>Dica:</strong> Cole esses caracteres entre letras ou no início/fim de textos para criar efeitos visuais ou espaçamentos especiais.
        </p>
      </div>
    </div>
  );
}

function AsciiArt() {
  const [selectedArt, setSelectedArt] = useState(asciiArts[0]);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Arte ASCII copiada!');
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {asciiArts.map((art) => (
          <Badge
            key={art.name}
            variant={selectedArt.name === art.name ? 'default' : 'secondary'}
            className={`cursor-pointer ${selectedArt.name === art.name ? 'bg-amber-600' : ''}`}
            onClick={() => setSelectedArt(art)}
          >
            {art.name}
          </Badge>
        ))}
      </div>
      
      <div className="p-6 bg-muted rounded-lg font-mono text-sm whitespace-pre overflow-x-auto">
        {selectedArt.art}
      </div>
      
      <Button 
        onClick={() => copyToClipboard(selectedArt.art)} 
        className="w-full bg-amber-600 hover:bg-amber-700"
      >
        <Copy className="h-4 w-4 mr-2" />
        Copiar Arte ASCII
      </Button>
    </div>
  );
}

function NickDecorator() {
  const [input, setInput] = useState('Cafeíno');
  const [prefix, setPrefix] = useState('★');
  const [suffix, setSuffix] = useState('★');
  const decorations = [
    { prefix: '★', suffix: '★' },
    { prefix: '☆', suffix: '☆' },
    { prefix: '❤', suffix: '❤' },
    { prefix: '♡', suffix: '♡' },
    { prefix: '【', suffix: '】' },
    { prefix: '『', suffix: '』' },
    { prefix: '「', suffix: '」' },
    { prefix: '《', suffix: '》' },
    { prefix: '〈', suffix: '〉' },
    { prefix: '✧', suffix: '✧' },
    { prefix: '✦', suffix: '✦' },
    { prefix: '✿', suffix: '✿' },
    { prefix: '❀', suffix: '❀' },
    { prefix: '⚡', suffix: '⚡' },
    { prefix: '🔥', suffix: '🔥' },
    { prefix: '💀', suffix: '💀' },
    { prefix: '👑', suffix: '👑' },
    { prefix: '✨', suffix: '✨' },
    { prefix: '☠', suffix: '☠' },
    { prefix: '⚔', suffix: '⚔' },
    { prefix: 'xX_', suffix: '_Xx' },
    { prefix: 'oO_', suffix: '_Oo' },
    { prefix: '༺', suffix: '༻' },
    { prefix: '⎝', suffix: '⎠' },
    { prefix: '⧼', suffix: '⧽' },
  ];
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Nick decorado copiado!');
  };
  
  const decoratedNick = `${prefix}${input}${suffix}`;
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Seu nick:</label>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite seu nick..."
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Prefixo:</label>
          <Input
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
            placeholder="Prefixo..."
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Sufixo:</label>
          <Input
            value={suffix}
            onChange={(e) => setSuffix(e.target.value)}
            placeholder="Sufixo..."
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Decorações rápidas:</label>
        <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto">
          {decorations.map((dec, idx) => (
            <Button
              key={idx}
              variant="outline"
              size="sm"
              className="text-sm hover:bg-amber-50"
              onClick={() => {
                setPrefix(dec.prefix);
                setSuffix(dec.suffix);
              }}
            >
              {dec.prefix}...{dec.suffix}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Resultado:</label>
        <div className="p-4 bg-muted rounded-lg text-xl text-center font-medium break-all">
          {decoratedNick}
        </div>
      </div>
      
      <Button 
        onClick={() => copyToClipboard(decoratedNick)} 
        className="w-full bg-amber-600 hover:bg-amber-700"
      >
        <Copy className="h-4 w-4 mr-2" />
        Copiar Nick Decorado
      </Button>
    </div>
  );
}

export default function NickCreator() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-amber-100 rounded-full mb-2">
          <Type className="h-6 w-6 text-amber-700" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">Criador de Nick</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Crie nicknames estilosos com fontes especiais, símbolos, caracteres invisíveis e arte ASCII
        </p>
      </div>

      <Tabs defaultValue="fonts" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger value="fonts">
            <Sparkles className="h-4 w-4 mr-2 hidden sm:inline" />
            Fontes
          </TabsTrigger>
          <TabsTrigger value="decorator">
            <Wand2 className="h-4 w-4 mr-2 hidden sm:inline" />
            Decorar
          </TabsTrigger>
          <TabsTrigger value="symbols">
            <span className="mr-2 hidden sm:inline">✦</span>
            Símbolos
          </TabsTrigger>
          <TabsTrigger value="invisible">
            <Eye className="h-4 w-4 mr-2 hidden sm:inline" />
            Invisíveis
          </TabsTrigger>
          <TabsTrigger value="ascii">
            <span className="mr-2 hidden sm:inline">🎨</span>
            ASCII
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="fonts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-600" />
                Gerador de Fontes
              </CardTitle>
              <CardDescription>
                Transforme seu texto em diferentes estilos de fonte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NickGenerator />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="decorator">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-amber-600" />
                Decorador de Nick
              </CardTitle>
              <CardDescription>
                Adicione prefixos e sufixos decorativos ao seu nick
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NickDecorator />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="symbols">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-amber-600 text-xl">✦</span>
                Biblioteca de Símbolos
              </CardTitle>
              <CardDescription>
                Clique em qualquer símbolo para copiá-lo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SymbolLibrary />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="invisible">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-amber-600" />
                Caracteres Invisíveis
              </CardTitle>
              <CardDescription>
                Caracteres especiais que não aparecem visualmente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvisibleChars />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ascii">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-amber-600 text-xl">🎨</span>
                Arte ASCII
              </CardTitle>
              <CardDescription>
                Artes em texto para decorar suas mensagens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AsciiArt />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
