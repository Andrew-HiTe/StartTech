/* Componente informativo Sobre o T-Draw e diagrama com missão, visão e valores */

import './SobreNos.css';

const SobreNos = (props) => {
    return(
        <section className='sobre_content'>
        <h2>Sobre o T-Draw</h2>
        <p>O Team Draw nasceu para simplificar a forma como empresas criam e organizam seus diagramas de projetos. Nossa ferramenta une segurança, colaboração e praticidade em um só lugar, permitindo que equipes trabalhem juntas, em tempo real, de onde estiverem. Com uma interface intuitiva e acesso 100% online, o Team Draw coloca o controle nas mãos do criador: quem pode visualizar, editar e acompanhar cada etapa do projeto. Mais do que uma plataforma, somos um aliado da produtividade e da inovação dentro das empresas.</p>
        <img src={props.valores} alt="DIagrama de missão, visão e valores do T-Draw" />
        </section>
    );
};

export default SobreNos;