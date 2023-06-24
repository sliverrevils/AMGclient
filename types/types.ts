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
    "descriptions": null,
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
    "administrators": Array<AdministratorI>,
    "descriptions": string,
    "createdAt": string,
    "updatedAt": string,
    "ckp":string,
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
}

export interface OfficeI{
    "id": number,
    "name": string,
    "leadership": number,
    "descriptions": string,
    "departments": Array<DepartmentI>,
    "ckp":string,
}
//CHART PATTERN
export interface FieldI{
    "id": number,
    "name": string,
    "type":string,
    "fieldOptions":object
    "value"?:string|number
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



