import { useSelector } from 'react-redux';
import styles from './orgflow.module.scss';
import { StateReduxI } from '@/redux/store';
import { OfficeI, OfficeWithStatsI, RaportTableInfoI, ReportItemI } from '@/types/types';
import useOrg from '@/hooks/useOrg';
import { useEffect, useRef, useState } from 'react';
import ReactFlow, { Controls, Edge, Node } from 'reactflow';
import MyNode from './MyNode/MyNode';
import MyEdge from './MyEdge/MyEdge';
import 'reactflow/dist/style.css';

export default function OrgFlowScreen({ closeFn }: { closeFn: Function }) {
    //VARS
    const nodeTypes = { myNode: MyNode };
    const edgeTypes = { myEdge: MyEdge };

    const BOXSIZE_X = 250;
    const BOXSIZE_Y = 150;
    //ref
    const initRef = useRef(true); //сокращаем количество запросов статистикам
    //STATE
    const [reportsList, setReportList] = useState<ReportItemI[]>([]);
    const [orgWithStats, setOrgWithStats] = useState<OfficeWithStatsI[]>([]);
    //--flow
    const [nodesState, setNodesState] = useState<Node[]>([]);
    const [edgesState, setEdgesState] = useState<Edge[]>([]);

    //HOOKS
    const { getReportList } = useOrg();

    const officesWithLatestPeriodStats = useSelector((state: StateReduxI) => {
        const officesWithLatest = state.org.offices.map((office) => {
            // ЗАМЕНЯЕМ ID СТАТИСТИК НА ПОСЛЕДНИЕ

            const getLatestTable = (id: number) => {
                const currentStat = state.stats.tableStatisticsList.find((stat) => stat.id == id);

                if (currentStat && /@/g.test(currentStat.name)) {
                    const statName = currentStat.name.split('@')[0].trim();
                    const statsArr = state.stats.tableStatisticsList.filter((stat) => stat.name.split('@')[0].trim() == statName).toSorted((a, b) => b.id - a.id);
                    if (statsArr.length) {
                        return statsArr[0].id;
                    } else {
                        return id;
                    }
                }
                return id;
            };

            return {
                ...office,
                mainPattern: getLatestTable(office.mainPattern),
                patterns: office.patterns.map((stat) => getLatestTable(stat)),
                departments: office.departments.map((dep) => ({
                    ...dep,
                    mainPattern: getLatestTable(dep.mainPattern),
                    patterns: dep.patterns.map((stat) => getLatestTable(stat)),
                    sections: dep.sections.map((sec) => ({
                        ...sec,
                        mainPattern: getLatestTable(sec.mainPattern),
                        patterns: sec.patterns.map((stat) => getLatestTable(stat)),
                    })),
                })),
            };
        });

        return officesWithLatest;
    });

    //СОБИРАЕМ ВСЕ ID СТАТИСТИК И ПОЛУЧАЕМ ВСЕ ЭТИ СТАТИСТИКИ
    useEffect(() => {
        if (officesWithLatestPeriodStats.length && !reportsList.length && initRef.current) {
            initRef.current = false;
            let arrTemp: number[] = [];
            officesWithLatestPeriodStats.forEach((office) => {
                arrTemp = [...arrTemp, office.mainPattern, ...office.patterns];
                office.departments.forEach((dep) => {
                    arrTemp = [...arrTemp, dep.mainPattern, ...dep.patterns];
                    dep.sections.forEach((sec) => {
                        arrTemp = [...arrTemp, sec.mainPattern, ...sec.patterns];
                    });
                });
            });

            const currentPatterns = [...new Set(arrTemp.filter((id) => !!id))];
            console.log('👍', officesWithLatestPeriodStats, currentPatterns);
            getReportList(currentPatterns, setReportList);
        }
    }, [officesWithLatestPeriodStats]);

    //КОГДА МАССИВ СТАТИСТИК ПОЛУЧЕН ФОРМИРУЕМ СТЭЙТ ОРГСХЕМЫ И ДОПИСЫВАЕМ ТУДА ДАННЫЕ СТАТИСТИКИ
    useEffect(() => {
        const getStat = (id: number) => reportsList.find((report) => report.id == id)?.dateColumn?.raportInfo || null;
        if (reportsList.length) {
            const res = officesWithLatestPeriodStats.map((office) => ({
                ...office,
                mainPattern: getStat(office.mainPattern),
                patterns: office.patterns.map((id) => getStat(id)),
                departments: office.departments.map((department) => ({
                    ...department,
                    mainPattern: getStat(department.mainPattern),
                    patterns: department.patterns.map((id) => getStat(id)),
                    sections: department.sections.map((section) => ({
                        ...section,
                        mainPattern: getStat(section.mainPattern),
                        patterns: section.patterns.map((id) => getStat(id)),
                    })),
                })),
            }));

            console.log('RES', res as OfficeWithStatsI[]);
            setOrgWithStats(res as OfficeWithStatsI[]);
        }
    }, [reportsList]);

    //КОГДА СПИСОК ОРГСХЕМЫ СО СТАТИСТИКАМИ СФОРМИРОВАН, ФОРМИРУЕМ НОДЫ И ЭДЖИ ДЛЯ ФЛОУ
    useEffect(() => {
        console.log('orgWithStats', orgWithStats);
        if (orgWithStats.length) {
            let nodesTemp: Node[] = [];
            const edgesTemp: Edge[] = [];

            const addNode = (node: Node) => {
                nodesTemp.push(node);
            };

            const addEdge = (edge: Edge) => {
                edgesTemp.push(edge);
            };

            let oficeStartposX = 0;
            orgWithStats.forEach((office, offIdx) => {
                //calc sizes x
                const blocksArr = [1, office.departments.length];
                office.departments.forEach((dep) => blocksArr.push(dep.sections.length));
                // const blocksCount = Math.max(...blocksArr); //количество блоков
                const blocksCount = office.departments.length; //количество блоков

                //add office node
                const currentOffPosX = oficeStartposX + ((blocksCount * BOXSIZE_X) / 2 - BOXSIZE_X / 2);
                const currentOffId = `off_${office.id}`;
                addNode({ id: currentOffId, type: 'myNode', position: { x: currentOffPosX, y: 0 }, data: { ...office, type: 'off' } });

                //add departments node
                let departmentStartX = oficeStartposX;
                office.departments.forEach((department, depIdx) => {
                    const currentDepId = `dep_${department.id}`;
                    addNode({ id: currentDepId, type: 'myNode', position: { x: departmentStartX + depIdx * BOXSIZE_X, y: BOXSIZE_Y }, data: { ...department, type: 'dep' } });
                    addEdge({ id: `${currentOffId}-${currentDepId}`, source: currentOffId, target: currentDepId, type: 'smoothstep', animated: true, style: { strokeWidth: 2, stroke: 'tomato' } });

                    //add sections node
                    department.sections.forEach((section, secIdx) => {
                        const currentSecId = `sec_${section.id}`;
                        addNode({ id: currentSecId, type: 'myNode', position: { x: departmentStartX + depIdx * BOXSIZE_X, y: BOXSIZE_Y * 2 + BOXSIZE_Y * secIdx }, data: { ...section, type: 'sec' } });
                        addEdge({ id: `${currentDepId}-${currentSecId}`, source: currentDepId, target: currentSecId, type: 'smoothstep', animated: true, style: { strokeWidth: 2, stroke: 'blue' } });
                    });
                });

                //set next start position
                oficeStartposX += blocksCount * BOXSIZE_X + 50;
            });
            console.log('NODES', nodesTemp);
            setNodesState(nodesTemp);
            setEdgesState(edgesTemp);
        }
    }, [orgWithStats]);

    useEffect(() => {}, [nodesState]);

    return (
        <div className={styles.mainWrap}>
            {/* <pre style={{ fontSize: 8 }}>{JSON.stringify(reportsList, null, 4)}</pre> */}
            <div className={styles.close} onClick={() => closeFn()}>
                ❌
            </div>

            {nodesState.length && (
                <ReactFlow nodes={nodesState} edges={edgesState} nodeTypes={nodeTypes} edgeTypes={edgeTypes}>
                    <Controls position="bottom-right" />
                </ReactFlow>
            )}
        </div>
    );
}
