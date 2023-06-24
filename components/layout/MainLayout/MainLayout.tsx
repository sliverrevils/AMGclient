import React from "react"
import styles from './main.module.scss';
import Aside from "@/components/modules/Aside/Aside";

export default function MainLayout({ children }) {
    return (
        <div className={`container ${styles.wrapper}`}>
            <Aside/>
            <main className={styles.content}>
            {children}
            </main>
                
            
        </div>
    )
}