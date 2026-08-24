import { ArrowLeft, LockKeyhole } from "lucide-react";
import { Link } from "wouter";

const sections = [
  ["O que usamos", "Dados de conta, perfil, rota, reserva e mensagens são usados para operar o serviço, apresentar viagens e manter o contexto do embarque."],
  ["Como protegemos", "Credenciais são tratadas pelo sistema de autenticação e documentos de operador não devem ser compartilhados fora dos fluxos previstos. Segredos de produção ficam no ambiente do serviço."],
  ["Com quem compartilhamos", "Detalhes necessários para uma reserva podem ser vistos pelas pessoas envolvidas na viagem. Não vendemos dados pessoais como parte do piloto."],
  ["Suas escolhas", "Você pode revisar o perfil, acompanhar reservas e pedir ajuda sobre um pedido de rota. Para dúvidas de privacidade, use o fluxo de ajuda do produto."],
];

export default function Privacy() {
  return <div className="legal-page-v2"><div className="legal-page-v2-top"><Link href="/"><span className="content-page-v2-secondary-link"><ArrowLeft size={16} /> Voltar ao início</span></Link><span className="legal-page-v2-mark"><LockKeyhole size={18} /> Documento Marcamar</span></div><p className="home-v2-kicker">PRIVACIDADE</p><h1>Seus dados devem ajudar a viagem, não complicá-la.</h1><p className="legal-page-v2-lead">Esta página resume, em linguagem simples, como o piloto usa informações para conectar passageiros e operadores.</p><div className="legal-section-list-v2">{sections.map(([title, copy]) => <section key={title}><h2>{title}</h2><p>{copy}</p></section>)}</div><p className="legal-page-v2-note">Este documento é uma versão de produto para o piloto e deve passar por revisão jurídica antes de uma operação pública.</p></div>;
}
