import { IChartPropListItem, IDirectHeader, RaportTableInfoI, StatItemLogic, StatItemReadyWithCoords } from "@/types/types";
import DirectCell from "./DirectCell";
import { clearStatName } from "@/utils/funcs";
import { ChartBarSquareIcon, DocumentArrowDownIcon, DocumentArrowUpIcon, EyeIcon, EyeSlashIcon, XCircleIcon } from "@heroicons/react/24/outline";
import styles from "./stat.module.scss";
import { toast } from "react-toastify";
import { useAccessRoutes } from "@/hooks/useAccessRoutes";
import { useState } from "react";
import StatView from "@/components/modules/ReportTables/CreateRaport2/StatView/StatView";

export default function DirectStat({
    headers,
    stat,
    onChangeLogic,
    setCharts,
    charts,
    onStatMoveUp,
    onStatMoveDown,
    onRemoveStat,
    saveScroll,
    cacheLogic,
    loaded,
}: {
    headers: IDirectHeader[];
    stat: StatItemLogic;
    onChangeLogic: (statId: number, logicHeaderId: string, value: string) => void;
    setCharts: React.Dispatch<React.SetStateAction<IChartPropListItem[]>>;
    charts: IChartPropListItem[];
    onStatMoveUp: (statId: number) => void;
    onStatMoveDown: (statId: number) => void;
    onRemoveStat: (statId: number) => void;
    saveScroll: () => void;
    cacheLogic: () => void;
    loaded: boolean;
}) {
    const addChartToggle = (statId: number) => {
        setCharts((state) => {
            if (!state.some((curChart) => curChart.statId === statId) && stat.dateColumn.raportInfo?.chartProps) {
                return [...state, { ...stat.dateColumn.raportInfo?.chartProps, statId, name: clearStatName(stat.name) }];
            } else {
                return state.filter((chart) => chart.statId !== statId);
            }
        });
    };

    const isOnCharts = charts.some((curChart) => curChart.statId === stat.id);

    const { accessedRoutes } = useAccessRoutes();
    const tabelsRoute = accessedRoutes.find((route) => route.id === 10);

    const [statView, setStatToView] = useState<StatItemReadyWithCoords | null>(null);
    return (
        <tr>
            {headers.map((header, headerIdx) => {
                //название статистики
                if (!headerIdx) {
                    return (
                        <td key={header.id + "_row" + headerIdx}>
                            <div className={styles.statNameCell}>
                                <StatView statView={statView} />
                                <div className={styles.statPositionBlock}>
                                    <DocumentArrowUpIcon width={20} onClick={() => onStatMoveUp(stat.id)} />
                                    <DocumentArrowDownIcon width={20} onClick={() => onStatMoveDown(stat.id)} />
                                </div>
                                <div
                                    className={styles.statNameBlock}
                                    onContextMenu={(event) => {
                                        event.preventDefault();
                                        tabelsRoute.clickFunc(stat.id);
                                    }}
                                    onMouseEnter={(event) => {
                                        if (!loaded) {
                                            const { x, y, width, height } = event.currentTarget.getBoundingClientRect();

                                            setStatToView({ ...stat, x, y: y + height + 10, type: "table" });
                                        }
                                    }}
                                    onMouseLeave={() => !loaded && setStatToView(null)}
                                >
                                    <div className={styles.name}>
                                        <span id="cell-value">{clearStatName(stat.name)}</span>
                                    </div>
                                    <div className={styles.period}>
                                        <div className={styles.periodStr}>{stat.periodStr}</div>
                                        <div className={styles.update}>{new Date(stat.lastUpdate).toLocaleString()}</div>
                                    </div>
                                </div>

                                <div className={styles.icoBtns}>
                                    <XCircleIcon
                                        display={loaded ? "none" : "block"}
                                        width={30}
                                        onClick={() => {
                                            !loaded && confirm(`Убрать статистику? \n \t "${clearStatName(stat.name)}"`) && onRemoveStat(stat.id);
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
                                                    saveScroll();
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
                    return <td key={header.id + "_row" + headerIdx}>!!?логика</td>;
                }

                return <DirectCell key={header.id + "_row" + headerIdx} logicStr={currentLogic.logicStr} onCurrentChangeLogic={onCurrentChangeLogic} cellIndex={headerIdx} stat={stat} columnName={headers[headerIdx].title} cacheLogic={cacheLogic} loaded={loaded} />;
            })}
        </tr>
    );
}
