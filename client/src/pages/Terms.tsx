import { ArrowLeft, FileText } from "lucide-react";
import { Link } from "wouter";

const sections = [
  ["Uso do piloto", "O Marcamar organiza pedidos e viagens de transporte aquático publicados por operadores independentes. A plataforma não substitui a operação, a tripulação ou as orientações oficiais."],
  ["Informações publicadas", "Horários, capacidade, preços e pontos dependem do que o operador publica. Confirme os detalhes antes do embarque e comunique qualquer alteração pela conversa da reserva."],
  ["Reservas e cancelamentos", "Uma reserva registra a solicitação de vagas e os detalhes da viagem. Regras de pagamento, cancelamento e reembolso podem depender da configuração do provedor e do operador."],
  ["Conduta", "Use a plataforma com dados verdadeiros, respeite a tripulação e os demais passageiros e não publique conteúdo que coloque pessoas ou a operação em risco."],
];

export default function Terms() {
  return <div className="legal-page-v2"><div className="legal-page-v2-top"><Link href="/"><span className="content-page-v2-secondary-link"><ArrowLeft size={16} /> Voltar ao início</span></Link><span className="legal-page-v2-mark"><FileText size={18} /> Documento Marcamar</span></div><p className="home-v2-kicker">TERMOS DE USO</p><h1>Um acordo simples para um piloto responsável.</h1><p className="legal-page-v2-lead">Estes termos explicam o uso do Marcamar como uma plataforma de conexão entre passageiros e operadores de lanchas.</p><div className="legal-section-list-v2">{sections.map(([title, copy]) => <section key={title}><h2>{title}</h2><p>{copy}</p></section>)}</div><p className="legal-page-v2-note">Este documento é uma versão de produto para o piloto e deve passar por revisão jurídica antes de uma operação pública.</p></div>;
}
