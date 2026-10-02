/* ==========================================================================
   ORNALI — Interações
   ========================================================================== */

(function () {
  "use strict";

  /* ---- Navegação: muda aparência ao rolar ---- */
  var nav = document.getElementById("nav");
  var hero = document.querySelector(".hero");

  function atualizarNav() {
    if (window.scrollY > 40) {
      nav.classList.add("nav--rolada");
    } else {
      nav.classList.remove("nav--rolada");
    }
  }
  atualizarNav();
  window.addEventListener("scroll", atualizarNav, { passive: true });

  /* ---- Menu mobile ---- */
  var botaoMenu = document.getElementById("botao-menu");
  var menuMovel = document.getElementById("menu-movel");

  function fecharMenu() {
    menuMovel.classList.remove("aberto");
    botaoMenu.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  function alternarMenu() {
    var estaAberto = menuMovel.classList.toggle("aberto");
    botaoMenu.setAttribute("aria-expanded", String(estaAberto));
    document.body.style.overflow = estaAberto ? "hidden" : "";
  }

  if (botaoMenu) {
    botaoMenu.addEventListener("click", alternarMenu);
  }

  var linksMenuMovel = menuMovel.querySelectorAll("a");
  linksMenuMovel.forEach(function (link) {
    link.addEventListener("click", fecharMenu);
  });

  /* ---- Botão flutuante do WhatsApp: aparece após sair do hero ---- */
  var whatsFlutuante = document.getElementById("whats-flutuante");

  function atualizarWhatsFlutuante() {
    var limite = hero ? hero.offsetHeight * 0.6 : 400;
    if (window.scrollY > limite) {
      whatsFlutuante.classList.add("visivel");
    } else {
      whatsFlutuante.classList.remove("visivel");
    }
  }
  atualizarWhatsFlutuante();
  window.addEventListener("scroll", atualizarWhatsFlutuante, { passive: true });

  /* ---- Revelação suave ao rolar ---- */
  var elementosRevelar = document.querySelectorAll(".revelar");

  if ("IntersectionObserver" in window && elementosRevelar.length) {
    var observador = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (entrada) {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("visivel");
            observador.unobserve(entrada.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    elementosRevelar.forEach(function (el) {
      observador.observe(el);
    });
  } else {
    elementosRevelar.forEach(function (el) {
      el.classList.add("visivel");
    });
  }
})();

/* ==========================================================================
   NOSSOS EVENTOS — Carrossel de projetos (fotos)
   --------------------------------------------------------------------------
   PARA ADICIONAR FOTOS DE PROJETOS:
   É só editar a lista "projetos" logo abaixo. Cada linha é um projeto:
   um título e o caminho do arquivo da foto. Para adicionar um projeto
   novo, copie uma linha, mude o título e o caminho da foto. Para
   remover, apague a linha inteira. A ordem da lista é a ordem que
   aparece no carrossel.

   Coloque os arquivos de foto dentro da pasta assets/projetos/
   (já existe, com 5 fotos de exemplo — troque pelas suas fotos reais
   quando quiser, mantendo os mesmos nomes ou usando nomes novos, desde
   que o caminho abaixo aponte pro nome certo).

   Não precisa mexer no HTML nem no CSS: o carrossel se ajusta sozinho
   pra qualquer quantidade de projetos, e continua girando em loop.
   ========================================================================== */

var projetos = [
  { titulo: "Chá de Bebe", foto: "assets/projetos/levi-1.jpeg" },
  { titulo: "Chá de Bebe", foto: "assets/projetos/theo-1.jpg" },
  { titulo: "Casamento intimista- M&A", foto: "assets/projetos/casamento-1.jpg" },
  { titulo: "Eventos especiais — ", foto: "assets/projetos/pio-1.jpg" },
  { titulo: "Chá de Panela", foto: "assets/projetos/panela-1.jpeg" }
];

(function () {
  "use strict";

  var janela = document.getElementById("projetos-janela");
  var pista = document.getElementById("projetos-pista");
  if (!janela || !pista || !projetos.length) return; // segurança: sem elementos ou sem projetos, não faz nada

  var VISIVEIS_MAXIMO = 4; // precisa bater com o "flex-basis: 25%" (100/4) do CSS, na tela mais larga
  var INTERVALO_MS = 3200; // tempo entre cada avanço do carrossel (em milissegundos)
  var reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Repete a lista de projetos até ter itens suficientes para o loop
  // ficar suave mesmo com poucos projetos cadastrados (ex: só 1 ou 2).
  function montarListaCompleta() {
    var lista = [];
    while (lista.length < Math.max(8, projetos.length * 2)) {
      lista = lista.concat(projetos);
    }
    return lista;
  }

  // Cria o elemento HTML de um card de projeto (foto + legenda com o título)
  function criarCartao(projeto) {
    var item = document.createElement("div");
    item.className = "projetos__item";

    var cartao = document.createElement("div");
    cartao.className = "projetos__cartao";

    var img = document.createElement("img");
    img.src = projeto.foto;
    img.alt = projeto.titulo;
    img.loading = "lazy";

    var legenda = document.createElement("div");
    legenda.className = "projetos__legenda";
    legenda.textContent = projeto.titulo;

    cartao.appendChild(img);
    cartao.appendChild(legenda);
    item.appendChild(cartao);
    return item;
  }

  var listaCompleta = montarListaCompleta();

  // Clona os primeiros "VISIVEIS_MAXIMO" itens e cola no final da pista.
  // Esse é o truque clássico do "loop infinito": quando o carrossel
  // chega nesses clones (que são idênticos aos primeiros itens de
  // verdade), a gente pula de volta pro início SEM transição — o
  // olho não percebe, porque as imagens são as mesmas.
  var itensParaRenderizar = listaCompleta.concat(
    listaCompleta.slice(0, VISIVEIS_MAXIMO)
  );

  itensParaRenderizar.forEach(function (projeto) {
    pista.appendChild(criarCartao(projeto));
  });

  var indice = 0;
  var temporizador = null;

  // Move a pista para mostrar o card de número "indice".
  // "comTransicao = false" é usado só no momento do "pulo" de volta pro
  // início, pra esse pulo ser instantâneo (sem deslizar visivelmente).
  function irParaIndice(comTransicao) {
    var primeiroCard = pista.children[0];
    if (!primeiroCard) return;

    var passo = primeiroCard.getBoundingClientRect().width; // largura real de 1 card na tela agora
    pista.style.transition = comTransicao
      ? "transform 700ms " + "cubic-bezier(0.65, 0, 0.35, 1)"
      : "none";
    pista.style.transform = "translateX(" + -(passo * indice) + "px)";
  }

  function avancar() {
    indice++;
    irParaIndice(true);

    // Quando passamos do fim da lista "de verdade" e entramos na
    // zona dos clones, esperamos a transição acabar e então voltamos
    // pro índice 0 sem transição — como os clones são iguais aos
    // itens reais do início, o "salto" fica invisível.
    if (indice >= listaCompleta.length) {
      window.setTimeout(function () {
        indice = 0;
        irParaIndice(false);
      }, 720); // um pouco mais que os 700ms da transição acima
    }
  }

  function iniciarAutoplay() {
    pararAutoplay();
    temporizador = window.setInterval(avancar, INTERVALO_MS);
  }

  function pararAutoplay() {
    if (temporizador) {
      window.clearInterval(temporizador);
      temporizador = null;
    }
  }

  // Recalcula a posição sempre que a janela muda de tamanho (ex: girar
  // o celular), já que o "passo" em pixels depende da largura da tela.
  window.addEventListener("resize", function () {
    irParaIndice(false);
  });

  irParaIndice(false); // posição inicial

  if (!reduzirMovimento) {
    iniciarAutoplay();

    // Pausa o giro quando o mouse está sobre o carrossel (o usuário
    // pode estar tentando olhar uma foto com calma) e retoma ao sair.
    janela.addEventListener("mouseenter", pararAutoplay);
    janela.addEventListener("mouseleave", iniciarAutoplay);

    // Pausa quando a aba do navegador não está visível, pra não gastar
    // processamento à toa em segundo plano.
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        pararAutoplay();
      } else {
        iniciarAutoplay();
      }
    });
  }
  // Se "reduzir movimento" estiver ativo nas configurações do sistema,
  // o carrossel fica parado, mostrando só os 4 primeiros projetos.
})();

