//USERS
export interface UserI{
    "userId": number,
    "email": string,
    "post": string,
    "structure": string,
    "role": string,
    "is_verificated": boolean,
    "is_blocked": boolean
}

export interface UserFullI{
    "id": number,
    "email": string,
    "password": string,
    "name": string,
    "post": string,
    "structure": string,
    "is_verificated": boolean,
    "is_blocked": boolean,
    "role": string,
    "createdAt": string,
    "updatedAt": string
}

//ORG
export interface ChartI{
    "id": number,
    "name": string,
    "fields": string,
    "lines": string,
    "access":string,
    "descriptions": null|string,
    "created_by": number,
    "updated_by": number,
}

export interface AdministratorI{
    "id": number,
    "office_id": number,
    "department_id": number,
    "section_id": number,
    "user_id": number,
    "descriptions": string,
    "charts": string,
}

export interface SectionI{
    "id": number,
    "office_id": number,
    "department_id": number,
    "name": string,
    "leadership": number,
    "administrators": Array<AdministratorI>,
    "descriptions": string,
    "createdAt": string,
    "updatedAt": string,
    "ckp":string,
    "mainPattern":number,
    "patterns":number[],
}

export interface DepartmentI{
    "id": number,
    "office_id": number,
    "name": string,
    "code": string,
    "leadership": number,
    "descriptions": string,
    "sections": Array<SectionI>,
    "ckp":string,
    "mainPattern":number,
    "patterns":number[],
}

export interface OfficeI{
    "id": number,
    "name": string,
    "leadership": number,
    "descriptions": string,
    "departments": Array<DepartmentI>,
    "ckp":string,
    "mainPattern":number,
    "patterns":number[],
}
//CHART PATTERN
export interface FieldI{
    "id": number,
    "name": string,
    "type":string,
    "fieldOptions":object
    "value"?:string|number
    "fieldLogic"?:string
}

export interface LineI{
    "id":number,
    "name": string,
    "logicString": string,
    "lineColor": string,
}

export interface ChartPatternI{
    "id":number,
    "name":string,
    "fields": Array<FieldI>,
    "lines": Array<LineI>,
    "access":number[],
    "descriptions": string,
    "created_by": number,
    "updated_by": number,
    "createdAt"?:string,
    "updatedAt"?:string,
    

}

export interface StatisticI{
    "id"?: number,
    "dateStart": number,
    "dateEnd": number,
    "fields": string | any,
    "created_by": number,
    "updated_by"?: number,
    "chart_id": number,
    "descriptions"?: string|null,
    "createdAt"?: string,
    "updatedAt"?: string,
}

export interface StatisticDataRowI {
    name: string,
    value: number | string
}

export interface StatisticWithFieldValuesI extends StatisticI{
    fields:Array<{name:string, value:number|string}>
}

export interface ColumnI {
    name: string,
    logic: string,
    initValue: number | null,
    color: string,
    key:number
}

export type RowI = {   
    key:number,
    value:number|string
}


export interface MenuI{
    show:boolean,
    position:{
        x:number,
        y:number
    }
}

export interface CostumLineI{
    name:string,
    records:number[],
    color:string,
    columnKey:number,
    trend:boolean,
}

export interface MonthI{
    title: string;
    value: number;
    color: string;
}

export interface WeekI{
    title: string;
    titleShort: string;
    value: number;
    color: string;
}

export interface ColumnLineI{
    columnKey:number,
    trend:boolean,
}

export interface TableI{
    id:number,
    name:string,
    createdAt:string,
    created_by:number,
    view_pattern_id:number,
    columns:ColumnI[],
    costumLines:ColumnLineI[],
}

export interface UserAllPatternsIdsI{
    mains: number[],
    additionals: number[],
    viewMains: number[],
    viewAdditionals:number[],
}
export interface PatternsFromI{
    [key:number]:string[],
}
export interface UserAllPatternsI{
    mains: ChartPatternI[],
    additionals: ChartPatternI[],
    viewMains: ChartPatternI[],
    viewAdditionals:ChartPatternI[],
    patternsFrom:PatternsFromI,
}







