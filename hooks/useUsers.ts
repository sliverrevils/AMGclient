import { StateReduxI } from "@/redux/store";
import { ChartPatternI, UserFullI, UserI, UserAllPatternsIdsI, UserAllPatternsI, PatternsFromI, DepartmentI, SectionI, UserPostsI } from "@/types/types";
import { useSelector } from "react-redux";

export default function useUsers() {
    const { offices } = useSelector((state: StateReduxI) => state.org);
    const user: UserI = useSelector((state: any) => state.main.user);
    const { patterns, access } = useSelector((state: StateReduxI) => state.patterns);

    const { users }: { users: UserFullI[] } = useSelector((state: any) => state.users);

    const userByID = (userId: number): UserFullI | undefined => users.find((user) => user.id == userId);

    const userPatterns = (userId: number): UserAllPatternsI => {
        const accessPatternsIds: UserAllPatternsIdsI = {
            mains: [],
            additionals: [],
            viewMains: [],
            viewAdditionals: [],
        };

        const patternsFrom: PatternsFromI = {};

        const addPatternFrom = (pattern_id: number, from: string) => {
            if (patternsFrom?.[pattern_id]) {
                patternsFrom[pattern_id] = [...new Set([...patternsFrom[pattern_id], from])];
            } else {
                patternsFrom[pattern_id] = [from];
            }
        };

        const addSelfPatterns = ({ mainPattern, patterns, name }: { mainPattern: number; patterns: number[]; name: string }) => {
            if (mainPattern) {
                accessPatternsIds.mains = [...new Set([...accessPatternsIds.mains, mainPattern])];
                addPatternFrom(mainPattern, name);
            }
            if (patterns.length) {
                accessPatternsIds.additionals = [...new Set([...accessPatternsIds.additionals, ...patterns])];
                patterns.forEach((pattern_id) => addPatternFrom(pattern_id, name));
            }
        };

        const addViewPatterns = ({ mainPattern, patterns, name }: { mainPattern: number; patterns: number[]; name: string }) => {
            if (mainPattern) {
                accessPatternsIds.viewMains = [...new Set([...accessPatternsIds.viewMains, mainPattern])];
                addPatternFrom(mainPattern, name);
            }
            if (patterns.length) {
                accessPatternsIds.viewAdditionals = [...new Set([...accessPatternsIds.viewAdditionals, ...patterns])];
                addPatternFrom(mainPattern, name);
            }
        };

        offices.forEach((office) => {
            let officeLeader = false;

            if (office.leadership == userId) {
                officeLeader = true;
                addSelfPatterns(office);
            }

            office.departments.forEach((department) => {
                let departmentLeader = false;

                if (department.leadership == userId) {
                    departmentLeader = true;
                    addSelfPatterns(department);
                }
                if (officeLeader) {
                    addViewPatterns(department);
                }

                department.sections.forEach((section) => {
                    let sectionLeader = false;

                    if (section.leadership == userId) {
                        sectionLeader = true;
                        addSelfPatterns(section);
                    }

                    if (officeLeader || departmentLeader) {
                        addViewPatterns(section);
                    }
                });
            });
        });

        const accessPatterns: UserAllPatternsI = {
            mains: [],
            additionals: [],
            viewAdditionals: [],
            viewMains: [],
            patternsFrom,
        };

        Object.keys(accessPatternsIds).forEach((field) => {
            accessPatterns[field] = patterns.filter((pattern) => accessPatternsIds[field].includes(pattern.id));
        });

        //console.log("ACCESS 🔐\n", accessPatterns);

        return accessPatterns;

        // if(access[id] as number[]){
        //     const userPatterns=patterns.filter(pattern=>access[id].includes(pattern.id))
        //     return userPatterns
        // }else{
        //     return []
        // }
    };

    const getUserPosts = (userId: number): UserPostsI => {
        //GEN DIR

        // OFFICES SERACH
        const userOffices = offices.filter((office) => office.leadership == userId);

        // DEPATMENTS SEARCH
        let userDepartments: DepartmentI[] = [];
        offices.forEach((office) => {
            userDepartments = [...userDepartments, ...office.departments.filter((department) => department.leadership == userId)];
        });

        // SECTION SERCH
        let userSections: SectionI[] = [];
        let workerOnSections: SectionI[] = [];
        offices.forEach((office) =>
            office.departments.forEach((department) => {
                userSections = [...userSections, ...department.sections.filter((section) => section.leadership == userId)];
                department.sections.forEach((section) => {
                    if (section.administrators.some((admin) => admin.user_id == userId)) {
                        workerOnSections = [...workerOnSections, section];
                    }
                });
            })
        );

        const result = {
            userOffices,
            userDepartments,
            userSections,
            workerOnSections,
        };
        return result;
    };

    return { users, userByID, userPatterns, getUserPosts };
}
