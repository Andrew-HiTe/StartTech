import './Buttons.css'

const Buttons = (props) => {
    return(
        <div className='button'>
            <button onClick={props.onClick}>{props.nameButton}</button>
        </div>
    )
}

export default Buttons