/* ==========================================================================
   CARD FLUTUANTE — CELEBRAÇÕES (modal de galeria)
   --------------------------------------------------------------------------
   LÓGICA:
   1. "dadosCelebracoes" guarda, para cada categoria, o ícone, o título,
      a descrição e a lista de fotos (galeria).
   2. Cada card ".categoria" no HTML tem um atributo data-categoria="chave"
      que aponta para uma dessas entradas.
   3. Ao clicar em um card, abrimos o MESMO modal (que existe uma única vez
      no HTML) e o preenchemos com os dados daquela categoria.
   4. Se "imagens" da categoria estiver vazio ([]), o espaço da foto fica
      com um fundo translúcido e o ícone da categoria como marca d'água.
      Se você preencher "imagens" com um ou mais arquivos, elas aparecem
      no lugar do fundo translúcido, e as setinhas pequenas (perto do
      contador "1 / N") passam a navegar entre essas fotos.
   5. Fechar: clique no fundo, no X, ou tecla Esc.

   PARA EDITAR:
   - Textos: altere "titulo" e "texto" dentro de "dadosCelebracoes" abaixo.
   - Fotos: troque "imagens: []" por algo como
     imagens: ["assets/celebracoes/aniversarios-1.jpg", "assets/celebracoes/aniversarios-2.jpg"]
     Pode colocar quantas fotos quiser.
   ========================================================================== */

