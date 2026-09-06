import { ArrowLeft, Eye, LockKeyhole, UserCheck } from "lucide-react";
import { Link } from "wouter";

const sections = [
  ["1. Quem controla os dados", "Na operação do Marcamar, a empresa que constará no cadastro societário será a controladora dos dados tratados na plataforma. Até a publicação, os campos de identificação permanecem como placeholders: [RAZÃO SOCIAL], [CNPJ], [ENDEREÇO EM SÃO PAULO] e [E-MAIL DO ENCARREGADO]."],
  ["2. Dados que podemos tratar", "Conta e contato (nome, e-mail, telefone, cidade e foto); uso do serviço (rotas, reservas, mensagens, avaliações e suporte); e, para capitães, documentos da embarcação e habilitação. Não pedimos biometria facial ou dados criminais para publicidade."],
  ["3. Para que usamos", "Criar e proteger contas, localizar saídas, processar reservas, apoiar passageiros, prevenir fraude, revisar operadores, atender obrigações legais e melhorar o serviço. Cada finalidade deve usar a base legal adequada, como execução do contrato, obrigação legal, exercício regular de direitos, legítimo interesse ou consentimento."],
  ["4. Verificações de identidade e antecedentes", "A Polícia Federal oferece emissão e validação de certidão, mas não identificamos uma API pública para consultas arbitrárias. Por isso, o piloto recebe documentos oficiais e faz revisão humana. Uma integração futura com um provedor contratado (por exemplo, validação biométrica/biográfica do SERPRO) só será ativada após contrato, segurança e consentimento específico."],
  ["5. Dados sensíveis e consentimento", "Foto de perfil é dado pessoal. Biometria facial, quando necessária para prevenção de fraude, e informações criminais exigem cuidado reforçado, finalidade estrita, acesso limitado e retenção mínima. O consentimento será separado, informado e revogável quando essa for a base usada."],
  ["6. Compartilhamento", "Compartilhamos apenas o necessário com passageiros, operadores envolvidos na reserva, provedores de pagamento, hospedagem, suporte e autoridades quando houver obrigação legal. Não vendemos dados pessoais. Subcontratados devem seguir instruções, segurança e confidencialidade."],
  ["7. Retenção e segurança", "Mantemos dados pelo tempo necessário para a finalidade, prevenção de fraude, prestação de contas e prazos legais. Imagens e documentos de verificação ficam em armazenamento privado com acesso restrito; links públicos e indexação não fazem parte do fluxo pretendido. Nenhuma transmissão digital elimina todos os riscos."],
  ["8. Seus direitos", "Você pode pedir confirmação de tratamento, acesso, correção, anonimização, bloqueio, eliminação quando cabível, portabilidade, informação sobre compartilhamentos e revisão de decisões automatizadas. Pedidos serão avaliados conforme a LGPD e podem exigir confirmação de identidade."],
  ["9. Cookies e registros", "Usamos sessão e registros técnicos essenciais para autenticação, segurança e funcionamento. Preferências opcionais serão informadas separadamente. Não use a plataforma se o navegador estiver impedindo o armazenamento necessário para uma sessão segura."],
  ["10. Transferências e mudanças", "Serviços técnicos podem processar dados fora do Brasil. Nesses casos, adotaremos as salvaguardas exigidas pela LGPD. Esta política será atualizada quando a razão social, o provedor de identidade ou o modelo de pagamento forem definidos."],
];

export default function Privacy() {
  return (
    <div className="legal-page-v2">
      <div className="legal-page-v2-top"><Link href="/"><span className="content-page-v2-secondary-link"><ArrowLeft size={16} /> Voltar ao início</span></Link><span className="legal-page-v2-mark"><LockKeyhole size={18} /> Marcamar · Privacidade</span></div>
      <div className="legal-page-v2-icon-row"><Eye size={24} /><UserCheck size={24} /><LockKeyhole size={24} /></div>
      <p className="home-v2-kicker">POLÍTICA DE PRIVACIDADE · LGPD</p>
      <h1>Dados usados com propósito e cuidado.</h1>
      <p className="legal-page-v2-lead">Vigência: 06 de setembro de 2026 · Aplicável ao piloto do Marcamar no Estado de São Paulo.</p>
      <div className="legal-section-list-v2">{sections.map(([title, copy]) => <section key={title}><h2>{title}</h2><p>{copy}</p></section>)}</div>
      <div className="legal-page-v2-contact"><strong>Canal de privacidade</strong><p>Antes do lançamento, publicaremos o contato do encarregado e o endereço da empresa: <em>[E-MAIL DO ENCARREGADO] · [ENDEREÇO COMPLETO EM SÃO PAULO]</em>.</p></div>
      <p className="legal-page-v2-note">Documento de produto para revisão jurídica. A publicação definitiva deve identificar a controladora, bases legais, prazos de retenção, fornecedores e procedimento de atendimento aos titulares.</p>
    </div>
  );
}
