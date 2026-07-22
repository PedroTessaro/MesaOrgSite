export type Phase = {
  n: string;
  name: string;
  dur: string;
  intro: string;
  items: string[];
  res: string;
  prac: string;
};

export const PHASES: Phase[] = [
  {
    n: "00",
    name: "Fundamentos de Swift e ferramentas",
    dur: "~1 semana",
    intro:
      "Garantir que a base de Swift está firme antes de encostar nos frameworks. Boa parte dos perrengues seguintes começa aqui.",
    items: [
      "Optionals: unwrapping, optional chaining, guard let, if let, nil coalescing",
      "Value types vs reference types (struct, enum, class) e quando usar cada um",
      "Protocolos, protocol-oriented programming e generics básicos",
      "Closures: escaping vs non-escaping, capture lists, [weak self]",
      "ARC, retain cycles, weak/unowned",
      "Tratamento de erro: throws, do/catch, Result",
      "Xcode no dia a dia: breakpoints, LLDB básico (po, p), Instruments",
    ],
    res: "Hacking with Swift (Paul Hudson), o livro The Swift Programming Language da Apple, artigos do Kodeco.",
    prac: "Um programa de linha de comando (Swift Package) modelando um domínio simples, tipo uma lista de tarefas em memória.",
  },
  {
    n: "01",
    name: "UIKit",
    dur: "~3 a 4 semanas",
    intro:
      "A base de UI no iOS. É a fase com mais material disponível, então dá para ir fundo sem sofrer para achar referência.",
    items: [
      "Ciclo de vida da view (viewDidLoad, viewWillAppear, viewDidLayoutSubviews)",
      "Auto Layout: constraints programáticas e Interface Builder, UIStackView",
      "UIViewController e navegação: UINavigationController, tab bar, modal",
      "UITableView e UICollectionView: delegate/dataSource, Diffable Data Source, Compositional Layout",
      "Passagem de dados entre telas e o padrão Coordinator",
      "Gestos e touch handling",
      "MVC e MVVM, e por que MVVM organiza e testa melhor",
    ],
    res: "Documentação do UIKit, a trilha de UIKit do Hacking with Swift, sessões de WWDC sobre Diffable Data Sources e Compositional Layout.",
    prac: "Um app mestre-detalhe com lista, tela de detalhe, navegação e formulário, organizado em MVVM.",
  },
  {
    n: "02",
    name: "AppKit",
    dur: "~2 semanas",
    intro:
      "Aproveitar o que já sabem de UIKit e focar no que muda no macOS, não recomeçar do zero.",
    items: [
      "O que difere de UIKit: NSView vs UIView, coordenadas invertidas, responder chain",
      "NSViewController, NSWindow e NSWindowController",
      "NSTableView, NSOutlineView, NSCollectionView",
      "Menus (NSMenu), toolbar e o HIG do macOS",
      "Auto Layout no AppKit",
      "Target-action e Cocoa Bindings (legado, mas ainda aparece)",
      "Noção de Mac Catalyst e da interop entre UIKit e AppKit",
    ],
    res: "A documentação do AppKit e o sample code da Apple são a fonte principal; blogs de devs macOS ajudam com o HIG.",
    prac: "Recriar uma das telas da Fase 1 como app nativo de macOS (janela, table view, menu).",
  },
  {
    n: "03",
    name: "SwiftUI",
    dur: "~2 a 3 semanas",
    intro:
      "O jeito declarativo de fazer UI, com o mesmo código em iOS e macOS. Depois de UIKit/AppKit para entender o que ele resolve e o que esconde.",
    items: [
      "Paradigma declarativo vs imperativo",
      "Views, composição de views e modifiers (a ordem importa)",
      "Layout: VStack, HStack, ZStack, Grid, alignment, GeometryReader",
      "Estado: @State, @Binding, @Observable, ObservableObject/@Published, @Environment",
      "Fluxo de dados e identidade: ForEach, o que faz a tela redesenhar",
      "Listas, NavigationStack, sheets e apresentações",
      "Animações e transições básicas",
      "Interop: UIViewRepresentable, NSViewRepresentable, hosting controllers",
      ".task e async direto na view",
    ],
    res: "A trilha de SwiftUI do Hacking with Swift (100 Days of SwiftUI), tutoriais oficiais da Apple, WWDC sobre data flow e Observation.",
    prac: "Recriar a tela mestre-detalhe da Fase 1 em SwiftUI, rodando em iOS e macOS, com uma UIView/NSView embutida via representable.",
  },
  {
    n: "04",
    name: "Concorrência e paralelismo",
    dur: "~2 semanas",
    intro:
      "Os conceitos antes da sintaxe. Sem essa base, async/await funciona até o dia em que quebra e ninguém entende o porquê.",
    items: [
      "Concorrência (dar conta de várias coisas) vs paralelismo (rodar várias ao mesmo tempo)",
      "Threads, a main thread e por que UI só pode ser mexida nela",
      "GCD: DispatchQueue, serial vs concurrent, async vs sync, QoS",
      "Race conditions, deadlocks e data races",
      "Locks, semáforos e barriers",
      "Operation e OperationQueue",
      "Thread Sanitizer no Xcode",
    ],
    res: "O Concurrency Programming Guide da Apple (antigo, mas os conceitos não envelhecem) e as sessões de WWDC sobre GCD e QoS.",
    prac: "Um cache concorrente com leituras paralelas e escritas serializadas. Provocar uma race condition, pegá-la com o Thread Sanitizer e corrigir.",
  },
  {
    n: "05",
    name: "Swift Concurrency e Combine",
    dur: "~3 semanas",
    intro:
      "O modelo moderno de concorrência, mais Combine para conviver com código legado. É o “como” do que aprenderam na fase anterior.",
    items: [
      "async/await e structured concurrency",
      "Task, TaskGroup, cancelamento e como ele se propaga",
      "Actors, @MainActor, isolamento e Sendable",
      "AsyncSequence e AsyncStream",
      "Migrar callbacks e GCD para async com continuations",
      "Combine: publishers, subscribers, operadores, @Published, AnyCancellable",
      "Onde Combine ainda faz sentido (pipelines reativos, APIs que já entregam publishers)",
      "Ponte com async (.values, expor async como publisher)",
    ],
    res: "A série de WWDC sobre Swift Concurrency (peguem as recentes), documentação de Concurrency e Combine, e o Point-Free para ir além.",
    prac: "Reescrever o cache da Fase 4 com um actor, e montar uma camada de rede em async/await que também exponha um publisher Combine.",
  },
  {
    n: "06",
    name: "CloudKit",
    dur: "~2 semanas",
    intro:
      "Persistência e sincronização na nuvem da Apple. Depende de concorrência porque quase tudo por aqui é assíncrono.",
    items: [
      "O modelo: containers, databases (public, private, shared), records, zones",
      "CKRecord, CKRecord.Reference, CKAsset",
      "Queries, subscriptions e push notifications para sincronizar",
      "Estratégias de sincronização e resolução de conflito",
      "Sync automático: NSPersistentCloudKitContainer ou SwiftData + CloudKit",
      "Tratamento de erro, retry e comportamento offline",
      "CloudKit Console e o schema",
    ],
    res: "A documentação do CloudKit e as sessões de WWDC sobre CloudKit e sobre sync com Core Data e SwiftData.",
    prac: "Um app de notas com sync na private database entre dois simuladores, com um conflito criado de propósito para resolver.",
  },
  {
    n: "07",
    name: "Metal e shaders",
    dur: "~3 a 4 semanas",
    intro:
      "A camada gráfica de baixo nível. A parte mais difícil da trilha para quem é júnior — reservem fôlego e não pulem a matemática.",
    items: [
      "O pipeline gráfico: vértices, fragments, rasterização",
      "Matemática de base: vetores, matrizes, coordenadas, transformações",
      "Metal: MTLDevice, command queue, command buffer, encoders",
      "Buffers e textures",
      "Metal Shading Language: vertex shader e fragment shader",
      "Render pipeline vs compute pipeline",
      "Integração com MTKView e como embutir em UIKit ou AppKit",
    ],
    res: "The Book of Shaders (intuição de fragment shader), Shadertoy, Metal by Tutorials (Kodeco), documentação e vídeos de WWDC sobre Metal.",
    prac: "Um MTKView desenhando um triângulo colorido, evoluindo para um fragment shader animado. A meta é entender o fluxo inteiro.",
  },
  {
    n: "08",
    name: "Lógica de interpretadores",
    dur: "~3 semanas",
    intro:
      "Como transformar texto em algo que executa. Bem independente do resto e por último por ser densa.",
    items: [
      "O pipeline: lexing/tokenização, parsing (a AST) e avaliação",
      "Gramáticas, notação BNF e precedência de operadores",
      "Recursive descent parsing",
      "Tree-walking interpreter, o tipo mais simples de começar",
      "Environments e escopos: variáveis, atribuição, blocos",
      "Compilar para bytecode e rodar numa VM (se sobrar tempo)",
    ],
    res: "Crafting Interpreters (Robert Nystrom), gratuito. Writing an Interpreter in Go (Thorsten Ball) é uma alternativa mais curta.",
    prac: "Um interpretador de calculadora com variáveis (x = 3; y = x * 2 + 1) em Swift, com lexer, parser e avaliador separados.",
  },
];

export const TOTAL = PHASES.reduce((s, p) => s + p.items.length, 0);
export const itemId = (pi: number, ii: number) => `p${pi}-${ii}`;
