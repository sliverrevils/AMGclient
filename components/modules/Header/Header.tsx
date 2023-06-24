import styles from './header.module.scss';

export default function Header(){
    return(
        <header className={styles.wrapper}>
            <div className='container'>
                <img src='img/logo.svg'/>
            </div>
        </header>
    )
}