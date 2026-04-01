import { Sermon } from '../store/SermonContext'

export const generateSermonMock = async (
  baseText: string,
  version: string,
  duration: number,
): Promise<Omit<Sermon, 'id' | 'date'>> => {
  // Simulate AI generation delay
  await new Promise((resolve) => setTimeout(resolve, 4000))

  const isShort = duration < 35
  const snippet = baseText.length > 25 ? baseText.substring(0, 25) + '...' : baseText

  return {
    title: `A Mensagem de ${snippet}`,
    baseText,
    version,
    duration,
    content: {
      intro: `Meus amados irmãos, ao olharmos para a porção das Escrituras em "${baseText}", somos imediatamente confrontados com a majestade e a graça do nosso Senhor. O texto que temos diante de nós nesta versão ${version} nos convida a uma reflexão profunda sobre nosso caminhar cristão e as promessas eternas. Como o próprio Spurgeon dizia: "A Palavra de Deus é como um leão. Você não precisa defendê-la; basta soltá-la". Hoje, deixaremos que esta palavra rja em nossos corações.`,
      points: [
        {
          title: 'A Profundidade da Graça Insondável',
          text: 'A primeira verdade que salta aos nossos olhos neste texto é a inesgotável graça de Deus. A graça não é apenas o favor imerecido, mas a força operante que nos sustenta nas horas mais sombrias. Vemos aqui que Deus nos alcança exatamente onde estamos, não onde deveríamos estar. Ele desce ao nosso nível para nos elevar ao Seu.',
        },
        {
          title: 'O Chamado à Santidade Prática',
          text: 'Em segundo lugar, a graça não nos deixa como nos encontrou. Ela nos chama para um padrão mais elevado. A verdadeira resposta ao amor de Deus manifestado nesta passagem é uma vida de separação do mundo e consagração ao Seu propósito. A santidade não é uma opção para o crente, é a sua nova natureza fluindo de dentro para fora.',
        },
        ...(!isShort
          ? [
              {
                title: 'A Esperança Inabalável no Soberano',
                text: 'Por fim, observemos a âncora que este texto nos fornece. Em tempos de tribulação e incerteza, a promessa divina permanece firme e inabalável. A nossa esperança não está fundamentada em circunstâncias passageiras ou na força do nosso próprio braço, mas na rocha eterna que é Cristo Jesus.',
              },
            ]
          : []),
      ],
      conclusion:
        'Concluindo, amados, que esta palavra não apenas ressoe em nossos ouvidos neste momento, mas que crie raízes profundas em nossos corações. Que possamos sair daqui não apenas como ouvintes complacentes, mas como praticantes zelosos desta verdade viva. Que o Espírito Santo aplique esta palavra ao seu coração com poder e convicção. Amém.',
    },
    insights: [
      'Tom de Voz: Mantenha um tom pastoral e acolhedor na introdução para ganhar a atenção e a confiança da congregação.',
      "Pausa Estratégica: No Ponto 2, faça uma pausa intencional de 3 segundos antes de falar sobre 'separação do mundo' para enfatizar a seriedade do chamado.",
      "Ilustração Sugerida: Use uma metáfora sobre 'âncoras na tempestade' no último ponto para tornar a mensagem visual e memorável para os ouvintes visuais.",
      'Apelo Final: Termine com um convite claro, chamando aqueles que precisam de renovação espiritual a se renderem a Cristo no altar.',
    ],
    references: [
      'Efésios 2:8-9 - Para reforçar fortemente o ponto sobre a salvação pela graça.',
      '1 Pedro 1:15-16 - Como base de apoio primária para o chamado prático à santidade.',
      'Hebreus 6:19 - Para consolidar biblicamente a ideia da esperança inabalável na conclusão.',
      'Salmos 119:105 - Para encorajar a meditação contínua na Palavra durante a semana.',
    ],
  }
}
