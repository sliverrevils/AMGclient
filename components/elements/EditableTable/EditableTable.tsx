import { useEffect, useState } from "react";
import { nanoid } from "@reduxjs/toolkit";
import styles from "./table.module.scss";
import { useSelector } from "react-redux";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import { clearForInput } from "@/utils/funcs";

export default function EditableTable({ saveFunc, descriptionsStr }: { saveFunc: (textJson: string) => void; descriptionsStr: string }) {
    //--vars
    let loaded;
    try {
        loaded = JSON.parse(descriptionsStr);
    } catch (err) {
        loaded = { about: descriptionsStr };
    }

    //--state
    const [headers, setHeaders] = useState<Array<{ name: string; id: string }>>(loaded?.headers || []);
    const [rows, setRows] = useState<Array<{ id: string; values: { id: string; value: number | string }[] }>>(loaded?.rows || []);
    const [about, setAbout] = useState(loaded?.about || "");

    //---SELECTORS

    const isAdmin: boolean = useSelector((state: any) => state.main.user.role === "admin");

    //--funcs

    //headers
    const onAddHeader = () => {
        setHeaders((state) => [...state, { name: `колонка ${state.length + 1}`, id: nanoid() }]);
        setRows((state) => state.map((row) => ({ ...row, values: [...row.values, { id: nanoid(), value: "" }] })));
    };
    const onDelHeader = (headerIndex, id: string) => {
        if (!confirm(`Удалть колонку "${headers[headerIndex].name}" со всеми данными ?`)) return;

        setHeaders((state) => state.filter((header) => header.id !== id));
        setRows((state) => state.map((row) => ({ ...row, values: row.values.filter((item, itemIdx) => itemIdx !== headerIndex) })));
    };
    const onChangeHeader = (event: React.ChangeEvent<HTMLTextAreaElement>, id: string) => {
        setHeaders((state) => state.map((header) => (header.id == id ? { ...header, name: clearForInput(event.target.value) } : header)));
    };
    //rows
    const onAddRow = () => {
        setRows((state) => [
            ...state,
            {
                id: nanoid(),
                values: Array(headers.length)
                    .fill({})
                    .map((el) => ({ id: nanoid(), value: "" })),
            },
        ]);
    };
    const onDelRow = (id: string) => {
        if (!confirm(`Удалть ряд со всеми данными ?`)) return;
        setRows((state) => state.filter((row) => row.id !== id));
    };
    const onChangeRowItem = (event: React.ChangeEvent<HTMLTextAreaElement>, rowIndex: number, id: string) => {
        setRows((state) =>
            state.map((row, rowIdx) => {
                if (rowIdx !== rowIndex) return row;
                return {
                    ...row,
                    values: row.values.map((item, itemIdx) => {
                        if (item.id !== id) return item;
                        return { ...item, value: clearForInput(event.target.value) };
                    }),
                };
            })
        );
    };

    //saveTableObj
    const onSaveTable = () => {
        const tableObj = {
            headers,
            rows,
            about,
        };
        saveFunc(JSON.stringify(tableObj));
    };

    //effects

    useEffect(() => {
        onSaveTable();
    }, [headers, rows, about]);

    // //test
    // useEffect(() => {
    //     console.log('ROWS', rows);
    // }, [rows])

    return (
        <div className={styles.blokWrap}>
            {/* {
            isAdmin
            ?<textarea value={about} onChange={event=>setAbout(event.target.value)} disabled={!isAdmin}/>
            :<div className={styles.title}>{about}</div>

        } */}
            <ReactQuill value={about} onChange={setAbout} readOnly={!isAdmin} theme={isAdmin ? "snow" : "bubble"} />
            <div className={styles.tableWrap}>
                <table className={styles.tableMain}>
                    <thead>
                        {headers.map((header, headerIndex) => (
                            <th key={header.id}>
                                {isAdmin ? (
                                    <textarea
                                        //type="text"
                                        value={header.name}
                                        onChange={(event) => onChangeHeader(event, header.id)}
                                        disabled={!isAdmin}
                                    />
                                ) : (
                                    <div>{header.name}</div>
                                )}
                                {isAdmin && <span onClick={() => onDelHeader(headerIndex, header.id)}>❌</span>}
                            </th>
                        ))}
                        {isAdmin && (
                            <th onClick={onAddHeader} className={`${styles.itemBtn}`} style={{ background: "lightgreen" }}>
                                <div className={styles.rowBtn}>➕</div>
                            </th>
                        )}
                    </thead>
                    <tbody>
                        {rows.map((row, rowIndex) => (
                            <tr key={row.id}>
                                {row.values.map((value, valueIndex) => (
                                    <td key={value.id}>
                                        {isAdmin ? (
                                            <textarea
                                                // type="text"
                                                value={value.value}
                                                onChange={(event) => onChangeRowItem(event, rowIndex, value.id)}
                                                disabled={!isAdmin}
                                            />
                                        ) : (
                                            <div style={{ textAlign: "center" }}>{value.value}</div>
                                        )}
                                    </td>
                                ))}
                                {isAdmin && (
                                    <td onClick={() => onDelRow(row.id)} className={`${styles.itemBtn} ${styles.rowDel}`} style={{ fontSize: 10 }}>
                                        ❌
                                    </td>
                                )}
                            </tr>
                        ))}
                        {isAdmin && (
                            <>
                                {!!headers.length && (
                                    <tr>
                                        <td onClick={onAddRow} className={styles.itemBtn} style={{ background: "lightgreen" }}>
                                            ➕
                                        </td>
                                    </tr>
                                )}
                                {/* <tr >
                                    <td onClick={onSaveTable} className={styles.itemBtn} style={{ background: 'lightblue' }}>сохранить</td>
                                </tr> */}
                            </>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
