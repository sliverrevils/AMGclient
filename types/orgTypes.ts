import { OfficeI } from "./types"

interface OrgBaseFields{
    key:string,
    name:string,
    leadership:number,
    ckp:string,
    descriptions:string,
    colorBlock:string,
    status:'none'|'selected'|'mouse'
}

export interface OrgI{
    generalDirector:number
    offices:OfficeI[]
}

export interface OrgOfficeI extends OrgBaseFields{
    departments:OrgDepartmentsI[],
}

export interface OrgDepartmentsI extends OrgBaseFields{
    code:string,
    sections:OrgSectionsI[],
}

export interface OrgSectionsI extends OrgBaseFields{
    workers:OrgWorkerI[]
}

export interface OrgWorkerI{
    user:number,

}

