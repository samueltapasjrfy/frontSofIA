# TableV2 Component

Componente de tabela avançada para exibição de publicações e blocos do Sofia Dashboard.

## Funcionalidades

- ✅ **Expansão de Linhas**: Clique para expandir e ver blocos de cada publicação
- ✅ **Filtros Avançados**: Busca por texto, categoria, classificação e remetente
- ✅ **Modal de Detalhes**: Visualização completa de publicações e blocos
- ✅ **Ações Contextuais**: Aprovar, rejeitar, visualizar e excluir
- ✅ **Responsivo**: Layout adaptável para mobile e desktop
- ✅ **Dark Mode**: Suporte completo ao tema escuro
- ✅ **Estados Vazios**: Interface elegante quando não há resultados

## Uso Básico

```tsx
import { TableV2 } from '@/components/tablev2'

export default function PublicacoesPage() {
  const handlePublicationAction = (action: string, publication: Publication) => {
    console.log(`Ação ${action} na publicação:`, publication.id_publicacao)
  }

  const handleBlockAction = (action: string, block: Bloco) => {
    console.log(`Ação ${action} no bloco:`, block.id_bloco)
  }

  return (
    <TableV2
      publications={publications}
      onPublicationAction={handlePublicationAction}
      onBlockAction={handleBlockAction}
    />
  )
}
```

## Props

### `TableV2Props`

| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `publications` | `Publication[]` | ❌ | Array de publicações (usa dados de exemplo se não fornecido) |
| `onPublicationAction` | `(action: string, publication: Publication) => void` | ❌ | Callback para ações em publicações |
| `onBlockAction` | `(action: string, block: Bloco) => void` | ❌ | Callback para ações em blocos |

## Tipos

### `Publication`
```typescript
type Publication = {
  id_publicacao: string
  numero_processo: string
  tribunal: string
  data_publicacao: string
  modalidade: string
  status_processamento: string
  validacao: string
  data_insercao: string
  data_processamento: string
  blocos: Bloco[]
}
```

### `Bloco`
```typescript
type Bloco = {
  id_bloco: string
  categoria_bloco: "DECISÃO JUDICIAL" | "ORDEM COM PRAZO" | "MERO EXPEDIENTE"
  classificacao: string
  subclasse: string
  remetente: "Autor" | "Réu" | "Exequente" | "Executado" | "Ambos"
  texto_resumido: string
  texto_completo: string
  prazo?: string
  confianca: string
}
```

## Ações Disponíveis

### Ações de Publicação
- `approve` - Aprovar publicação
- `reject` - Rejeitar publicação
- `delete` - Excluir publicação
- `view` - Visualizar detalhes (abre modal automaticamente)

### Ações de Bloco
- `approve` - Aprovar bloco
- `reject` - Rejeitar bloco
- `delete` - Excluir bloco
- `view` - Visualizar detalhes (abre modal automaticamente)

## Filtros

O componente oferece filtros em tempo real:

1. **Busca por Texto**: Pesquisa em ID, número do processo e conteúdo dos blocos
2. **Categoria**: Filtra por categoria dos blocos
3. **Classificação**: Filtra por classificação dos blocos
4. **Remetente**: Filtra por remetente dos blocos

## Exemplo Completo

```tsx
"use client"

import { useState } from 'react'
import { TableV2 } from '@/components/tablev2'
import { Publication, Bloco } from '@/components/tablev2/types'
import { toast } from '@/components/ui/use-toast'

export default function PublicacoesPage() {
  const [publications, setPublications] = useState<Publication[]>([
    // seus dados aqui
  ])

  const handlePublicationAction = (action: string, publication: Publication) => {
    switch (action) {
      case 'approve':
        toast({
          title: "Publicação Aprovada",
          description: `Publicação ${publication.id_publicacao} foi aprovada.`
        })
        break
      case 'reject':
        toast({
          title: "Publicação Rejeitada",
          description: `Publicação ${publication.id_publicacao} foi rejeitada.`
        })
        break
      case 'delete':
        setPublications(prev => 
          prev.filter(p => p.id_publicacao !== publication.id_publicacao)
        )
        toast({
          title: "Publicação Excluída",
          description: `Publicação ${publication.id_publicacao} foi excluída.`
        })
        break
    }
  }

  const handleBlockAction = (action: string, block: Bloco) => {
    switch (action) {
      case 'approve':
        toast({
          title: "Bloco Aprovado",
          description: `Bloco ${block.id_bloco} foi aprovado.`
        })
        break
      case 'reject':
        toast({
          title: "Bloco Rejeitado", 
          description: `Bloco ${block.id_bloco} foi rejeitado.`
        })
        break
      case 'delete':
        // Lógica para remover bloco específico
        break
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Publicações</h1>
      <TableV2
        publications={publications}
        onPublicationAction={handlePublicationAction}
        onBlockAction={handleBlockAction}
      />
    </div>
  )
}
```

## Estilização

O componente usa Tailwind CSS e suporta:
- **Dark Mode**: Classes dark: automáticas
- **Responsividade**: Breakpoints para mobile/tablet/desktop
- **Acessibilidade**: ARIA labels e navegação por teclado
- **Animações**: Transições suaves para expansão e hover

## Dependências

- `@/components/ui/*` - Componentes de UI (shadcn/ui)
- `lucide-react` - Ícones
- `tailwindcss` - Estilização 