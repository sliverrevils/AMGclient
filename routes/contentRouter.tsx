import AllPatternsScreen from "@/components/Screens/AllPatterns/AllPaternsScreen";
import ChartFillerScreen from "@/components/Screens/ChartFiller/ChartFiller";
import ControlScreen from "@/components/Screens/ControlScreen/ControlScreen";
import MainScreen from "@/components/Screens/Main/MainScreen";
import OrgScreen from "@/components/Screens/Org/OrgScreen";

import ReportsScreen from "@/components/Screens/ReportScreen/ReportsScreen";
import SettingsScreen from "@/components/Screens/SettingsScreen/SettingsScreen";
import StatisticScreen from "@/components/Screens/StatisticScreen/StatisticScreen";
import Statistics2Screen from "@/components/Screens/Statistics2Screen/Statistics2Screen";
import TablePatternsScreen from "@/components/Screens/TablePatterns/TablePatternsScreen";
import TablesScreen from "@/components/Screens/Tables/TablesScreen";
import UsersScreen from "@/components/Screens/Users/UsersScreen";
import ChartCreatorScreen from "@/components/modules/ChartCreator/ChartCreator";
import ReportNew from "@/components/modules/ReportNew/ReportNew";
import CreateChartList from "@/components/modules/ReportTables/CreateChartsList/CreateChartList";
import CreateRaport2 from "@/components/modules/ReportTables/CreateRaport2/CreateRaport2";

export const accessRoutesArray: Array<{ id: number; name: string; title: string; access: Array<string>; Component?: typeof MainScreen }> = [
    { id: 1, name: "main", title: "Главная", access: ["admin", "user"], Component: MainScreen },
    { id: 2, name: "users", title: "Сотрудники", access: ["admin"], Component: UsersScreen },
    //{ id: 3, title: "📉 Статистики", access: ['admin', 'user'], Component: TablesScreen  },
    { id: 10, name: "tables", title: "Статистики", access: ["admin", "user"], Component: Statistics2Screen },
    //{ id: 3, title: "Таблицы", access: ['admin', 'user'], Component: StatisticScreen },
    // { id: 4, title: "📑 Шаблоны", access: ['admin'], Component: AllPatternsScreen  },
    // { id: 5, title: "📝 Создание шаблона", access: ['admin'], Component: ChartCreatorScreen  },
    //{ id: 6, title: "Добавить статистику", access: ['admin', 'user'], Component: ChartFillerScreen },
    { id: 6, name: "patterns", title: "Шаблоны", access: ["admin"], Component: TablePatternsScreen },
    { id: 7, name: "org", title: "ОРГ схема", access: ["admin", "user"], Component: OrgScreen },
    // { id: 7, title: "ОРГ схема", access: ['admin','user'], Component: OrgScreen2 },
    //{ id: 8, title: "📚 Отчеты", access: ['admin'], Component: ReportsScreen },
    //{ id: 8, title: "📚 Отчеты", access: ["admin"], Component: ReportsScreen },
    { id: 9, name: "raports", title: "Отчеты", access: ["admin"], Component: CreateRaport2 },
    { id: 12, name: "charts", title: "Графики", access: ["admin", "user"], Component: CreateChartList },

    //{ id: 11, title: "📚 Отчеты2", access: ['admin'], Component: ReportNew },
    // { id: 9, title: "🛂 Контроль записей", access: ['admin'], Component: ControlScreen },

    { id: 777, name: "settings", title: "Настройки", access: ["admin", "user"], Component: SettingsScreen },
];
