import React from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend, ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";
import faker from "@faker-js/faker";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

type ChartOptionsT = Parameters<typeof Line>[0]["options"];
type ChartDataT = Parameters<typeof Line>[0]["data"];

const options: ChartOptionsT = {
    responsive: true,
    aspectRatio: 1.77, //соотношение сторон

    plugins: {
        // Блок меню линий
        legend: {
            position: "bottom" as const, //позиция блока
            display: true, // Отображение кнопок/линий
            maxHeight: 30,
            title: {
                padding: 200,
            },
            //НАСТРОЙКИ ЯЧЕЙКИ айтем меню
            labels: {
                // boxWidth: 30,
                // boxHeight: 0,
                usePointStyle: true, //Стиль отображения линии
                color: "red", //цвет текста
                pointStyle: "rectRounded",
                // textAlign: "right",
                font: {
                    size: 15,
                    weight: "600",
                },
            },
        },
        //Заголовок графика
        title: {
            display: true,
            text: "Проверочный",
            padding: 10,
            color: "black",
            font: {
                size: 20,
            },
        },
    },

    scales: {
        y: {
            display: true, //Отображение линии
            reverse: true, //Перевернутый график

            //НАСТРОЙКИ ТЕКСТА ПО Y
            ticks: {
                align: "inner", //позиция текста
                color: "red",
                font: {
                    size: 20,
                    weight: "bold",
                    style: "italic",
                    family: "Arial",
                    lineHeight: "0.9px",
                },
            },
        },
        x: {
            display: true,
            //labels: ["dsd", "fdfdf"], тут можно указывать данные по Х

            //НАСТРОЙКИ ТЕКСТА ПО Х
            ticks: {
                font: {
                    size: 12,
                    weight: "bold",
                    style: "italic",
                    family: "Arial",
                    lineHeight: "0.9px",
                },
            },
            grid: {
                color: "red",
                lineWidth: 2,
            },
        },
    },
};

const labels = ["January", "February", "March", "April", "May", "June", "July"];

const data: ChartDataT = {
    labels, // Данные зоголовков по X

    datasets: [
        {
            fill: true, //заполнение цветом
            backgroundColor: "rgba(53, 162, 235, 0.5)", //Цвет заливки фона

            pointStyle: "star", //форма точки
            pointBorderColor: "red", //цвет точки
            pointRadius: 10,
            //pointBorderWidth: 10,

            label: "Dataset 2",
            data: [22, 55, 11, 77, 55, 33, 99], //Данные точек
            borderColor: "rgb(53, 162, 235)", //Цвет линии
            // borderWidth: 3, //толщина линии
            tension: 0.2, //скургление линий
            borderWidth(ctx, options) {
                //console.table(ctx);

                return ctx.active ? 10 : 2;
            },

            //настройки точки
            datalabels: {
                borderRadius: 10, //скругление
                backgroundColor: "white", //фон
                borderColor: "#FF8056", //цвет обводки
                borderWidth: 2, //обводка толщина
                align: "bottom",
                offset(context) {
                    console.log("context", context);
                    context.active && alert(context.dataIndex); //ПРИ НАВЕДЕНИИ МЫШИ НА ТОЧКУ

                    return context.active ? 20 : 1;
                },
                //настройки текста в точке
                font: {
                    style: "oblique",
                    size: 50,
                    weight: 600,
                },
                textStrokeColor: "black",
                textStrokeWidth: 1,
            },
        },
    ],
};

export default function Chart24Test() {
    return <Line options={options} data={data} />;
}
