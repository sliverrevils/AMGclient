import React, { useEffect, useMemo, useRef, useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement, scales, ChartArea, Filler } from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { clearStatName, getChartImage, hexToRgba, logicMath } from "@/utils/funcs";

import styles from "./chart.module.scss";
// import faker from 'faker';
import chartTrendline from "chartjs-plugin-trendline";
import ChartDataLabels from "chartjs-plugin-datalabels";

//import chartTrendline from './trend';
import { CostumLineI } from "@/types/types";
import { linearRegression } from "@/utils/trend";

//ICONS
import { ViewfinderCircleIcon, CodeBracketSquareIcon, ExclamationCircleIcon, ChartBarSquareIcon, EllipsisVerticalIcon, AdjustmentsHorizontalIcon, BeakerIcon, ChartBarIcon, ArrowPathIcon, ChatBubbleBottomCenterTextIcon, CheckCircleIcon, ChevronDownIcon, HashtagIcon, MapIcon, MapPinIcon, VariableIcon, BarsArrowUpIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline";
import { CheckBadgeIcon, XCircleIcon, CameraIcon } from "@heroicons/react/24/solid";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, chartTrendline, ChartDataLabels, Filler);

interface IChartSavedProps {
    lineWidth: number;
    showPointData: boolean;
    isShowTrendPoint: boolean;
    softAngels: number;
    gridWidthX: number;
    gridWidthY: number;
    stepSizeY: number;
    fontSizeX: number;
    fontSizeY: number;
    isShowBlank: TShowBlankProp;
}
type TCurrentChartVie = "local" | "default" | "this";

type TShowBlankProp = "все" | "тренд" | "нет";

const defaultLocalSettingsMin: IChartSavedProps = {
    lineWidth: 3,
    showPointData: false,
    isShowTrendPoint: true,
    softAngels: 1,
    gridWidthX: 1,
    gridWidthY: 1,
    stepSizeY: 0,
    fontSizeX: 12,
    fontSizeY: 12,
    isShowBlank: "все",
};
const defaultLocalSettingsBig: IChartSavedProps = {
    lineWidth: 3,
    showPointData: false,
    isShowTrendPoint: true,
    softAngels: 1,
    gridWidthX: 2,
    gridWidthY: 2,
    stepSizeY: 0,
    fontSizeX: 15,
    fontSizeY: 15,
    isShowBlank: "все",
};

