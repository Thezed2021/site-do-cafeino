import { Coffee, Info } from 'lucide-react';
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
