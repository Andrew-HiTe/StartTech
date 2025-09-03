import Buttons from '../Buttons'
import './Text.css'

const Text = (props) => {
    return(
        <main className='textmain'>
        <section className='texthome'>
            <div className='texthome-content'>
            <h1>{props.titulo}</h1>
            <p>{props.paragrafo}</p>
            <Buttons nameButton="Comece já"/>
            </div>
            <div className='texthome-diagrama'>
                <img src='./imagens/diagrama.jpg'/>
            </div>
        </section>

      
        </main>
    )
}

export default Text