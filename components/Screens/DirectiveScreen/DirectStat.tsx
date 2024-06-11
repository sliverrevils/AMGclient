import { IDirectHeader, RaportTableInfoI, StatItemLogic } from "@/types/types";
import DirectCell from "./DirectCell";

export default function DirectStat({ headers, stat, onChangeLogic }: { headers: IDirectHeader[]; stat: StatItemLogic; onChangeLogic: (statId: number, logicHeaderId: string, value: string) => void }) {
    return (
        <tr>
            {headers.map((header, headerIdx) => {
                if (!headerIdx) return <td>{stat.name}</td>;
                const onCurrentChangeLogic = onChangeLogic.bind(null, stat.id, header.id);
                const currentLogic = stat.logicStrArr.find((stat) => stat.headerId === header.id);
                if (!currentLogic) {
                    return <td>!!?логика</td>;
                }

                return <DirectCell logicStr={currentLogic.logicStr} onCurrentChangeLogic={onCurrentChangeLogic} cellIndex={headerIdx} stat={stat} columnName={headers[headerIdx].title} />;
            })}
        </tr>
    );
}
