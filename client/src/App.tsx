import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import Home from "@/pages/Home";
import Auth from "@/pages/Auth";
import Rides from "@/pages/Rides";
import RideDetail from "@/pages/RideDetail";
import CaptainProfile from "@/pages/CaptainProfile";
import CaptainDashboard from "@/pages/CaptainDashboard";
import Recurring from "@/pages/Recurring";
import MyReservations from "@/pages/MyReservations";
import Messages from "@/pages/Messages";
import Profile from "@/pages/Profile";
import Admin from "@/pages/Admin";
import RouteRequest from "@/pages/RouteRequest";
import Routes from "@/pages/Routes";
import Commercial from "@/pages/Commercial";
import Safety from "@/pages/Safety";
import Help from "@/pages/Help";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Notifications from "@/pages/Notifications";
import Accessibility from "@/pages/Accessibility";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Navbar />
        <div className="app-body">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/entrar" component={() => <Auth mode="login" />} />
            <Route path="/cadastro" component={() => <Auth mode="register" />} />
            <Route path="/viagens" component={Rides} />
            <Route path="/lanchas">{() => <Rides />}</Route>
            <Route path="/rotas" component={Routes} />
            <Route path="/comercial" component={Commercial} />
            <Route path="/seguranca" component={Safety} />
            <Route path="/ajuda" component={Help} />
            <Route path="/termos" component={Terms} />
            <Route path="/privacidade" component={Privacy} />
            <Route path="/acessibilidade" component={Accessibility} />
            <Route path="/notificacoes" component={Notifications} />
            <Route path="/viagens/:id" component={RideDetail} />
            <Route path="/perfil-capitao" component={CaptainProfile} />
            <Route path="/minha-lancha" component={CaptainDashboard} />
            <Route path="/recorrentes" component={Recurring} />
            <Route path="/minhas-reservas" component={MyReservations} />
            <Route path="/mensagens/:reservationId" component={Messages} />
            <Route path="/perfil" component={Profile} />
            <Route path="/admin" component={Admin} />
            <Route path="/solicitar-rota" component={RouteRequest} />
            <Route><div style={{ textAlign: "center", padding: 80, color: "var(--text2)" }}><h2 style={{ color: "var(--text1)" }}>404 — Página não encontrada</h2><a href="/" style={{ color: "var(--boat)" }}>Voltar ao início</a></div></Route>
          </Switch>
        </div>
        <Footer />
        <BottomNav />
      </AuthProvider>
    </QueryClientProvider>
  );
}
