export interface Game {
  id: number;
  titulo: string;
  duracao_media: number | null;
  categoria: string | null;
  desenvolvedora: string | null;
  distribuidora: string | null;
  data_lancamento: string | null;
  classificacao: string | null;
  generos: string | null;
  plataformas: string | null;
}

export interface Developer {
  id: number;
  nome: string;
  cnpj: string | null;
  estudio: string | null;
  diretor: string | null;
  pais: string | null;
  data_fundacao: string | null;
}

export interface Publisher { id: number; nome: string; cnpj: string | null; pais: string | null; }
export interface Platform  { id: number; nome: string; empresa: string | null; }
export interface Genre     { id: number; nome: string; }
export interface Rating    { id: number; faixa_etaria: string; }

export interface GameFormData {
  titulo: string;
  duracao_media: string;
  categoria: string;
  id_desenvolvedora: string;
  id_distribuidora: string;
  data_lancamento: string;
  id_classificacao: string;
  ids_generos: number[];
  ids_plataformas: number[];
}
