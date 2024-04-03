import AllPatternsScreen from '@/components/Screens/AllPatterns/AllPaternsScreen';
import ChartFillerScreen from '@/components/Screens/ChartFiller/ChartFiller';
import ControlScreen from '@/components/Screens/ControlScreen/ControlScreen';
import MainScreen from '@/components/Screens/Main/MainScreen';
import OrgScreen from '@/components/Screens/Org/OrgScreen';
import OrgScreen2 from '@/components/Screens/Org/OrgScreen2';
import ReportsScreen from '@/components/Screens/ReportScreen/ReportsScreen';
import StatisticScreen from '@/components/Screens/StatisticScreen/StatisticScreen';
import Statistics2Screen from '@/components/Screens/Statistics2Screen/Statistics2Screen';
import TablePatternsScreen from '@/components/Screens/TablePatterns/TablePatternsScreen';
import TablesScreen from '@/components/Screens/Tables/TablesScreen';
import UsersScreen from '@/components/Screens/Users/UsersScreen';
import ChartCreatorScreen from '@/components/modules/ChartCreator/ChartCreator';
import ReportNew from '@/components/modules/ReportNew/ReportNew';
import CreateChartList from '@/components/modules/ReportTables/CreateChartsList/CreateChartList';

export const accessRoutesArray: Array<{ id: number; title: string; access: Array<string>; Component?: typeof MainScreen }> = [
    { id: 1, title: 'Главная', access: ['admin', 'user'], Component: MainScreen },
    { id: 2, title: '👥 Сотрудники', access: ['admin'], Component: UsersScreen },
    //{ id: 3, title: "📉 Статистики", access: ['admin', 'user'], Component: TablesScreen  },
    { id: 10, title: '📈 Статистики', access: ['admin', 'user'], Component: Statistics2Screen },
    //{ id: 3, title: "Таблицы", access: ['admin', 'user'], Component: StatisticScreen },
    // { id: 4, title: "📑 Шаблоны", access: ['admin'], Component: AllPatternsScreen  },
    // { id: 5, title: "📝 Создание шаблона", access: ['admin'], Component: ChartCreatorScreen  },
    //{ id: 6, title: "Добавить статистику", access: ['admin', 'user'], Component: ChartFillerScreen },
    { id: 6, title: '📅 Шаблоны', access: ['admin'], Component: TablePatternsScreen },
    { id: 7, title: '🏬 ОРГ схема', access: ['admin', 'user'], Component: OrgScreen },
    // { id: 7, title: "ОРГ схема", access: ['admin','user'], Component: OrgScreen2 },
    //{ id: 8, title: "📚 Отчеты", access: ['admin'], Component: ReportsScreen },
    { id: 8, title: '📚 Отчеты', access: ['admin'], Component: ReportsScreen },
    { id: 12, title: '📊 Графики', access: ['admin', 'user'], Component: CreateChartList },
    //{ id: 11, title: "📚 Отчеты2", access: ['admin'], Component: ReportNew },
    // { id: 9, title: "🛂 Контроль записей", access: ['admin'], Component: ControlScreen },
];
