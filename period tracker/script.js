$(function () {
    $("#datepicker").datepicker({
        dateFormat: "dd-mm-yy"
        , duration: "fast"
    });
});

const week = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const predictDates = () => {
    let datepicker = document.getElementById("datepicker")
    let uiFirstDate = document.getElementById("nextperiod")
    let uiSecondDate = document.getElementById("nexttonext")
    document.getElementById('cont1').style.display = 'block';
    document.getElementById('cont2').style.display = 'block';
    let period = datepicker.value
    let splits = period.split('-')
    let month = parseInt(splits[1]) - 1
    const lastPeriodDate = new Date(splits[2], month, splits[0])

    lastPeriodDate.setDate(lastPeriodDate.getDate() + 28)
    const nextPeriod = lastPeriodDate
    const nextPeriodMonth = nextPeriod.getMonth() + 1

    uiFirstDate.innerText = week[nextPeriod.getDay()] + ",    " + nextPeriod.getDate() + "/" + nextPeriodMonth + "/" + nextPeriod.getFullYear()
    const temp = lastPeriodDate

    temp.setDate(temp.getDate() + 28)
    const nextToNextPeriod = temp
    const nextToNextMonth = nextToNextPeriod.getMonth() + 1

    uiSecondDate.innerText = week[nextToNextPeriod.getDay()] + ",    " + nextToNextPeriod.getDate() + "/" + nextToNextMonth + "/" + nextToNextPeriod.getFullYear()
}