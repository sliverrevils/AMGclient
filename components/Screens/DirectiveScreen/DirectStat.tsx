import { IDirectHeader, RaportTableInfoI, StatItemLogic } from "@/types/types";
import DirectCell from "./DirectCell";

export default function DirectStat({ headers, stat, onChangeLogic }: { headers: IDirectHeader[]; stat: StatItemLogic; onChangeLogic: (statId: number, logicIdx: number, value: string) => void }) {
    return (
        <tr>
            {headers.map((header, headerIdx) => {
                if (!headerIdx) return <td>{stat.name}</td>;
                const onCurrentChangeLogic = onChangeLogic.bind(null, stat.id, headerIdx);
                return <DirectCell logicStr={stat.logicStrArr[headerIdx]} onCurrentChangeLogic={onCurrentChangeLogic} cellIndex={headerIdx} stat={stat} columnName={headers[headerIdx].title} />;
            })}
        </tr>
    );
}
