import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav>
      <NavLink to="/games" className="brand">🎮 Catálogo de Jogos</NavLink>
      <NavLink to="/games"       className={({ isActive }) => isActive ? 'active' : ''}>Jogos</NavLink>
      <NavLink to="/developers"  className={({ isActive }) => isActive ? 'active' : ''}>Desenvolvedoras</NavLink>
      <NavLink to="/publishers"  className={({ isActive }) => isActive ? 'active' : ''}>Distribuidoras</NavLink>
    </nav>
  );
}
