var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

var calendarDate = new Date();
var dayImageErrorUrl = "./images/error.png";
var hovering = false;
var loopInc = 0;
var loaded = false;
var myData = {};

function CalendarInit() {
    var url = (window.location != window.parent.location)
    ? document.referrer
    : document.location.href;
    var data={};
    if (url == "https://season.metin2sg.com/"){
        console.log("Seasonal updating...");
        data = seasonData[calendarDate.getMonth() + "" + calendarDate.getFullYear()];
        myData = seasonData;
    } else {
        data = jsonData[calendarDate.getMonth() + "" + calendarDate.getFullYear()];
        myData = jsonData;
    }
    
    //console.log(calendarDate.getMonth());
    if (data === undefined) {
        nextMonth();
        return;
    }

    title = document.getElementById("calendar-monthTitle");
    title.innerHTML = monthNames[calendarDate.getMonth()] + " Calendar";
    /*if (url == "https://season.metin2sg.com/"){
        title.innerHTML = "Under Construction";
    }*/
    title.style.color = "#" + data.tc;
    var textShadow = "0 0 5px #FFF, 0 0 10px #FFF, 0 0 15px #FFF, 0 0 20px aqua, 0 0 30px aqua, 0 0 40px aqua, 0 0 55px aqua, 0 0 75px aqua";
    textShadow = textShadow.replace(/aqua/g, "#" + data.ec);
    title.style.textShadow = textShadow;

    document.getElementById("calendar-hero-img").src = data.som;

    var calendar = document.getElementById("calendar-panel");
    var sidebar = document.getElementById("calendar-sidebar");
    var day;
    var i;
    for (i = 0; i < data.days.length; i++) {
        day = data.days[i];
        calendar.appendChild(CreateDay(day, data));
    }

    if (!loaded) {
        var today = calendarDate.getDate();
        var daysInMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate();
        var exceeds = today + 10 > daysInMonth;
        var day0Count = 0;
        for (i = 0; i < data.days.length; i++) {
            day = data.days[i];
            if (day.d === 0) {
                ++day0Count;
            } else {
                break;
            }
        }
        NextMajorEvent(today, data);
        for (i = today + day0Count + 1; i < (exceeds ? daysInMonth : today + 11) + day0Count; i++) {
            day = data.days[i];
            CreateSidebarDay(day, data.som, sidebar);
        }
        if (exceeds) {
            var nextData = {};
            nextData = myData[calendarDate.getMonth() + 1 + "" + calendarDate.getFullYear()];
            if (nextData !== undefined) {
                var excess = today + 10 - daysInMonth;
                day0Count = 0;
                for (i = 0; i < nextData.days.length; i++) {
                    day = nextData.days[i];
                    if (day.d === 0) {
                        ++day0Count;
                    } else {
                        break;
                    }
                }
                for (i = day0Count; i < excess + day0Count; i++) {
                    day = nextData.days[i];
                    day.month = calendarDate.getMonth() + 1;
                    CreateSidebarDay(day, data.som, sidebar);
                }
            }
        }
    }

    loaded = true;
    nextPrevMonthExists();
}

var dynamicDays = [];

function CreateDay(day, data) {
    var helper = day;
    if (day.e !== undefined) {
        day = day.e[0];
        day.d = helper.d;
    }

    var div = document.createElement("div");
    div.className = "day calendar-container border";

    var el = document.createElement("img");
    el.src = day.i;

    el.onerror = function () {
        dayImgError(this, data);
    };
    div.appendChild(el);

    if (day.d !== 0) {
        el = document.createElement("span");
        el.innerHTML = day.d;
        div.appendChild(el);

        el = document.createElement("span");
        el.innerHTML = day.t;
        el.className = "calendar-event-time";
        div.appendChild(el);

        el = document.createElement("span");
        el.innerHTML = day.n;
        el.className = "calendar-event-name";
        if (day.n.length > 13) {
            el.className += " longText";
        }
        div.appendChild(el);

        if (day.f !== undefined)
            div.classList.add("flip");

        var img;
        if (helper.e !== undefined) {
            div.dataset.index = dynamicDays.length;
            dynamicDays.push(helper);
            helper.div = div;
            if (day.u !== undefined) {
                div.addEventListener("mouseenter", function (obj) {
                    hovering = true;
                    var dd = dynamicDays[obj.target.dataset.index];
                    var img = dd.e[loopInc % dd.e.length].u;
                    if (img && img !== undefined) {
                        document.getElementById("calendar-hero-img").src = img;
                        title.className = "hidden";
                    }
                });

                div.addEventListener("mouseleave", function () {
                    hovering = false;
                    document.getElementById("calendar-hero-img").src = data.som;
                    title.className = "";
                });
            }
            // div.addEventListener("click", function (obj) {
            //     var dd = dynamicDays[obj.target.closest("div").dataset.index];
            //     window.open(dd.e[loopInc % dd.e.length].g, '_blank');
            // });

            var sp = div.getElementsByTagName("span");
            var eventTime = sp[1];
            helper.eventTime = eventTime;
            var eventName = sp[2];
            helper.eventName = eventName;

            img = div.getElementsByTagName("img")[0];

            for (var i = 0; i < helper.e.length; i++) {
                var e = helper.e[i];
                if (i !== 0) {
                    img = document.createElement("img");
                    img.src = e.i;
                    div.appendChild(img);
                }
                e.img = img;
                div.removeChild(img);
            }
            div.insertBefore(helper.e[0].img, div.firstChild);

        } else {
            if (day.u && day.u !== undefined && day.d !== 0) {
                img = document.createElement("img");
                img.src = day.u;
                img.width = "1px";
                img.height = "1px";
                document.getElementById("hiddenContainer").appendChild(img);
                div.addEventListener("mouseenter", function () {
                    document.getElementById("calendar-hero-img").src = day.u;
                    title.className = "hidden";
                });

                div.addEventListener("mouseleave", function () {
                    document.getElementById("calendar-hero-img").src = data.som;
                    title.className = "";
                });
            }
            // div.addEventListener("click", function () {
            //     if (day.g && day.g !== "")
            //         window.open(day.g, '_blank');
            // });
        }
    }

    return div;
}

