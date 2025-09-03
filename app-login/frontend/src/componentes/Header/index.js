import Buttons from '../Buttons'
import './Header.css'

const Header = () => {
    return(
        
        <header className='cabecalho'>
            <img src='./imagens/logomarca.png' alt=''/>
            <Buttons nameButton="Entrar"/>
        </header>
    )
}

export default Header