import { useEffect, useRef } from 'react';
import styles from './modal.module.scss';

export default function Modal({children,closeModalFunc=()=>{},fullWidth=false}){
    const conteinerRef=useRef<any>();

    useEffect(()=>{
       
        document.documentElement.style.overflow='hidden';
        

        return ()=>{document.documentElement.style.overflow='auto'};
    },[])

    return (
        <div ref={conteinerRef} className={styles.modalWrapper}>
            
            <img src="svg/org/close_field_white.svg" onClick={closeModalFunc} className={styles.modalClose}/>
            
            <div className={styles.modalContent} style={{width:fullWidth?'100%':''}}>
                {children}
            </div>

        </div>
    )
}