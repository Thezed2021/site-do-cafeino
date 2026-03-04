import { Coffee, Info, BookOpen, Image as ImageIcon, User, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// ============================================
// COMO CRIAR NOVAS POSTAGENS
// ============================================
// Para adicionar uma nova postagem, copie o template abaixo
// e adicione no array 'posts' no final deste arquivo:
//
// {
//   id: 'unico-id-aqui',
//   author: {
//     name: 'Nome do Autor',
//     avatar: 'Iniciais ou deixe vazio para fallback',
//   },
//   date: 'DD/MM/YYYY',
//   content: `Texto da postagem aqui...`,
//   image: '/caminho/para/imagem.jpg', // opcional, remova se não tiver imagem
//   tags: ['tag1', 'tag2'], // opcional
// }
//
// Exemplo prático - postagem simples:
// {
//   id: 'post-003',
//   author: {
//     name: 'João Silva',
//     avatar: 'JS',
//   },
//   date: '04/03/2026',
//   content: `Olá pessoal! Esta é uma nova postagem no blog.`,
// }
//
// Exemplo - postagem com imagem:
// {
//   id: 'post-004',
//   author: {
//     name: 'Maria Souza',
//     avatar: 'MS',
//   },
//   date: '05/03/2026',
//   content: `Vejam essa foto incrível!`,
//   image: '/minha-imagem.jpg',
//   tags: ['foto', 'memória'],
// }
// ============================================

interface Post {
  id: string;
  author: {
    name: string;
    avatar?: string;
  };
  date: string;
  content: string;
  image?: string;
  tags?: string[];
}

const posts: Post[] = [
  {
    id: 'post-001',
    author: {
      name: 'Cafeíno',
      avatar: 'CF',
    },
    date: '04/03/2026',
    content: `Bem-vindos ao Site do Cafeíno! ☕

Este é um projeto pessoal onde vou compartilhar algumas ferramentas úteis que desenvolvi para usar no dia a dia. Todas as ferramentas rodam diretamente no seu navegador, sem necessidade de instalar nada ou enviar dados para servidores.

Sinta-se à vontade para explorar e usar o que precisar!`,
    tags: ['boas-vindas', 'sobre'],
  },
  {
    id: 'post-002',
    author: {
      name: 'Cafeíno',
      avatar: 'CF',
    },
    date: '04/03/2026',
    content: `Acabei de adicionar o Criador de Nick! Agora você pode criar nicknames estilosos para jogos e redes sociais com vários tipos de caracteres especiais, artes e símbolos.

Dá uma olhada no menu lateral e testa aí! 🎮`,
    tags: ['novidade', 'ferramentas'],
  },
];

function PostCard({ post }: { post: Post }) {
  return (
    <Card className="overflow-hidden border-border/60 hover:border-amber-200/60 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 bg-amber-100">
            <AvatarFallback className="bg-amber-100 text-amber-800 text-sm font-medium">
              {post.author.avatar || post.author.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium text-sm">{post.author.name}</p>
            <p className="text-xs text-muted-foreground">{post.date}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="whitespace-pre-line text-sm leading-relaxed text-foreground/90 mb-4">
          {post.content}
        </div>
        
        {post.image && (
          <div className="mt-3 rounded-lg overflow-hidden border border-border/50">
            <img 
              src={post.image} 
              alt="Imagem da postagem" 
              className="w-full h-auto object-cover"
            />
          </div>
        )}
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {post.tags.map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="text-xs bg-amber-50 text-amber-700 hover:bg-amber-100 border-0"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-amber-100 rounded-full mb-2">
          <Coffee className="h-8 w-8 text-amber-700" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Site do Cafeíno <span className="text-amber-600">☕</span>
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Ferramentas úteis que rodam no seu navegador
        </p>
      </div>

      {/* Gradient Image Placeholder */}
      <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/80 text-sm font-medium bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm">
            Imagem em degradê - substitua no código
          </p>
        </div>
      </div>

      {/* Warning/Info Card */}
      <Card className="border-amber-200/60 bg-amber-50/50">
        <CardContent className="p-4 md:p-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm leading-relaxed text-amber-900">
                Este site foi criado para ter algumas utilidades para mim ou para amigos que usarem as ferramentas disponíveis aqui. Todas as ferramentas rodam direto no seu navegador, o site não armazena nenhum dado seu.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-border/50" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Postagens
          </span>
          <div className="h-px flex-1 bg-border/50" />
        </div>
        
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>

      {/* Tutorial Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-border/50" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Como Personalizar
          </span>
          <div className="h-px flex-1 bg-border/50" />
        </div>
        
        <Card className="border-blue-200/60 bg-blue-50/50">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Tutorial: Como Adicionar Imagens</h3>
            </div>
            
            <div className="space-y-4 text-sm text-blue-800">
              {/* Imagem Principal */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  1. Trocar a Imagem Principal (Degradê)
                </h4>
                <p className="text-blue-700/80 ml-6">
                  No arquivo <code className="bg-blue-100 px-1 rounded">src/pages/HomePage.tsx</code>, procure pela seção 
                  <strong> "Gradient Image Placeholder"</strong> e substitua:
                </p>
                <pre className="bg-blue-100 p-3 rounded-lg text-xs overflow-x-auto ml-6">
{`{/* Imagem Principal */}
<div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden">
  <img 
    src="/sua-imagem.jpg" 
    alt="Descrição" 
    className="w-full h-full object-cover"
  />
</div>`}
                </pre>
                <p className="text-blue-700/80 ml-6">
                  Coloque sua imagem na pasta <code className="bg-blue-100 px-1 rounded">public/</code> e referencie como <code className="bg-blue-100 px-1 rounded">/sua-imagem.jpg</code>
                </p>
              </div>
              
              {/* Avatar do Autor */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  2. Adicionar Foto de Perfil do Autor
                </h4>
                <p className="text-blue-700/80 ml-6">
                  Para usar uma imagem real ao invés das iniciais, modifique o componente PostCard:
                </p>
                <pre className="bg-blue-100 p-3 rounded-lg text-xs overflow-x-auto ml-6">
{`<Avatar className="h-10 w-10">
  <AvatarImage src="/foto-autor.jpg" alt="Nome" />
  <AvatarFallback>CF</AvatarFallback>
</Avatar>`}
                </pre>
              </div>
              
              {/* Imagens nas Postagens */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  3. Adicionar Imagens nas Postagens
                </h4>
                <p className="text-blue-700/80 ml-6">
                  Ao criar uma nova postagem, adicione a propriedade <code className="bg-blue-100 px-1 rounded">image</code>:
                </p>
                <pre className="bg-blue-100 p-3 rounded-lg text-xs overflow-x-auto ml-6">
{`{
  id: 'post-003',
  author: {
    name: 'Seu Nome',
    avatar: 'SN',
  },
  date: '05/03/2026',
  content: 'Texto da postagem...',
  image: '/minha-foto.jpg',  // ← Adicione esta linha
  tags: ['foto', 'memória'],
}`}
                </pre>
              </div>
              
              {/* Passo a Passo */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Passo a Passo Completo
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-blue-700/80 ml-6">
                  <li>Coloque suas imagens na pasta <code className="bg-blue-100 px-1 rounded">public/</code> do projeto</li>
                  <li>Os formatos suportados são: <strong>JPG, PNG, GIF, WEBP</strong></li>
                  <li>Referencie as imagens usando <code className="bg-blue-100 px-1 rounded">/nome-da-imagem.extensao</code></li>
                  <li>Recomendado: use imagens otimizadas (máximo 1MB cada)</li>
                  <li>Após fazer as alterações, faça o build e deploy novamente</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center pt-8 pb-4">
        <p className="text-xs text-muted-foreground">
          Site do Cafeíno ☕ • {new Date().getFullYear()}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Feito com café e código
        </p>
      </div>
    </div>
  );
}
