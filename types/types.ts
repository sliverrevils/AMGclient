//USERS
export interface UserI {
    userId: number;
    email: string;
    post: string;
    structure: string;
    role: string;
    is_verificated: boolean;
    is_blocked: boolean;
}

export interface UserFullI {
    id: number;
    email: string;
    password: string;
    name: string;
    post: string[] | string;
    structure: string;
    is_verificated: boolean;
    is_blocked: boolean;
    role: string;
    createdAt: string;
    updatedAt: string;
}

//ORG
export interface ChartI {
    id: number;
    name: string;
    fields: string;
    lines: string;
    access: string;
    descriptions: null | string;
    created_by: number;
    updated_by: number;
}

export interface AdministratorI {
    id: number;
    office_id: number;
    department_id: number;
    section_id: number;
    user_id: number;
    descriptions: string;
    charts: string;
}

export interface SectionI {
    id: number;
    office_id: number;
    department_id: number;
    name: string;
    leadership: number;
    administrators: Array<AdministratorI>;
    descriptions: string;
    createdAt: string;
    updatedAt: string;
    ckp: string;
    mainPattern: number;
    patterns: number[];
}

export interface StatInfoWithData {
    id: number;
    name: string;
    data: RaportTableInfoI | null;
}
export interface SectionWithStatsI {
    id: number;
    office_id: number;
    department_id: number;
    name: string;
    leadership: number;
    administrators: Array<AdministratorI>;
    descriptions: string;
    createdAt: string;
    updatedAt: string;
    ckp: string;
    mainPattern: StatInfoWithData;
    patterns: StatInfoWithData[];
}

export interface DepartmentI {
    id: number;
    office_id: number;
    name: string;
    code: string;
    leadership: number;
    descriptions: string;
    sections: Array<SectionI>;
    ckp: string;
    mainPattern: number;
    patterns: number[];
}
export interface DepartmentWithStatI {
    id: number;
    office_id: number;
    name: string;
    code: string;
    leadership: number;
    descriptions: string;
    sections: Array<SectionWithStatsI>;
    ckp: string;
    mainPattern: StatInfoWithData;
    patterns: StatInfoWithData[];
}

export interface OfficeI {
    id: number;
    name: string;
    leadership: number;
    descriptions: string;
    departments: Array<DepartmentI>;
    ckp: string;
    mainPattern: number;
    patterns: number[];
}

export interface OfficeWithStatsI {
    id: number;
    name: string;
    leadership: number;
    descriptions: string;
    departments: Array<DepartmentWithStatI>;
    ckp: string;
    mainPattern: StatInfoWithData;
    patterns: StatInfoWithData[];
}

export interface OfficeWithStatsTypeI extends OfficeWithStatsI, SectionWithStatsI {
    type: string;
    setActiveItem: React.Dispatch<React.SetStateAction<ActiveItemI | null>>;
    selected: boolean;
    selectedUserId: null | number;
}

export interface ActiveItemI {
    width: number;
    type: string;
    x: number;
    y: number;
    data: OfficeWithStatsTypeI;
    eventType: string;
}

//CHART PATTERN
export interface FieldI {
    id: number;
    name: string;
    type: string;
    fieldOptions: object;
    value?: string | number;
    fieldLogic?: string;
}

export interface LineI {
    id: number;
    name: string;
    logicString: string;
    lineColor: string;
}

