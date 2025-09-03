import Buttons from '../Buttons'
import './Header.css'

const Header = (props) => {
    return(
        <header className='cabecalho'>
            <img src={props.imagens} alt='Logo T-Draw'/>
            <Buttons nameButton="Entrar"/>
        </header>
    )
}

export default Header