export function MultiLinesChart2({
    dates,
    chartSchema,
    clickFunc,
    costumsLines,
    reverseTrend,
    showBtns = true,
    chartName = "",
    showX = true,
    linesBtns = true,
    mini = false,
}: {
    dates: { start: number; end: number }[];
    chartSchema?: any;
    clickFunc?: any;
    costumsLines: CostumLineI[];
    reverseTrend?: boolean;
    showBtns?: boolean;
    chartName: string;
    showX?: boolean;
    linesBtns?: boolean;
    mini?: boolean;
}) {
    //ПОДГРУЗКА ДЕФОЛТНЫХ НАСТРОЕК ГРАФИКА📅
    const lsDefMin = JSON.parse(localStorage.getItem("defaultChartView_min") || "null");
    const lsDefBig = JSON.parse(localStorage.getItem("defaultChartView_big") || "null");
    const lsCurMin = JSON.parse(localStorage.getItem(`${clearStatName(chartName)}_min`) || "null");
    const lsCurBig = JSON.parse(localStorage.getItem(`${clearStatName(chartName)}_big`) || "null");
    const defaultChart: { min: IChartSavedProps; big: IChartSavedProps } = {
        min: lsDefMin || defaultLocalSettingsMin,
        big: lsDefBig || defaultLocalSettingsBig,
    };
    const currentChart: { min: IChartSavedProps; big: IChartSavedProps } = {
        min: lsCurMin || defaultChart.min,
        big: lsCurBig || defaultChart.big,
    };

    //ЗАГРУЖАЕМ ДЕФОЛТ МЕЛКОГО РАЗМЕРА ИЛИ ДЕФОЛТ ЛОКАЛЬНЫЙ

    //console.log("📈", defaultChart.min);

    //REF
    const chartRef = useRef<any>();
    //STATE
    const [modal, setModal] = useState(false);

    const [reverse, setReverse] = useState(reverseTrend);

    //menu
    const [currentChartView, setCurrentChartView] = useState<TCurrentChartVie>("local");
    const [isShowMenu, setIsShowMenu] = useState(false);
    const [showPointData, setShowPointData] = useState(currentChart.min.showPointData);
    const [lineWidth, setLineWidth] = useState(currentChart.min.lineWidth);
    const [linesFill, setLinesFill] = useState<{ name: string; fill: boolean; color: string }[]>(costumsLines.map((line) => ({ name: line.name, fill: line.fill, color: line.color })));
    const onChangeLineFillToggle = (idx: number) => setLinesFill((state) => state.map((line, lineIdx) => (lineIdx === idx ? { ...line, fill: !line.fill } : line)));
    const [isShowTrendPoint, setIsShowTrendPoint] = useState(currentChart.min.isShowTrendPoint);
    const [softAngels, setSoftAngels] = useState(currentChart.min.softAngels);
    const [gridWidthX, setGridWidthX] = useState(currentChart.min.gridWidthX);
    const [gridWidthY, setGridWidthY] = useState(currentChart.min.gridWidthY);
    const stepsArrY = [0, 1, 2, 5, 10, 50, 100, 500, 1000];
    const [stepSizeY, setSetepSizeY] = useState(0);
    const onChangeStepSizeY = (falling: boolean) => {
        setSetepSizeY((state) => {
            const idx = stepsArrY.findIndex((num) => num === state);
            if (falling) return stepsArrY[idx < stepsArrY.length - 1 ? idx + 1 : 0];
            else return stepsArrY[idx > 0 ? idx - 1 : stepsArrY.length - 1];
        });
    };
    const [fontSizeY, setFontSizeY] = useState(10);
    const [fontSizeX, setFontSizeX] = useState(10);
    const [isShowBlank, setIsShowBlank] = useState<TShowBlankProp>("все");
    const showArr: TShowBlankProp[] = ["все", "тренд", "нет"];
    const onChangeShowBlank = (falling: boolean) => {
        setIsShowBlank((state) => {
            const idx = showArr.findIndex((num) => num === state);
            console.log(idx);
            if (falling) return showArr[idx < showArr.length - 1 ? idx + 1 : 0];
            else return showArr[idx > 0 ? idx - 1 : showArr.length - 1];
        });
    };
    //SAVE
    const [isSave, setIsSave] = useState(false);

    //FUNCS
    const saveAsDefaultView = () => {
        const savedObg: IChartSavedProps = {
            lineWidth,
            showPointData,
            isShowTrendPoint,
            softAngels,
            gridWidthX,
            gridWidthY,
            stepSizeY,
            fontSizeY,
            fontSizeX,
            isShowBlank,
        };
        localStorage.setItem(`defaultChartView_${modal ? "big" : "min"}`, JSON.stringify(savedObg));
        setIsShowMenu(false);
        setCurrentChartView("default");
    };

    const deleteDefaultView = () => {
        localStorage.removeItem(`defaultChartView_${modal ? "big" : "min"}`);

        setIsShowMenu(false);
        setCurrentChartView("local");

        const defaultView = modal ? defaultLocalSettingsBig : defaultLocalSettingsMin;

        setGridWidthX(defaultView.gridWidthX);
        setGridWidthY(defaultView.gridWidthY);
        setIsShowTrendPoint(defaultView.isShowTrendPoint);
        setLineWidth(defaultView.lineWidth);
        setShowPointData(defaultView.showPointData);
        setSoftAngels(defaultView.softAngels);
        setSetepSizeY(defaultView.stepSizeY);
        setFontSizeX(defaultView.fontSizeX);
        setFontSizeY(defaultView.fontSizeY);
    };

    const deletePersonalView = () => {
        localStorage.removeItem(modal ? `${clearStatName(chartName)}_big` : `${clearStatName(chartName)}_min`);

        setIsShowMenu(false);

        setCurrentChartView(!!localStorage.getItem(modal ? "defaultChartView_big" : "defaultChartView_min") ? "default" : "local");

        setGridWidthX(defaultChart[modal ? "big" : "min"].gridWidthX);
        setGridWidthY(defaultChart[modal ? "big" : "min"].gridWidthY);
        setIsShowTrendPoint(defaultChart[modal ? "big" : "min"].isShowTrendPoint);
        setLineWidth(defaultChart[modal ? "big" : "min"].lineWidth);
        setShowPointData(defaultChart[modal ? "big" : "min"].showPointData);
        setSoftAngels(defaultChart[modal ? "big" : "min"].softAngels);
        setSetepSizeY(defaultChart[modal ? "big" : "min"].stepSizeY);
        setFontSizeX(defaultChart[modal ? "big" : "min"].fontSizeX);
        setFontSizeY(defaultChart[modal ? "big" : "min"].fontSizeY);
        setIsShowBlank(defaultChart[modal ? "big" : "min"].isShowBlank);
    };

    const saveForCurrentChartView = () => {
        const savedObg: IChartSavedProps = {
            lineWidth,
            showPointData,
            isShowTrendPoint,
            softAngels,
            gridWidthX,
            gridWidthY,
            stepSizeY,
            fontSizeX,
            fontSizeY,
            isShowBlank,
        };
        localStorage.setItem(`${clearStatName(chartName)}_${modal ? "big" : "min"}`, JSON.stringify(savedObg));
        setIsShowMenu(false);
        setCurrentChartView("this");
    };

    const updateChartViewStatus = () => {
        setCurrentChartView(() => {
            let currentTemp: TCurrentChartVie = "local";
            if (modal) {
                if (lsDefBig) currentTemp = "default";
                if (lsCurBig) currentTemp = "this";
            } else {
                if (lsDefMin) currentTemp = "default";
                if (lsCurMin) currentTemp = "this";
            }
            return currentTemp;
        });
    };

    const onCancelMenu = () => {
        setIsShowMenu((state) => !state);
        setIsSave((state) => false);
    };

    const fixGreenColor = (colorStr: string): string => (colorStr.includes("green") ? "#398f1f" : colorStr);

    //SELECTORS

    useEffect(() => {
        //console.log('CHART COMP lines',costumsLines);
        chartRef.current?.update();
    }, [costumsLines]);

    useEffect(() => {
        setReverse(reverseTrend);
        // console.log('TREND REVERSE', reverseTrend)
    }, [reverseTrend]);

    useEffect(() => {
        setLinesFill(costumsLines.map((line) => ({ name: line.name, fill: line.fill, color: line.color })));
    }, [costumsLines]);

    useEffect(() => {
        if (costumsLines.length) {
            const x = costumsLines[0].records.map((el, index) => index + 1);
            const y = costumsLines[0].records;

            const trend = linearRegression(x, y);

            // console.log('COSTUM TREND', trend)
        }
    }, [costumsLines]);

    //ON Modal
    useEffect(() => {
        document.documentElement.style.overflow = modal ? "hidden" : "auto";
        console.log("LOAD", currentChart[modal ? "big" : "min"]);
        setGridWidthX(currentChart[modal ? "big" : "min"].gridWidthX);
        setGridWidthY(currentChart[modal ? "big" : "min"].gridWidthY);
        setIsShowTrendPoint(currentChart[modal ? "big" : "min"].isShowTrendPoint);
        setLineWidth(currentChart[modal ? "big" : "min"].lineWidth);
        setShowPointData(currentChart[modal ? "big" : "min"].showPointData);
        setSoftAngels(currentChart[modal ? "big" : "min"].softAngels);
        setSetepSizeY(currentChart[modal ? "big" : "min"].stepSizeY);
        setFontSizeX(currentChart[modal ? "big" : "min"].fontSizeX);
        setFontSizeY(currentChart[modal ? "big" : "min"].fontSizeY);
        setIsShowBlank(currentChart[modal ? "big" : "min"].isShowBlank);
        //
        updateChartViewStatus();
    }, [modal]);

    //
    useEffect(() => {
        if (!chartRef.current) {
            chartRef.current = "inited";
            updateChartViewStatus();
        }
    }, []);

    const statusChartViewObj = {
        this: { color: "blue", help: "Индивидуальная настройка для этого графика" },
        default: { color: "gray", help: "Вид для всех графиков" },
        local: { color: "lightgray", help: "Стандартное отображение" },
    };

    const lineSelect = useMemo(() => {
        return (
            <select defaultValue={lineWidth} value={lineWidth} onChange={(event) => setLineWidth(Number(event.target.value))}>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
                <option value={6}>6</option>
                <option value={7}>7</option>
            </select>
        );
    }, [lineWidth]);
    return (
        <div className={`${modal ? styles.modal : ""} ${styles.chartWrap}`}>
            {modal && (
                <div className={styles.closeBtn} onClick={() => setModal(false)}>
                    ❌
                </div>
            )}
            <div className={styles.chartViewStatus}>
                <div className={styles.help}>{statusChartViewObj[currentChartView].help} </div>
                <CheckBadgeIcon fill={statusChartViewObj[currentChartView].color} width={20} />
            </div>
            {isShowMenu && ( // МЕНЮ ⭐
                <div
                    className={`${styles.chartMenu} noselect`}
                    onContextMenu={(event) => {
                        event.preventDefault();
                        //setIsShowMenu(false);
                    }}
                >
                    <div className={styles.closeMenuBtn} onClick={onCancelMenu}>
                        <XCircleIcon width={25} fill="tomato" fillOpacity={0.4} />
                    </div>
                    {!isSave ? (
                        <div className={styles.setttingsBlock}>
                            <div className={styles.menuTitle}>
                                <AdjustmentsHorizontalIcon width={17} /> Настройки графика
                            </div>
                            <div className={styles.menuTitle}>{modal ? "для полноэкранного размера" : "стандартного размера"}</div>
                            <div
                                className={styles.item}
                                onClick={() => {
                                    setModal((state) => !state);
                                    setIsShowMenu(false);
                                }}
                            >
                                <ViewfinderCircleIcon width={17} /> На весь экран
                            </div>
                            <div className={styles.item} onClick={() => setReverse((state) => !state)}>
                                <ArrowPathIcon width={17} /> Перевернуть график
                            </div>

                            <div className={styles.item} onClick={() => setShowPointData((state) => !state)}>
                                <ChatBubbleBottomCenterTextIcon width={17} /> Отображать данные точек : {showPointData ? "да" : "нет"}
                            </div>
                            <div className={styles.item} onClick={() => onChangeShowBlank(true)} onContextMenu={() => onChangeShowBlank(false)}>
                                <ExclamationCircleIcon width={17} /> Отображать незаполненные : {isShowBlank}
                            </div>
                            <div className={styles.item} onClick={() => setIsShowTrendPoint((state) => !state)}>
                                <ArrowTrendingUpIcon width={17} /> Отображать точки тренда : {isShowTrendPoint ? "да" : "нет"}
                            </div>
                            <div className={styles.item} onClick={() => setSoftAngels((state) => (state < 4 ? state + 1 : 0))} onContextMenu={() => setSoftAngels((state) => (state > 0 ? state - 1 : 5))}>
                                <ChevronDownIcon width={17} /> Закругление углов : {softAngels || "нет"}
                            </div>
                            <div className={styles.item} onClick={() => setGridWidthX((state) => (state < 3 ? state + 1 : 0))} onContextMenu={() => setGridWidthX((state) => (state > 0 ? state - 1 : 3))}>
                                <ChartBarIcon width={17} /> Толщина сетки по X: {gridWidthX || "нет"}
                            </div>
                            <div className={styles.item} onClick={() => setGridWidthY((state) => (state < 3 ? state + 1 : 0))} onContextMenu={() => setGridWidthY((state) => (state > 0 ? state - 1 : 3))}>
                                <ChartBarIcon width={17} /> Толщина сетки по Y: {gridWidthY || "нет"}
                            </div>

                            <div className={styles.item} onClick={() => setFontSizeX((state) => (state < 20 ? state + 1 : 10))} onContextMenu={() => setFontSizeX((state) => (state > 10 ? state - 1 : 20))}>
                                <VariableIcon width={17} /> Размер текста по X: {fontSizeX}
                            </div>
                            <div className={styles.item} onClick={() => setFontSizeY((state) => (state < 20 ? state + 1 : 10))} onContextMenu={() => setFontSizeY((state) => (state > 10 ? state - 1 : 20))}>
                                <VariableIcon width={17} /> Размер текста по Y: {fontSizeY}
                            </div>

                            <div className={styles.item} onClick={() => onChangeStepSizeY(true)} onContextMenu={() => onChangeStepSizeY(false)}>
                                <BarsArrowUpIcon width={17} /> Шаг линии Y : {stepSizeY || "авто"}
                            </div>
                            <div className={styles.itemSelect}>
                                <div onClick={() => setLineWidth((state) => (state < 7 ? state + 1 : 1))}>
                                    <EllipsisVerticalIcon width={17} />
                                    Толщина линии
                                </div>
                                {lineSelect}
                            </div>
                            <div className={styles.itemBlock}>
                                <div className={styles.titleBlock}>Заливка фона линии</div>
                                {linesFill.map((line, idx) => (
                                    <div className={styles.itemBtn} onClick={() => onChangeLineFillToggle(idx)}>
                                        <span style={{ color: line.color }}>{line.name} : </span>
                                        {line.fill ? "да" : "нет"}
                                    </div>
                                ))}
                            </div>
                            <div className={`${styles.item} ${styles.save}`} onClick={() => setIsSave(() => true)}>
                                Сохранить
                            </div>
                        </div>
                    ) : (
                        <div className={styles.btnsBlock}>
                            <div className={styles.btnsBlock}>Сохранение</div>
                            <div className={styles.btn} onClick={() => getChartImage(chartSchema.name, true)}>
                                <CameraIcon width={30} fillOpacity={0.5} />
                                <div className={styles.text}>
                                    <div className={styles.btnTitle}> Сохранить изображение</div>
                                </div>
                            </div>
                            <div className={styles.btn} onClick={saveForCurrentChartView}>
                                <CheckBadgeIcon className={styles.ico} fill={statusChartViewObj.this.color} width={30} />
                                <div className={styles.text}>
                                    <div className={styles.btnTitle}>Сохранить</div>
                                    <div className={styles.btnHelp}> для этой статистики</div>
                                </div>
                            </div>
                            {currentChartView === "this" && (
                                <div className={styles.btn} onClick={deletePersonalView}>
                                    <XCircleIcon width={30} fill={statusChartViewObj.this.color} />
                                    <div className={styles.text}>
                                        <div className={styles.btnTitle}>Сброс</div>
                                        <div className={styles.btnHelp}> индивидуальных настроек графика</div>
                                    </div>
                                </div>
                            )}
                            <div className={styles.btn} onClick={saveAsDefaultView}>
                                <CheckBadgeIcon className={styles.ico} fill={statusChartViewObj.default.color} width={30} />
                                <div className={styles.text}>
                                    <div className={styles.btnTitle}>Сохранить для всех</div>
                                    <div className={styles.btnHelp}> как стандартный вид для всех</div>
                                </div>
                            </div>
                            {currentChartView === "default" && (
                                <div className={styles.btn} onClick={deleteDefaultView}>
                                    <XCircleIcon width={30} fill={statusChartViewObj.default.color} />
                                    <div className={styles.text}>
                                        <div className={styles.btnTitle}>Сброс</div>
                                        <div className={styles.btnHelp}> стандартных настроек для всех</div>
                                    </div>
                                </div>
                            )}

                            {/* <div className={styles.btn} onClick={saveAsDefaultView}>
                                <div className={styles.btnTitle}> Сохранить для всех</div>
                                <div className={styles.btnHelp}> как отображение по умолчанию</div>
                            </div>
                            <div className={styles.btn} onClick={deleteDefaultView}>
                                <div className={styles.btnTitle}> Очистить стандартный вид</div>
                                <div className={styles.btnHelp}> у всех графиков</div>
                            </div> */}
                        </div>
                    )}
                </div>
            )}

            <Line
                className="myChart"
                ref={chartRef}
                options={{
                    backgroundColor: "red",
                    //resizeDelay: 200,
                    responsive: true,
                    aspectRatio: 1.77, //соотношение сторон
                    interaction: {
                        mode: "index" as const,
                        intersect: false,
                    },

                    //pointLabel: true,
                    //stacked: false,
                    plugins: {
                        title: {
                            display: !!chartName,
                            text: clearStatName(chartName),
                            color: "black",
                            font: {
                                family: "Roboto",
                                size: modal ? 20 : 15,
                                weight: "600",
                            },
                        },
                        legend: {
                            position: "top",
                            align: "center",
                            display: linesBtns || modal,

                            labels: {
                                //usePointStyle: true,
                                //pointStyle: "circle",
                                color: "black",

                                font: {
                                    family: "Roboto",
                                    style: "normal",
                                    size: modal ? 14 : 11,
                                    weight: "600",
                                },
                                boxWidth: 10,
                                boxHeight: 10,
                            },
                        },
                    },

                    scales: {
                        y: {
                            type: "linear" as const,
                            display: true,
                            position: "left" as const,
                            reverse,
                            ticks: {
                                autoSkip: true,
                                stepSize: stepSizeY, // шаг чисел
                                font: {
                                    size: fontSizeY,
                                    style: "italic",
                                    weight: "600",
                                },
                            },
                            grid: {
                                lineWidth: gridWidthY,

                                // tickColor: "red",
                                // tickWidth: 10,
                                // tickLength: 22,
                            },
                        },
                        // y: {
                        //   type: 'linear' as const,
                        //   display: true,
                        //   position: 'left' as const,
                        // },
                        y1: {
                            type: "linear" as const,
                            display: false,
                            position: "right" as const,
                            grid: {
                                drawOnChartArea: false,
                            },
                            // ticks:{
                            //   stepSize:1,
                            // },
                            reverse,
                        },
                        // y1: {
                        //   type: 'linear' as const,
                        //   display: true,
                        //   position: 'right' as const,
                        //   grid: {
                        //     drawOnChartArea: false,
                        //   }
                        // },
                        x: {
                            display: modal || showX,
                            grid: { color: "lightgray", lineWidth: gridWidthX },

                            ticks: {
                                color(ctx, options) {
                                    //ЦВЕТ ДАТЫ ПО ТРЕНДУ
                                    let color = "gray";

                                    const {
                                        index, // позиция точки (с нуля)
                                    } = ctx;

                                    //console.log(dataIndex);
                                    if (isShowTrendPoint) {
                                        const trendLine = costumsLines.find((line) => /^тренд/.test(line.name.toLocaleLowerCase()));
                                        if (trendLine && trendLine?.growingArr) {
                                            if (trendLine.growingArr[index] !== undefined)
                                                if (trendLine.growingArr[index]) {
                                                    color = "blue";
                                                } else {
                                                    color = "red";
                                                }
                                        }
                                    }
                                    return color;
                                },
                                font(ctx, options) {
                                    let weight = "500";
                                    const {
                                        index, // позиция точки (с нуля)
                                    } = ctx;

                                    if (isShowTrendPoint) {
                                        const trendLine = costumsLines.find((line) => /^тренд/.test(line.name.toLocaleLowerCase()));
                                        if (trendLine && trendLine.growingArr && trendLine.growingArr[index] !== undefined)
                                            if (trendLine && trendLine?.growingArr) {
                                                if (trendLine.growingArr[index]) {
                                                    weight = "600";
                                                } else {
                                                    weight = "600";
                                                }
                                            }
                                    }
                                    return {
                                        size: fontSizeX,
                                        style: "italic",
                                        weight,
                                    };
                                },
                            },
                        },
                    },
                }}
                data={{
                    labels: dates
                        .map((el, elIdx) => {
                            // ДАТЫ🕛
                            // НЕ ПОКАЗЫВАТЬ ПУСТЫЕ ЗАПИСИ
                            let length = 0;

                            costumsLines.forEach((line) => {
                                if (isShowBlank === "нет") {
                                    const curLength = line.records.filter((num) => !Number.isNaN(num)).length - 1;
                                    if (length < curLength) {
                                        length = curLength;
                                    }
                                }

                                if (isShowBlank === "тренд") {
                                    if (/^тренд/.test(line.name.toLocaleLowerCase())) {
                                        length = line.records.filter((num) => !Number.isNaN(num)).length - 1;
                                        //line.records.length
                                    }
                                }
                            });
                            if (isShowBlank === "все" || elIdx <= length) return `${new Date(+el.start).toLocaleDateString()} - ${new Date(+el.end).toLocaleDateString()}`;
                        })
                        .filter((date) => !!date),
                    // labels: [1, 2, 3],

                    datasets: costumsLines.map((line, lineIdx) => ({
                        //заливка фона
                        fill: linesFill[lineIdx]?.fill,
                        backgroundColor: /^тренд/.test(line.name.toLocaleLowerCase()) ? "rgba(128, 128, 128,.2)" : hexToRgba(fixGreenColor(line.color), 0.2), //заливка
                        type: "line",
                        label: line.name,
                        borderColor: line.color, //цвет линии
                        pointStyle: "circle", //форма точки
                        pointRadius: lineWidth, // радиус сейчас как толщина линии
                        pointBorderWidth: lineWidth / 3,
                        //pointBorderColor: line.color,
                        pointBorderColor(ctx, options) {
                            if (!isShowTrendPoint) return line.color;
                            const {
                                dataIndex, // позиция точки (с нуля)
                            } = ctx;
                            if (!line.trend || line.growingArr === null) return line.color;
                            //console.log(dataIndex);
                            if (line.trend) {
                                return line.growingArr[dataIndex] ? "blue" : "red";
                            }
                            return "red";
                        },
                        //Цвет внутри точки
                        pointBackgroundColor(ctx, options) {
                            //console.log(ctx, options);
                            if (!isShowTrendPoint) return line.color;
                            const {
                                dataIndex, // позиция точки (с нуля)
                            } = ctx;
                            if (!line.trend || line.growingArr === null) return line.color;
                            //console.log(dataIndex);
                            if (line.trend) {
                                return line.growingArr[dataIndex] ? "blue" : "red";
                            }
                            return "red";
                        },
                        //borderWidth: mini && !modal ? 1 : 2,
                        borderWidth: lineWidth,

                        data: line.records,
                        tension: Number(`0.${softAngels}`), //soft angels
                        datalabels: {
                            display: !/^тренд/.test(line.name.toLocaleLowerCase()) && showPointData, //отображение данных точки
                            // align: reverseTrend ? "bottom" : "top", //положение подсказки

                            align: "top", //положение подсказки
                            offset: 8 + lineWidth, //отступ от точки
                            color: "black",
                            font: mini && !modal ? { size: 7, weight: 500 } : { size: 12 + lineWidth, weight: 600 },
                            backgroundColor: "white",
                            borderColor: line.color,
                            borderWidth: 2,
                            borderRadius: 4,
                            padding: 2 + lineWidth / 2,
                            clamp: true,

                            textAlign: "center",
                            opacity: 1,
                        },
                    })),
                }}
                onDoubleClick={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    setModal((state) => !state);
                }}
                onContextMenu={(event) => {
                    event.preventDefault();
                    !mini && onCancelMenu();
                }}
            />
        </div>
    );
}
