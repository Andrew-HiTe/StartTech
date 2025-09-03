import './Buttons.css'

const Buttons = (props) => {
    return(
        <div className='button'>
            <button>{props.nameButton}</button>
        </div>
    )
}

export default Buttons