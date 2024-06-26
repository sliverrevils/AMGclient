import { useEffect, useRef } from "react";
import styles from "./modal.module.scss";

export default function Modal({ children, closeModalFunc = () => {}, fullWidth = false, black = true, zIndex = 99, scrollOnTop = true }) {
    const conteinerRef = useRef<any>();
    const scrollY = useRef(0);
    useEffect(() => {
        scrollY.current = window.scrollY;
        scrollOnTop && window.scrollTo(0, 0);
        document.documentElement.style.overflow = "hidden";

        return () => {
            document.documentElement.style.overflow = "auto";
            scrollOnTop && window.scrollTo(0, scrollY.current);
        };
    }, []);

    return (
        <div ref={conteinerRef} className={styles.modalWrapper} style={{ zIndex }}>
            <div className={black ? styles.black : styles.white} onDoubleClick={() => closeModalFunc()} style={{ zIndex: zIndex }}></div>

            <img
                src={black ? "svg/org/close_field_white.svg" : "svg/org/close_field.svg"}
                onClick={(event) => {
                    event.stopPropagation();
                    closeModalFunc();
                }}
                style={{ zIndex: zIndex + 200 }}
                className={styles.modalClose}
            />

            <div className={styles.modalContent} style={{ width: fullWidth ? "100%" : "", zIndex }}>
                {children}
            </div>
        </div>
    );
}