function CreateSidebarDay(day, som, sidebar) {
    if (day.n === "" || day.d === 0)
        return undefined;
    var li;
    if (day.e !== undefined) {
        var d;
        for (var i = 0; i < day.e.length; i++) {
            if (d !== undefined) {
                if (d.n === day.e[i].n) {
                    li.getElementsByTagName("small")[0].innerHTML += " and " + day.e[i].t + " GMT";
                    continue;
                }
            }
            d = day.e[i];
            d.d = day.d;
            if (day.month !== undefined)
                d.month = day.month;
            li = sidebarEntry(d, som);
            sidebar.appendChild(li);
        }
    } else {
        li = sidebarEntry(day, som);
        sidebar.appendChild(li);
    }
}

function sidebarEntry(day, som) {
    var li = document.createElement("li");
    li.className = "box24";
    var el = document.createElement("a");
    // el.addEventListener("click", function () {
    //     if (day.g && day.g !== "")
    //         window.open(day.g, '_blank');
    // });
    li.appendChild(el);
    var el2 = document.createElement("img");
    el2.src = day.i;
    el2.className = "userAvatarImage";
    el.appendChild(el2);
    var div = document.createElement("div");
    div.className = "sidebarItemTitle";
    li.appendChild(div);
    el2 = document.createElement("h3");
    div.appendChild(el2);
    el = document.createElement("a");
    // el.addEventListener("click", function () {
    //     if (day.g !== "")
    //         window.open(day.g, '_blank');
    // });
    el.innerHTML = day.n;
    el2.appendChild(el);
    el2 = document.createElement("small");
    div.appendChild(el2);
    el2.innerHTML = day.t !== "" ? day.d + " " + monthNames[day.month ? day.month : calendarDate.getMonth()] + " - " : day.d + " " + monthNames[day.month ? day.month : calendarDate.getMonth()];
    if (day.t === "" || day.t === "All Day")
        el2.innerHTML += day.t;
    else
        el2.innerHTML += day.t + " GMT";

    if (day.u && day.u !== undefined) {
        li.addEventListener("mouseenter", function () {
            document.getElementById("calendar-hero-img").src = day.u;
            title.className = "hidden";
        });

        li.addEventListener("mouseleave", function () {
            document.getElementById("calendar-hero-img").src = som;
            title.className = "";
        });
    }
    return li;
}

function dayImgError(el, data) {
    var div = el.parentNode;
    div.removeChild(el);
    div.className += " calendar-img-fail-load";
    el = document.createElement("img");
    el.src = dayImageErrorUrl;
    div.appendChild(el);
}

function previousMonth() {
    var m = calendarDate.getMonth() - 1;
    if (m < 0) {
        calendarDate.setMonth(11);
        calendarDate.setFullYear(calendarDate.getFullYear() - 1);
    } else {
        calendarDate.setMonth(m);
    }
    var date = new Date();
    if (date.getMonth === calendarDate.getMonth()) {
        calendarDate.setUTCDate(date.getUTCDate());
    } else {
        calendarDate.setUTCDate(1);
    }
    ClearContainers();
    CalendarInit();
}
var count = 1;

