import AllPatternsScreen from "@/components/Screens/AllPatterns/AllPaternsScreen";
import ChartFillerScreen from "@/components/Screens/ChartFiller/ChartFiller";
import MainScreen from "@/components/Screens/Main/MainScreen";
import OrgScreen from "@/components/Screens/Org/OrgScreen";
import StatisticScreen from "@/components/Screens/StatisticScreen/StatisticScreen";
import UsersScreen from "@/components/Screens/Users/UsersScreen";
import ChartCreatorScreen from "@/components/modules/ChartCreator/ChartCreator";





export const accessRoutesArray: Array<{ id: number, title: string, access: Array<string>, Component?: typeof MainScreen }> = [
    { id: 1, title: "Главная", access: ['admin', 'user'], Component: MainScreen  },
    { id: 2, title: "Сотрудники", access: ['admin'], Component: UsersScreen  },
    { id: 3, title: "Графики", access: ['admin', 'user'], Component: StatisticScreen },
    { id: 4, title: "Шаблоны", access: ['admin'], Component: AllPatternsScreen  },
    { id: 5, title: "Создание шаблона", access: ['admin'], Component: ChartCreatorScreen  },
    { id: 6, title: "Добавить статистику", access: ['admin', 'user'], Component: ChartFillerScreen },
    { id: 7, title: "ОРГ схема", access: ['admin'], Component: OrgScreen },

]

