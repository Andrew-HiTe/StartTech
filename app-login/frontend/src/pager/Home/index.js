import Header from '../../componentes/Header'
import ListaSuspensa from '../../componentes/ListaSuspensa'
import Text from '../../componentes/Text'
import './Home.css'

const Home = (props) => {
    return(
        <section>
            <Header imagens={props.imagem} onShowLogin={props.onShowLogin}/>
            <Text titulo="Diagramas inteligentes para projetos eficientes." paragrafo="Um gerenciador e criador de diagramas de projetos que une colaboração em tempo real com segurança. Organize ideias, conecte equipes e proteja cada etapa do seu projeto." diagrama={props.diag}/>
            <ListaSuspensa/>
        </section>
    )
}

export default Home