//https://saturncloud.io/blog/how-to-draw-a-linear-regression-line-in-chartjs/
function linearRegression(x, y, revtrend = false) {
    var N = x.length;
    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_xx = 0;
    var sum_yy = 0;

    let slopeArr: number[] = [];

    //console.log('🧮 arr values',x)
    for (var i = 0; i < N; i++) {
        sum_x += x[i];
        sum_y += y[i];
        sum_xy += x[i] * y[i];
        sum_xx += x[i] * x[i];
        sum_yy += y[i] * y[i];

        const slopeTemp = ((i + 1) * sum_xy - sum_x * sum_y) / ((i + 1) * sum_xx - sum_x * sum_x);
        slopeArr[i] = isNaN(slopeTemp) ? y[i] : slopeTemp;
    }

    //console.log('SLOPE ARR',slopeArr)

    var slope = (N * sum_xy - sum_x * sum_y) / (N * sum_xx - sum_x * sum_x);
    //console.log('SLOPE ',slope)
    var intercept = (sum_y - slope * sum_x) / N;
    var r = (N * sum_xy - sum_x * sum_y) / Math.sqrt((N * sum_xx - sum_x * sum_x) * (N * sum_yy - sum_y * sum_y));

    var result: any[] = [];
    for (var i = 0; i < N; i++) {
        result.push({ x: x[i], y: slope * x[i] + intercept });
    }

    return {
        result: result,
        slope: slope, //склон
        intercept: intercept, //перехват
        r: r,
        slopeArr,
    };
}

export { linearRegression };
