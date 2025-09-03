import './ListaSuspensa.css'

// const ListaSuspensa = (props) => {
//     return(
//         <section>
//             <h1>Nossa gama de funcionalidades</h1>
//             <ul>
//                 <li>
//                     <h3>Criação de diagramas online</h3>
//                     <p>Interface intuitiva para montar fluxos, mapas e representações visuais de projetos.</p>
//                 </li>
//             </ul>
//         </section>
//     )
// }

const funcionalidades = [
  {
    titulo: "Criação de diagramas online",
    descricao: "Interface intuitiva para montar fluxos, mapas mentais e representações visuais de projetos.",
    icone: "📝"
  },
  {
    titulo: "Segurança de dados",
    descricao: "Acesso restrito de acordo com as liberações e permissões definidas no projeto.",
    icone: "🔒"
  },
  {
    titulo: "Gestão de permissões",
    descricao: "Controle detalhado para quem pode visualizar ou editar cada diagrama.",
    icone: "🛡️"
  },
  {
    titulo: "Organização de projetos",
    descricao: "Criação de pastas e categorias para manter os projetos organizados e acessíveis rapidamente.",
    icone: "📂"
  },
  {
    titulo: "Colaboração em equipe",
    descricao: "Múltiplos usuários podem trabalhar simultaneamente nos mesmos projetos.",
    icone: "👥"
  },
  {
    titulo: "Acesso em nuvem",
    descricao: "Disponibilidade dos diagramas em qualquer dispositivo, a qualquer momento.",
    icone: "☁️"
  }
]

const ListaSuspensa = () => {
  return (
    <section className="funcionalidades">
      <h2>Nossa gama de funcionalidades</h2>
      <div className="funcionalidades-grid">
        {funcionalidades.map((item, index) => (
          <div key={index} className="funcionalidade-card">
            <div className="icon">{item.icone}</div>
            <h3>{item.titulo}</h3>
            <p>{item.descricao}</p>
          </div>
        ))}
      </div>
    </section>
  )
}


export default ListaSuspensa