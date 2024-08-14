import Modal from "@/components/elements/Modal/Modal";
import { useState } from "react";
import styles from "./blank.module.scss";
import { XCircleIcon } from "@heroicons/react/24/outline";

export default function BlankCell({ loaded, first, value, onChange, delRowFn }: { loaded: boolean; first: boolean; value: string; onChange: Function; delRowFn: Function }) {
    const [isModal, setIsModal] = useState(false);
    const [input, setInput] = useState(value);
    return (
        <td onClick={() => setIsModal(true)} className={styles.blankCellMain}>
            <div className={styles.wrap}>
                {!loaded ? (
                    <>
                        <textarea value={input} onChange={(event) => setInput(event.target.value)} onBlur={() => onChange(input)} id="cell-value" />
                        {first && (
                            <div onClick={() => delRowFn()} className={styles.delBtn}>
                                <XCircleIcon width={30} />
                            </div>
                        )}
                    </>
                ) : (
                    <div className={styles.loaded} id="cell-value">
                        {value}
                    </div>
                )}
            </div>
        </td>
    );
}