export interface ChartPatternI {
    id: number;
    name: string;
    fields: Array<FieldI>;
    lines: Array<LineI>;
    access: number[];
    descriptions: string;
    created_by: number;
    updated_by: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface StatisticI {
    id?: number;
    dateStart: number;
    dateEnd: number;
    fields: string | any;
    created_by: number;
    updated_by?: number;
    chart_id: number;
    descriptions?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface StatisticDataRowI {
    name: string;
    value: number | string;
}

export interface StatisticWithFieldValuesI extends StatisticI {
    fields: Array<{ name: string; value: number | string }>;
}

export interface ColumnI {
    name: string;
    logic: string;
    initValue: number | null;
    color: string;
    key: number;
}

export type RowI = {
    key: number;
    value: number | string;
};

export interface MenuI {
    show: boolean;
    position: {
        x: number;
        y: number;
    };
}

export interface CostumLineI {
    name: string;
    records: number[];
    color: string;
    columnKey: number;
    trend: boolean;
    fill: boolean;
    growingArr: boolean[] | null;
    notFullDataPeriodTrend?: boolean;
}

export interface MonthI {
    title: string;
    value: number;
    color: string;
}

export interface WeekI {
    title: string;
    titleShort: string;
    value: number;
    color: string;
}

export interface ColumnLineI {
    columnKey: number;
    trend: boolean;
}

export interface TableI {
    id: number;
    name: string;
    createdAt: string;
    created_by: number;
    view_pattern_id: number;
    columns: ColumnI[];
    costumLines: ColumnLineI[];
}

export interface UserAllPatternsIdsI {
    mains: number[];
    additionals: number[];
    viewMains: number[];
    viewAdditionals: number[];
}
export interface PatternsFromI {
    [key: number]: string[];
}
export interface UserAllPatternsI {
    mains: ChartPatternI[];
    additionals: ChartPatternI[];
    viewMains: ChartPatternI[];
    viewAdditionals: ChartPatternI[];
    patternsFrom: PatternsFromI;
}

export interface DatesI {
    start: number;
    end: number;
    warning: boolean;
    description: string;
}

export interface DateColumnI {
    dateStart: number;
    dateEnd: number;
    firstWeekDay: number;
    periodDayCount: number;
    datesArr: DatesI[];
    lastDayOfDatesArr: number;
    type: "2 года плюс текущий" | "Месячный" | "13ти недельный";
    autoRenewal: boolean;
    selectedPattern;
    raportInfo?: RaportTableInfoI;
    isFullPeriod?: boolean;
}

export interface StatRowI {
    id: string;
    descriptions?: string;
    values: {
        id: string;
        value: number | string;
        expression: string;
        editable: boolean;
        message: string;
        descriptions: string;
    }[];
}

export interface StatHeaderI {
    name: string;
    id: string;
    logicStr: string;
    initValue: number;
    showControl: boolean;
    onChart: boolean;
    color?: string;
    fill?: boolean;
}

export interface TablePatternI {
    id: number;
    name: string;
    headers: StatHeaderI[];
}

export interface TableStatisticNotParsedI {
    tableName: string;
    dateStart: number;
    dateEnd: number;
    headers: string;
    rows: string;
    tableDescriptions: string;
    tableDescriptionsName: string;
    columnsWidth: string;
    dateColumn: string;
    about: string;
}
export interface TableStatisticI {
    id?: number;
    tableName: string;
    dateStart: number;
    dateEnd: number;
    headers: StatHeaderI[];
    rows: StatRowI[];
    tableDescriptions: string;
    tableDescriptionsName: string;
    columnsWidth: number[];
    dateColumn: DateColumnI | undefined; // TABLE INFO
    about: string;
}

export interface TableStatisticListItemI {
    id: number;
    name: string;
    dateColumn: DateColumnI;
    lastUpdate: string;
    statFromName: string;
    statFromType: string;
    depCode?: string;
}

export interface StatItemReady extends TableStatisticListItemI {
    filled: boolean;
    main: boolean;
    isGrowing: string;
    periodStr: string;
}

export interface ILogicCell {
    headerId: string;
    logicStr: string;
}

export interface StatItemLogic extends StatItemReady {
    logicStrArr: ILogicCell[];
}

export interface StatItemReadyWithCoords extends StatItemReady {
    type: "chart" | "period" | "table";
    x: number;
    y: number;
}

export interface UserPostsI {
    userOffices: OfficeI[];
    userDepartments: DepartmentI[];
    userSections: SectionI[];
    workerOnSections: SectionI[];
}

export interface IChartPropListItem {
    statId: number;
    name: string;
    costumsLines: CostumLineI[];
    dates: DatesI[];
    reverseTrend: boolean;
}

export interface RaportTableInfoI {
    lastUpdate?: number;
    statFilled: "full" | "notFull" | "clean";

    lastFilledPeriod: DatesI;
    statLastRowValues?: string[];
    statPrevRowValues?: string[];
    statFutureRowValues: string[];
    statHeaders?: string[];
    trendType: string;
    trendStatus: string;
    trendColumnName: string;
    lastRowIndex: number | null;
    chartProps?: {
        costumsLines: CostumLineI[];
        dates: DatesI[];
        clickFunc: () => void;
        reverseTrend: boolean;
    };
}

//CHART LIST
export interface ChartItemI {
    id: number;
    type: "office" | "dep" | "sec";
    itemName: string;
    statType: "main" | "additional";
    leadership: number;
    isClose: boolean;
}

//REP
export interface ReportItemI {
    id: number;
    name: string;
    dateColumn: DateColumnI;
}

// ORG
export interface IOrgItem {
    name: string;
    leadership: number;
    ckp: string;
    descriptions: string;
    id: number;
    itemType: "office" | "department" | "section";
    mainPattern: StatItemReady | undefined;
    patterns: (StatItemReady | undefined)[];
}

export type IMainStyle = "row" | "column";

//PIE CHART
export interface IPieChartProps {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor: string[];
        borderColor: string[];
        borderWidth: number;
    }[];
}

export interface IPieObj {
    [key: string]: IPieChartProps;
}

//DIRECT
export interface IDirectHeader {
    id: string;
    title: string;
    color: string;
}

export interface ITableStat extends TableStatisticListItemI {
    //id: number;
    logicStrArr: ILogicCell[];
    type: "stat";
}

export interface IBlankRow {
    id: string;
    type: "blank";
    values: string[];
}

export interface IDirectTable {
    id: string;
    //item: IDirectOffice;
    officeID: number;
    stats: ITableStat[];
    description: string;
    blankRows: IBlankRow[];
    sortItemsArr: string[];
    // stats: StatItemLogic[];
}

export interface IDirectSectionI {
    id: number;
    office_id: number;
    department_id: number;
    name: string;
    leadership: number;
    administrators: Array<AdministratorI>;
    descriptions: string;
    createdAt: string;
    updatedAt: string;
    ckp: string;

