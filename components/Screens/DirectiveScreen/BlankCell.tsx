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
                {/* {isModal && (
                <Modal closeModalFunc={() => setIsModal(false)} scrollOnTop={false} fullWidth={true}>
                    <div className={styles.modalMain}>
                        <textarea value={input} onChange={(event) => setInput(event.target.value)} />
                        <div onClick={() => onChange(input)}>Сохранить</div>
                    </div>
                </Modal>
            )} */}
                {!loaded ? (
                    <>
                        <textarea value={input} onChange={(event) => setInput(event.target.value)} onBlur={() => onChange(input)} />
                        {first && (
                            <div onClick={() => delRowFn()} className={styles.delBtn}>
                                <XCircleIcon width={30} />
                            </div>
                        )}
                    </>
                ) : (
                    <div className={styles.loaded}>{value}</div>
                )}

                {/* <div>{value}</div> */}
            </div>
        </td>
    );
}
