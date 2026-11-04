# Fotos para sites de clientes

## Fotos do cliente (preferência)
1. Pedir as fotos no maior tamanho que houver (original do celular ou da câmera, não print do WhatsApp).
2. Conferir: foco, luz, nada de rosto de terceiros sem autorização, nada de placa de carro ou dado pessoal.
3. Recortar na proporção do layout e tirar marcas d'água, textos e bordas.
   Fotos ampliadas por IA às vezes trazem uma marca (ex.: o ✦ do Gemini no canto): ela tem que ficar fora do recorte.
4. Converter para webp (qualidade ~80) em 2 tamanhos e usar `srcset`.

## Fotos da internet (quando o cliente não tem)
Usamos só o **Unsplash, licença gratuita** (não usar as "Unsplash+", que são pagas).

1. **Buscar**: a página do Unsplash bloqueia `curl` direto. Usar o Firecrawl (`firecrawl_scrape`, formato markdown) em
   `https://unsplash.com/s/photos/<busca-com-hifens>?license=free`.
   O markdown traz os endereços `https://images.unsplash.com/photo-<id>?…`, o texto alternativo e o fotógrafo.
   Ignorar `plus.unsplash.com` (pago) e o bloco "Sponsored".
   Dá para pedir isso a um agente em segundo plano, com 3 ou 4 buscas por categoria.
2. **Conferir** cada id: `curl -s -o /dev/null -w "%{http_code}" "https://images.unsplash.com/photo-<id>?w=200&fm=jpg"` → 200.
3. **Folha de contato**: baixar em `w=400`, montar uma grade numerada com Pillow e escolher olhando as imagens
   (o texto alternativo do Unsplash às vezes erra).
4. **Baixar** a escolhida em `w=1600` a `w=2800` (`&fm=jpg&q=85`), recortar e converter para webp.
5. **Crédito** no rodapé: "Fotos: Unsplash".
6. Se for site de um negócio real, deixar claro para o cliente que as fotos são ilustrativas e trocar pelas dele assim que possível.

## Do esboço à foto
Depois de escolher a foto: `python3 kit/ferramentas/esboco.py foto.jpg assets/img nome --proporcao 4:3`.
Fachadas, interiores e produtos com linhas retas ficam melhores. Folhagem e texturas viram ruído: usar `--detalhe .7`.
