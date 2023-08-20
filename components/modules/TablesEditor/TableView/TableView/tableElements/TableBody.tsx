import { RowI } from "@/types/types";

export default function TableBody({ rows, setIsFullScreenTable }
    : {
        rows: RowI[][],
        setIsFullScreenTable: React.Dispatch<React.SetStateAction<boolean>>
    }) {

    const onFullScreen=(event:React.MouseEvent<HTMLTableRowElement, MouseEvent>)=>{
        event.preventDefault()
        setIsFullScreenTable(true);
    }

    const onSelectRow=(row:any)=>{
        console.log('SELECTED ROW',row)
    }

    return (
        <>
            {
                rows.map((row, rowIndex) =>
                    <tr key={rowIndex + '_rowBody'} onContextMenu={onFullScreen} onClick={()=>onSelectRow(row)}>
                        
                        {row.map((item, itemIndex) =>
                            <td key={item.key}>
                                {item.value}
                            </td>
                        )}
                    </tr>
                )
            }
        </>
    )
}