import {
  ArrowDownCircle,
  ArrowUpCircle,
  ChartPie,
  History,
  LayoutDashboard,
  Tags,
  Target,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

/** Itens do menu lateral da área logada. */
export const APP_NAVIGATION: NavItem[] = [
  { label: "Painel", href: "/dashboard", icon: LayoutDashboard, description: "Resumo do mês" },
  { label: "Entradas", href: "/entradas", icon: ArrowUpCircle, description: "Valores recebidos" },
  { label: "Saídas", href: "/saidas", icon: ArrowDownCircle, description: "Valores gastos" },
  { label: "Histórico", href: "/historico", icon: History, description: "Todas as movimentações" },
  { label: "Metas", href: "/metas", icon: Target, description: "Objetivos financeiros" },
  { label: "Relatórios", href: "/relatorios", icon: ChartPie, description: "Gráficos e análises" },
  { label: "Categorias", href: "/categorias", icon: Tags, description: "Origens dos valores" },
  { label: "Meu perfil", href: "/perfil", icon: UserRound, description: "Dados da conta" },
];

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/cadastro",
  recoverPassword: "/recuperar-senha",
  dashboard: "/dashboard",
} as const;
