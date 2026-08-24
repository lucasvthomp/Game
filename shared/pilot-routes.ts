export type PilotRoute = {
  id: string;
  origin: string;
  destination: string;
  region: string;
  active: boolean;
};

export const PILOT_ROUTES: PilotRoute[] = [
  { id: "sao-sebastiao-ilhabela", origin: "São Sebastião", destination: "Ilhabela", region: "Litoral Norte de São Paulo", active: true },
  { id: "ilhabela-sao-sebastiao", origin: "Ilhabela", destination: "São Sebastião", region: "Litoral Norte de São Paulo", active: true },
  { id: "ilhabela-bonete", origin: "Ilhabela", destination: "Bonete", region: "Ilhabela", active: true },
  { id: "bonete-ilhabela", origin: "Bonete", destination: "Ilhabela", region: "Ilhabela", active: true },
  { id: "ilhabela-castelhanos", origin: "Ilhabela", destination: "Castelhanos", region: "Ilhabela", active: true },
];