function nextMonth() {
    if (++count === 5) return;
    var m = calendarDate.getMonth() + 1;
    if (m > 11) {
        calendarDate.setUTCDate(1);
        calendarDate.setMonth(0);
        calendarDate.setFullYear(calendarDate.getFullYear() + 1);
    } else {
        calendarDate.setDate(1);
        calendarDate.setMonth(m);
    }

    var date = new Date();
    if (date.getMonth === calendarDate.getMonth()) {
        calendarDate.setUTCDate(date.getUTCDate());
    } else {
        calendarDate.setUTCDate(1);
    }
    ClearContainers();
    CalendarInit();
}

function ClearContainers() {
    var myNode = document.getElementById("calendar-panel");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
    dynamicDays.splice(0, dynamicDays.length);
}

function nextPrevMonthExists() {
    var m = calendarDate.getMonth() + 1;
    var newDate;
    if (m > 11) {
        newDate = new Date(calendarDate.getFullYear() + 1, 0);
    } else {
        newDate = new Date(calendarDate.getFullYear(), m);
    }
    if (myData[newDate.getMonth() + "" + newDate.getFullYear()] !== undefined) {
        document.getElementById("calendar-next").style.width = "50%";
    } else {
        document.getElementById("calendar-next").style.width = "0px";
    }

    m = calendarDate.getMonth() - 1; // prev
    if (m < 0) {
        newDate = new Date(calendarDate.getFullYear() - 1, 11);
    } else {
        newDate = new Date(calendarDate.getFullYear(), m);
    }

    if (myData[newDate.getMonth() + "" + newDate.getFullYear()] !== undefined) {
        document.getElementById("calendar-prev").style.width = "50%";
    } else {
        document.getElementById("calendar-prev").style.width = "0px";
    }
}

function NextMajorEvent(today, data) {
    var sidebar = document.getElementById("today-sidebar");
    var day = data.days.find(el => el.d == today);
    if (day.e) {
        for (var i = 0; i < day.e.length; i++) {
            day.e[i].d = day.d;
            sidebar.appendChild(sidebarEntry(day.e[i], data.som));
        }
    } else {
        sidebar.appendChild(sidebarEntry(day, data.som));
    }

    day = null;
    sidebar = document.getElementById("tomorrow-sidebar");
    var nextMonth = false;
    var tomorrow = today + 1;
    if (tomorrow > daysInMonth(calendarDate.getMonth() + 1, calendarDate.getFullYear())) {
        data = myData[calendarDate.getMonth() + 1 + "" + calendarDate.getFullYear()];
        tomorrow = 1;
        nextMonth = true;
    }
    day = data.days.find(el => el.d == tomorrow);
    if (day.e) {
        for (var i = 0; i < day.e.length; i++) {
            day.e[i].d = day.d;
            if (nextMonth)
                day.month = calendarDate.getMonth() + 1;
            sidebar.appendChild(sidebarEntry(day.e[i], data.som));
        }
    } else {
        if (nextMonth)
                day.month = calendarDate.getMonth() + 1;
        sidebar.appendChild(sidebarEntry(day, data.som));
    }
    if (nextMonth)
        data = myData[calendarDate.getMonth() + "" + calendarDate.getFullYear()];

    day = null;
    sidebar = document.getElementById("major-sidebar");
    let options = ["Moonlight Box", "Dungeon Masters", "PvM King", "Fishing Extravaganza", "Easter", "Halloween", "Euro Cup"];
    for (i = 0; i < data.days.length; i++) {
        day = data.days[i];
        if (day.d > today) {
            if (day.e) {
                for (var j = 0; j < day.e.length; j++) {
                    if (options.includes(day.e[j].n)) {
                        options = options.filter(v => v !== day.e[j].n);
                        day.e[j].d = day.d;
                        sidebar.appendChild(sidebarEntry(day.e[j], data.som));
                        j = 100;
                        break;
                    }
                }
            } else {
                if (options.includes(day.n)) {
                    options = options.filter(v => v !== day.n);
                    sidebar.appendChild(sidebarEntry(day, data.som));
                }
            }
        }
    }
}

function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}

setInterval(function () {
    if (!hovering) {
        var loop = ++loopInc;
        for (var i = 0; i < dynamicDays.length; i++) {
            var helper = dynamicDays[i];
            var index = loop % helper.e.length;

            helper.eventTime.innerHTML = helper.e[index].t;
            var n = helper.e[index].n;
            helper.eventName.innerHTML = n;

            if (n.length > 13) {
                helper.eventName.className += " longText";
            } else {
                helper.eventName.classList.remove("longText");
            }

            var oldImg = index - 1 < 0 ? helper.e[helper.e.length - 1].img : helper.e[index - 1].img;
            var newImg = helper.e[index].img;

            oldImg.className = "hidden";
            newImg.className = "";
            var div = helper.div;
            div.insertBefore(newImg, div.firstChild);
            if (div.contains(oldImg)) {
                div.removeChild(oldImg);
            }
        }
    }
}, 1000);
