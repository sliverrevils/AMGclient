import { OrgDepartmentsI, OrgI, OrgOfficeI } from "@/types/orgTypes";
import { createSlice, nanoid } from "@reduxjs/toolkit";
import { StateReduxI } from "./store";
import { OfficeI } from "@/types/types";

const initialState: OrgI = {
    generalDirector: 18,
    offices: [],
};

export const orgSlice = createSlice({
    name: "org",
    initialState,
    reducers: {
        setGeneralDirectorRedux: (state, action) => {
            state.generalDirector = action.payload;
        },
        setOfficesRedux: (state, { payload }: { payload: OfficeI[] }) => {
            state.offices = [...payload];
        },
    },
});

export const {
    reducer: orgReducer,
    actions: {
        setGeneralDirectorRedux,
        setOfficesRedux,
        // addOrgOfficeRedux,
        // deleteOrgOfficeRedux,
        // addOrgDepatmentRedux,
        // addOrgSectionRedux
    },
} = orgSlice;
