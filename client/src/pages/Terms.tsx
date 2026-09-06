import { ArrowLeft, FileText, MapPin, ShieldCheck, Ship } from "lucide-react";
import { Link } from "wouter";

const sections = [
  ["1. Quem é o Marcamar", "O Marcamar é uma plataforma de tecnologia que conecta passageiros a operadores independentes de pequenas lanchas. No lançamento, o serviço atende somente embarques e desembarques em pontos costeiros do Estado de São Paulo. O Marcamar não oferece rotas no Estado do Rio de Janeiro nesta fase."],
  ["2. Cadastro e conta", "Você deve informar dados verdadeiros, manter sua senha em sigilo e atualizar seu perfil. O uso da conta é pessoal. Podemos pedir confirmação de identidade, foto de perfil e documentos náuticos antes de publicar uma viagem ou liberar uma reserva."],
  ["3. Operadores e documentos náuticos", "O operador deve apresentar a habilitação náutica aplicável (como a CHA, quando cabível), o documento de inscrição da embarcação (TIE ou equivalente) e informações corretas sobre capacidade, ponto e horário. A aprovação do Marcamar é uma revisão operacional e não substitui a fiscalização ou a autorização da Marinha do Brasil."],
  ["4. Rotas, condições e embarque", "Horários, pontos, capacidade, preço e duração são publicados pelo operador e podem mudar por segurança, clima, maré ou orientação da autoridade marítima. Confirme o ponto de encontro no dia, siga a tripulação e nunca embarque em um local diferente do combinado sem confirmação."],
  ["5. Reservas, pagamentos e cancelamentos", "A reserva registra a solicitação de vagas. Regras de pagamento, cancelamento e reembolso aparecem antes da confirmação e podem envolver um provedor de pagamentos. Em caso de risco, o operador pode cancelar ou adiar a saída; o suporte orientará as alternativas disponíveis."],
  ["6. Conduta e segurança", "Não use o serviço para transportar itens proibidos, não ultrapasse a capacidade publicada e respeite passageiros, comunidades costeiras e o meio ambiente. Em emergência, priorize os canais oficiais e as instruções da tripulação."],
  ["7. Conteúdo e suspensão", "Você é responsável pelo que publica. Podemos remover conteúdo, suspender contas ou retirar uma rota quando houver fraude, risco, assédio, dados falsos ou descumprimento destes termos."],
  ["8. Privacidade e verificações", "O tratamento de dados pessoais segue a Política de Privacidade e a Lei Geral de Proteção de Dados (LGPD). Validações de identidade, certidões criminais e documentos náuticos só serão feitas para uma finalidade definida, com base legal adequada e acesso restrito."],
  ["9. Lei aplicável", "Estes termos são regidos pelas leis brasileiras, incluindo o Código de Defesa do Consumidor (Lei Federal nº 8.078/1990) e, quando aplicável à operação em São Paulo, a Lei Estadual nº 17.832/2023 e suas atualizações. Fica eleito o foro da Comarca de São Paulo/SP, respeitados os direitos do consumidor e qualquer foro obrigatório previsto em lei."],
];

export default function Terms() {
  return (
    <div className="legal-page-v2">
      <div className="legal-page-v2-top"><Link href="/"><span className="content-page-v2-secondary-link"><ArrowLeft size={16} /> Voltar ao início</span></Link><span className="legal-page-v2-mark"><FileText size={18} /> Marcamar · São Paulo</span></div>
      <div className="legal-page-v2-icon-row"><Ship size={24} /><ShieldCheck size={24} /><MapPin size={24} /></div>
      <p className="home-v2-kicker">TERMOS DE USO · VERSÃO DE PILOTO</p>
      <h1>Regras claras para viajar pela costa.</h1>
      <p className="legal-page-v2-lead">Vigência: 06 de setembro de 2026 · Operação inicial limitada ao Estado de São Paulo.</p>
      <div className="legal-section-list-v2">{sections.map(([title, copy]) => <section key={title}><h2>{title}</h2><p>{copy}</p></section>)}</div>
      <div className="legal-page-v2-contact"><strong>Identificação da empresa</strong><p>Razão social, CNPJ, endereço e canal de atendimento serão inseridos antes do lançamento público: <em>[preencher dados societários]</em>.</p></div>
      <p className="legal-page-v2-note">Este é um rascunho de produto e não substitui revisão por advogado brasileiro. As cláusulas devem ser ajustadas à razão social, ao contrato com operadores e ao modelo de pagamento definitivo.</p>
    </div>
  );
}