    patterns: (TableStatisticListItemI | undefined)[];
    mainPattern: TableStatisticListItemI | undefined;
    itemType: "office" | "department" | "section";
}

export interface IDirectDepartmentI {
    id: number;
    office_id: number;
    name: string;
    code: string;
    leadership: number;
    descriptions: string;
    sections: Array<IDirectSectionI>;
    ckp: string;

    patterns: (TableStatisticListItemI | undefined)[];
    mainPattern: TableStatisticListItemI | undefined;
    itemType: "office" | "department" | "section";
}

export interface IDirectOffice {
    id: number;
    name: string;
    leadership: number;
    descriptions: string;
    departments: Array<IDirectDepartmentI>;
    ckp: string;

    patterns: (TableStatisticListItemI | undefined)[];
    mainPattern: TableStatisticListItemI | undefined;
    itemType: "office" | "department" | "section";
}

export interface IDirectMembers {
    officeNumber: number;
    userId: number;
    presence: number;
}

export interface IDirectInfoDoc {
    protocol: number;
    date: number;
    chairmanId: number;
    lastProtocol: number;
    strategy: number;
    directFP: number;
    docs: number;
}

export interface IProtocolListItem {
    id: number;
    createdAt: string;
    members: number[];
    protocolNumber: number;
}

export interface IBlankRow {}

export interface ISelectedStatsListItem {
    id?: number;
    name: string;
    selectedStats: string[];
    selectedCharts: string[];
    blankRows: { officeID: number; blankRowsValues: string[][] }[];
}

export interface ILoadedTable {
    officeID: number;
    stats: number[];
    description: string;
    blankRows: IBlankRow[];
}
