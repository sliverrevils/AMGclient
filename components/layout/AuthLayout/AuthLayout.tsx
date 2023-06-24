import React from "react"
import styles from './auth.module.scss';
export default function AuthLayout({ children }) {

    return (
        <div className={styles.wrapper}>
            <div className={styles.content}>
                {children}
            </div>
        </div>
    )
}