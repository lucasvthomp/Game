import { QueryClientProvider } from "@tanstack/react-query";
import { Router, Route, Switch } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";
import Navbar from "@/components/layout/Navbar";
import Home from "@/pages/Home";
import Auth from "@/pages/Auth";
import Rides from "@/pages/Rides";
import RideDetail from "@/pages/RideDetail";
import CaptainProfile from "@/pages/CaptainProfile";
import CaptainDashboard from "@/pages/CaptainDashboard";
import DriverProfile from "@/pages/DriverProfile";
import DriverDashboard from "@/pages/DriverDashboard";
import Recurring from "@/pages/Recurring";
import MyReservations from "@/pages/MyReservations";
import Profile from "@/pages/Profile";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Navbar />
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/entrar" component={() => <Auth mode="login" />} />
          <Route path="/cadastro" component={() => <Auth mode="register" />} />
          <Route path="/viagens" component={Rides} />
          <Route path="/caronas">{() => <Rides defaultType="car" />}</Route>
          <Route path="/lanchas">{() => <Rides defaultType="boat" />}</Route>
          <Route path="/viagens/:id" component={RideDetail} />
          <Route path="/perfil-capitao" component={CaptainProfile} />
          <Route path="/minha-lancha" component={CaptainDashboard} />
          <Route path="/perfil-motorista" component={DriverProfile} />
          <Route path="/meu-carro" component={DriverDashboard} />
          <Route path="/recorrentes" component={Recurring} />
          <Route path="/minhas-reservas" component={MyReservations} />
          <Route path="/perfil" component={Profile} />
          <Route>
            <div style={{ textAlign: "center", padding: 80, color: "var(--text2)" }}>
              <h2 style={{ color: "var(--text1)" }}>404 — Página não encontrada</h2>
              <a href="/" style={{ color: "var(--boat)" }}>Voltar ao início</a>
            </div>
          </Route>
        </Switch>
      </AuthProvider>
    </QueryClientProvider>
  );
}