(function () {
  "use strict";

  // Ícones reaproveitados dos cards da grade (mesmo SVG de cada categoria)
  var icones = {
    aniversarios:
      '<svg viewBox="0 0 32 32" fill="none" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18c0-3 4-4 10-4s10 1 10 4v6c0 2-2 3-10 3s-10-1-10-3v-6z"/><path d="M6 18c0 2 4 3 10 3s10-1 10-3"/><path d="M16 14v-4"/><path d="M16 6c-1.4 0-2-1-2-2s.9-2 2-2 2 1 2 2-.6 2-2 2z"/></svg>',
    chas:
      '<svg viewBox="0 0 32 32" fill="none" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M16 6c2 2 2 5 0 7-2-2-2-5 0-7z"/><path d="M16 6c-2 2-2 5 0 7"/><path d="M16 13c3-1 6 1 6 4-3 1-6-1-6-4z"/><path d="M16 13c-3-1-6 1-6 4 3 1 6-1 6-4z"/><circle cx="16" cy="22" r="1.3" fill="currentColor" stroke="none"/><path d="M16 17v13"/></svg>',
    "cha-de-bebe":
      '<svg viewBox="0 0 32 32" fill="none" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M11 13h10l-1 13a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2l-1-13z"/><path d="M13 13v-2a3 3 0 0 1 6 0v2"/><path d="M12 18h8"/></svg>',
    noivados:
      '<svg viewBox="0 0 32 32" fill="none" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="20" r="5"/><circle cx="20" cy="20" r="5"/><path d="M14 9l2 4 2-4"/></svg>',
    intimistas:
      '<svg viewBox="0 0 32 32" fill="none" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13l12-5 12 5-12 5-12-5z"/><path d="M9 15.5V21c0 1.5 3 3 7 3s7-1.5 7-3v-5.5"/><path d="M28 13v7"/></svg>',
    familiares:
      '<svg viewBox="0 0 32 32" fill="none" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M16 26s-8-5.2-8-11.4C8 10.8 10.6 8 14 8c1.6 0 3 .8 4 2 1-1.2 2.4-2 4-2 3.4 0 6 2.8 6 6.6C24 20.8 16 26 16 26z" transform="scale(0.85) translate(2.5,3)"/></svg>',
    infantis:
      '<svg viewBox="0 0 32 32" fill="none" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="16" cy="12" rx="7" ry="8.5"/><path d="M16 20.5V27"/><path d="M13 27h6"/></svg>',
    personalizados:
      '<svg viewBox="0 0 32 32" fill="none" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8c-3-3-9-2-9 3 0 4 5 6 9 10 4-4 9-6 9-10 0-5-6-6-9-3z"/><path d="M16 8v13"/></svg>'
  };

  // EDITAR AQUI: textos e fotos de cada categoria.
  // Deixe "imagens: []" para mostrar o fundo translúcido com o ícone da
  // categoria (visual atual). Se quiser usar fotos reais, preencha o
  // array com os caminhos dos arquivos, por exemplo:
  //   imagens: ["assets/celebracoes/aniversarios-1.jpg", "assets/celebracoes/aniversarios-2.jpg"]
  var dadosCelebracoes = {
    aniversarios: {
      titulo: "Aniversários",
      texto: "Torne seu aniversário ainda mais especial com uma celebração inesquecível.",
      imagens: [
        "assets/celebracoes/aniversarios-1.jpeg",
        "assets/celebracoes/aniversarios-2.jpeg",
        "assets/celebracoes/aniversarios-3.jpeg",
        "assets/celebracoes/aniversarios-4.jpeg",
        "assets/celebracoes/aniversarios-5.jpeg"
      ]
    },
    chas: {
      titulo: "Chás e celebrações",
      texto: "Encontros delicados, pensados nos mínimos detalhes para celebrar momentos importantes.",
      imagens: [ 
        "assets/celebracoes/panela-1.jpeg",
        "assets/celebracoes/panela-2.jpeg",
        "assets/celebracoes/panela-3.jpeg",
        "assets/celebracoes/panela-4.jpeg",
        "assets/celebracoes/panela-5.jpeg"
         ]
    },
    "cha-de-bebe": {
      titulo: "Chá de bebê e revelação",
      texto: "Uma decoração cheia de ternura para anunciar e celebrar a chegada de quem vem por aí.",
      imagens: [ 
        "assets/celebracoes/theo-1.jpg",
        "assets/celebracoes/theo-2.jpeg",
        "assets/celebracoes/theo-3.jpeg",
        "assets/celebracoes/theo-4.jpeg",
        "assets/celebracoes/cha.jpeg"
      ]
    },
    noivados: {
      titulo: "Noivados e Casamentos intimistas",
      texto: "Celebrações íntimas com toda a beleza e emoção que esse momento merece.",
      imagens: [
         "assets/celebracoes/casamento-1.jpg",
        "assets/celebracoes/casamento-2.jpg",
        "assets/celebracoes/casamento-3.jpg",
        "assets/celebracoes/casamento-4.jpg",
        "assets/celebracoes/theo-5.jpeg"
      ]
    },
    intimistas: {
      titulo: "Celebrações intimistas",
      texto: "Vem ai...Pequenos encontros, grandes memórias — decoração pensada para poucas pessoas e muito significado.",
      imagens: [ "assets/celebracoes/embreve.png",
        
        ]
    },
    familiares: {
      titulo: "Celebrações familiares",
      texto: "Vem ai...Momentos para reunir quem você ama, com uma atmosfera acolhedora e cheia de afeto.",
      imagens: ["assets/celebracoes/embreve.png"]
    },
    infantis: {
      titulo: "Festas infantis",
      texto: "Cores, encanto e imaginação em cada detalhe para celebrar a festa dos pequenos.",
      imagens: [ 
        "assets/celebracoes/infantil-1.jpeg",
        "assets/celebracoes/infantil-2.jpeg",
        "assets/celebracoes/infantil-3.jpeg",
     
      ]
    },
    personalizados: {
      titulo: "Eventos Personalizados",
      texto: "Tem outra ocasião em mente? Criamos uma decoração única para o seu momento.",
      imagens: [  
        "assets/celebracoes/pio-1.jpg",
        "assets/celebracoes/pio-2.jpg",
        "assets/celebracoes/pio-3.jpg",
        "assets/celebracoes/pio-4.jpg",
    
      ]
    }
  };

  var modal = document.getElementById("modal-celebracao");
  if (!modal) return; // segurança: se o HTML do modal não existir, não faz nada

  var elIcone = document.getElementById("modal-celebracao-icone");
  var elTitulo = document.getElementById("modal-celebracao-titulo");
  var elTexto = document.getElementById("modal-celebracao-texto");
  var elAreaImagem = document.getElementById("modal-celebracao-area-imagem");
  var elMarcaAgua = document.getElementById("modal-celebracao-marca-agua");
  var elFotoA = document.getElementById("modal-celebracao-foto-a");
  var elFotoB = document.getElementById("modal-celebracao-foto-b");
  var elContador = document.getElementById("modal-celebracao-contador");
  var elRodape = elContador.closest(".modal-celebracao__rodape");

  var categoriaAtual = null; // chave da categoria aberta, ex: "aniversarios"
  var indiceFoto = 0; // índice da foto atual dentro da galeria
  var ultimoFoco = null; // elemento que tinha foco antes de abrir (acessibilidade)
  var fotoAtivaEhA = true; // controla qual das duas camadas (A/B) está visível agora
  var trocandoFoto = false; // evita cliques/swipes em sequência muito rápida

  // Mostra a foto "indiceFoto" da categoria atual. Faz um crossfade suave
  // entre a camada visível e a nova (pré-carrega a imagem antes de trocar,
  // pra não aparecer um "flash" em branco durante a transição).
  function mostrarFotoAtual() {
    var dados = dadosCelebracoes[categoriaAtual];
    var imagens = dados.imagens || [];

    if (imagens.length === 0) {
      elAreaImagem.classList.remove("tem-foto");
      elFotoA.classList.remove("ativa");
      elFotoB.classList.remove("ativa");
      elFotoA.removeAttribute("src");
      elFotoB.removeAttribute("src");
      elRodape.style.display = "none";
      trocandoFoto = false;
      return;
    }

    elRodape.style.display = "";
    elAreaImagem.classList.add("tem-foto");
    elContador.textContent = (indiceFoto + 1) + " / " + imagens.length;

    var caminho = imagens[indiceFoto];
    var camadaEntrando = fotoAtivaEhA ? elFotoB : elFotoA;
    var camadaSaindo = fotoAtivaEhA ? elFotoA : elFotoB;
    var legenda = dados.titulo + " — foto " + (indiceFoto + 1);

    var preCarga = new Image();
    preCarga.onload = function () {
      camadaEntrando.src = caminho;
      camadaEntrando.alt = legenda;
      camadaEntrando.classList.add("ativa");
      camadaSaindo.classList.remove("ativa");
      fotoAtivaEhA = !fotoAtivaEhA;
      trocandoFoto = false;
    };
    preCarga.onerror = function () {
      trocandoFoto = false;
    };
    preCarga.src = caminho;
  }

  // Primeira foto ao abrir uma categoria: mostra direto na camada A,
  // sem crossfade (ainda não há foto anterior na tela).
  function mostrarPrimeiraFoto() {
    var dados = dadosCelebracoes[categoriaAtual];
    var imagens = dados.imagens || [];

    elFotoA.classList.remove("ativa");
    elFotoB.classList.remove("ativa");
    elFotoA.removeAttribute("src");
    elFotoB.removeAttribute("src");
    fotoAtivaEhA = true;

    if (imagens.length === 0) {
      elAreaImagem.classList.remove("tem-foto");
      elRodape.style.display = "none";
      return;
    }

    elAreaImagem.classList.add("tem-foto");
    elRodape.style.display = "";
    elContador.textContent = "1 / " + imagens.length;
    elFotoA.src = imagens[0];
    elFotoA.alt = dados.titulo + " — foto 1";
    elFotoA.classList.add("ativa");
    fotoAtivaEhA = true; // a camada A está visível agora; a próxima troca entra pela B
  }

  function preencherModal(chave) {
    var dados = dadosCelebracoes[chave];
    if (!dados) return;

    categoriaAtual = chave;
    indiceFoto = 0;
    trocandoFoto = false;

    elIcone.innerHTML = icones[chave] || "";
    elMarcaAgua.innerHTML = icones[chave] || "";
    elTitulo.textContent = dados.titulo;
    elTexto.textContent = dados.texto;

    mostrarPrimeiraFoto();
  }

  function abrirModal(chave) {
    ultimoFoco = document.activeElement;
    preencherModal(chave);

    modal.classList.add("aberto");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-aberto");

    var botaoFechar = document.getElementById("modal-fechar");
    if (botaoFechar) botaoFechar.focus();
  }

  function fecharModal() {
    modal.classList.remove("aberto");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-aberto");

    if (ultimoFoco && typeof ultimoFoco.focus === "function") {
      ultimoFoco.focus();
    }
  }

  function irParaFoto(passo) {
    var dados = dadosCelebracoes[categoriaAtual];
    if (!dados || !dados.imagens.length || trocandoFoto) return;

    trocandoFoto = true;
    var total = dados.imagens.length;
    indiceFoto = (indiceFoto + passo + total) % total; // volta pro início/fim (loop)
    mostrarFotoAtual();
  }

  // ---- Abrir o modal ao clicar (ou usar Enter/Espaço) em um card .categoria ----
  // Também define, via CSS custom property, a primeira foto de cada
  // categoria como imagem de fundo revelada no hover (ver style.css).
  var cardsCategoria = document.querySelectorAll(".categoria[data-categoria]");
  cardsCategoria.forEach(function (card) {
    card.style.cursor = "pointer";

    var chave = card.getAttribute("data-categoria");
    var dados = dadosCelebracoes[chave];
    if (dados && dados.imagens && dados.imagens.length) {
      card.style.setProperty("--capa", 'url("' + dados.imagens[0] + '")');
    }

    card.addEventListener("click", function () {
      abrirModal(chave);
    });

    card.addEventListener("keydown", function (evento) {
      if (evento.key === "Enter" || evento.key === " ") {
        evento.preventDefault();
        abrirModal(chave);
      }
    });
  });

  // ---- Fechar ----
  document.getElementById("modal-fechar").addEventListener("click", fecharModal);
  modal.querySelectorAll("[data-fechar-modal]").forEach(function (el) {
    el.addEventListener("click", fecharModal);
  });

  document.addEventListener("keydown", function (evento) {
    if (!modal.classList.contains("aberto")) return;

    if (evento.key === "Escape") {
      fecharModal();
    } else if (evento.key === "ArrowRight") {
      irParaFoto(1);
    } else if (evento.key === "ArrowLeft") {
      irParaFoto(-1);
    }
  });

  // ---- Setas pequenas: trocam a FOTO dentro da categoria atual (com transição) ----
  document.getElementById("modal-mini-esq").addEventListener("click", function () {
    irParaFoto(-1);
  });
  document.getElementById("modal-mini-dir").addEventListener("click", function () {
    irParaFoto(1);
  });

  // ---- Swipe no celular: arrasta o dedo pra esquerda/direita na foto para trocar ----
  var toqueInicioX = 0;
  var toqueInicioY = 0;
  var DISTANCIA_MINIMA_SWIPE = 40; // px

  elAreaImagem.addEventListener(
    "touchstart",
    function (evento) {
      var toque = evento.changedTouches[0];
      toqueInicioX = toque.clientX;
      toqueInicioY = toque.clientY;
    },
    { passive: true }
  );

  elAreaImagem.addEventListener(
    "touchend",
    function (evento) {
      var toque = evento.changedTouches[0];
      var deltaX = toque.clientX - toqueInicioX;
      var deltaY = toque.clientY - toqueInicioY;

      // só considera swipe horizontal (ignora se o dedo andou mais na vertical,
      // pra não atrapalhar quem só quer rolar a página)
      if (Math.abs(deltaX) > DISTANCIA_MINIMA_SWIPE && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0) {
          irParaFoto(1); // arrastou pra esquerda -> próxima foto
        } else {
          irParaFoto(-1); // arrastou pra direita -> foto anterior
        }
      }
    },
    { passive: true }
  );
})();
