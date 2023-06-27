import { useEffect, useRef } from 'react';
import styles from './modal.module.scss';

export default function Modal({children,closeModalFunc=()=>{}}){
    const conteinerRef=useRef<any>();

    useEffect(()=>{
       
        document.documentElement.style.overflow='hidden';
        

        return ()=>{document.documentElement.style.overflow='auto'};
    },[])

    return (
        <div ref={conteinerRef} className={styles.modalWrapper}>
            <div className={styles.modalClose} onClick={closeModalFunc}>
                X
            </div>
            <div className={styles.modalContent}>
                {children}
            </div>

        </div>
    )
}