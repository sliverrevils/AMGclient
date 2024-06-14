import { IDirectHeader, RaportTableInfoI, StatItemLogic } from "@/types/types";
import DirectCell from "./DirectCell";
import { clearStatName } from "@/utils/funcs";
import { ChartBarSquareIcon, DocumentArrowDownIcon, DocumentArrowUpIcon, EyeIcon, EyeSlashIcon, XCircleIcon } from "@heroicons/react/24/outline";
import styles from "./stat.module.scss";
import { toast } from "react-toastify";

export default function DirectStat({
    headers,
    stat,
    onChangeLogic,
    setCharts,
    charts,
    onStatMoveUp,
    onStatMoveDown,
    onRemoveStat,
}: {
    headers: IDirectHeader[];
    stat: StatItemLogic;
    onChangeLogic: (statId: number, logicHeaderId: string, value: string) => void;
    setCharts: React.Dispatch<React.SetStateAction<number[]>>;
    charts: number[];
    onStatMoveUp: (statId: number) => void;
    onStatMoveDown: (statId: number) => void;
    onRemoveStat: (statId: number) => void;
}) {
    const addChartToggle = (statId: number) => {
        setCharts((state) => {
            if (!state.includes(statId)) {
                return [...state, statId];
            } else {
                return state.filter((id) => id !== statId);
            }
        });
    };

    const isOnCharts = charts.includes(stat.id);
    return (
        <tr>
            {headers.map((header, headerIdx) => {
                //название статистики
                if (!headerIdx) {
                    return (
                        <td>
                            <div className={styles.statNameCell}>
                                <div className={styles.statPositionBlock}>
                                    <DocumentArrowUpIcon width={20} onClick={() => onStatMoveUp(stat.id)} />
                                    <DocumentArrowDownIcon width={20} onClick={() => onStatMoveDown(stat.id)} />
                                </div>
                                <div className={styles.statName}>
                                    <div> {clearStatName(stat.name)}</div>
                                </div>
                                <div className={styles.icoBtns}>
                                    <XCircleIcon
                                        width={30}
                                        onClick={() => {
                                            confirm(`Убрать статистику? \n \t "${clearStatName(stat.name)}"`) && onRemoveStat(stat.id);
                                        }}
                                    />
                                    <ChartBarSquareIcon
                                        width={30}
                                        onClick={() => addChartToggle(stat.id)}
                                        // fill={isOnCharts ? "#FF8056" : "white"}
                                        color={isOnCharts ? "#FF8056" : "black"}
                                    />
                                    {isOnCharts ? (
                                        <EyeIcon
                                            width={25}
                                            onClick={(event) => {
                                                event.preventDefault();
                                                const chartBlock = document.querySelector(`#statId_${stat.id}`);

                                                if (chartBlock) {
                                                    chartBlock.scrollIntoView();
                                                }
                                            }}
                                        />
                                    ) : (
                                        <EyeSlashIcon width={25} />
                                    )}
                                </div>
                            </div>
                        </td>
                    );
                }
                const onCurrentChangeLogic = onChangeLogic.bind(null, stat.id, header.id);
                const currentLogic = stat.logicStrArr.find((stat) => stat.headerId === header.id);
                if (currentLogic === undefined) {
                    console.log("LOGIC", header.id, stat.logicStrArr);
                    return <td>!!?логика</td>;
                }

                return <DirectCell logicStr={currentLogic.logicStr} onCurrentChangeLogic={onCurrentChangeLogic} cellIndex={headerIdx} stat={stat} columnName={headers[headerIdx].title} />;
            })}
        </tr>
    );
}
